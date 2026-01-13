// Use SHA-256 hash of your password for security
// Generate hash at: https://emn178.github.io/online-tools/sha256.html
// Example: if password is "mySecurePass123", store its SHA-256 hash below
const PASSWORD_HASH = "0fd07c483999f506fee95971a4bef2001703e45f9229630fe6e5a945b5bbf753";

// Encryption key will be derived from the password
let encryptionKey = null;

async function deriveKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('drive-salt-2026'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    const input = document.getElementById('password').value;
    const hashedInput = await hashPassword(input);
    
    if (hashedInput === PASSWORD_HASH) {
        encryptionKey = await deriveKey(input);
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('userPassword', input);
        showDrive();
    } else {
        document.getElementById('error-message').textContent = 'Incorrect password';
        document.getElementById('password').value = '';
    }
}

function showDrive() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('drive-container').style.display = 'block';
    loadFiles();
}

function logout() {
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('userPassword');
    encryptionKey = null;
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('drive-container').style.display = 'none';
    document.getElementById('password').value = '';
}

async function loadFiles() {
    const filesContainer = document.getElementById('files');
    filesContainer.innerHTML = '<p>Loading files...</p>';
    
    try {
        // Fetch files from GitHub API
        const response = await fetch('https://api.github.com/repos/alejandromoralwork/drive/contents/files');
        
        if (!response.ok) {
            throw new Error('Failed to fetch files from repository');
        }
        
        const githubFiles = await response.json();
        
        // Filter only .enc files
        const encryptedFiles = githubFiles.filter(file => file.name.endsWith('.enc'));
        
        if (encryptedFiles.length === 0) {
            filesContainer.innerHTML = '<p>No encrypted files found in the repository.</p>';
            return;
        }
        
        // Map to our file structure
        const files = encryptedFiles.map(file => ({
            name: file.name.replace('.enc', ''),
            path: file.download_url,
            size: formatBytes(file.size),
            date: 'N/A'
        }));
        
        filesContainer.innerHTML = files.map(file => `
            <div class="file-item">
                <div>
                    <strong>${file.name}</strong><br>
                    <small>${file.size}</small>
                </div>
                <button onclick="downloadFile('${file.path}', '${file.name}', event)">Download</button>
            </div>
        `).join('');
    } catch (error) {
        filesContainer.innerHTML = `<p style="color: red;">Error loading files: ${error.message}</p>`;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function downloadFile(filepath, filename, event) {
    const button = event ? event.target : null;
    
    try {
        if (button) {
            button.textContent = 'Decrypting...';
            button.disabled = true;
        }

        // Fetch encrypted file from GitHub
        const response = await fetch(filepath);
        if (!response.ok) {
            throw new Error('File not found on GitHub. Make sure the encrypted file is pushed to the repository.');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Get password
        const password = sessionStorage.getItem('userPassword');
        if (!password) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Check if it's OpenSSL format (starts with "Salted__")
        const isOpenSSL = bytes.length > 8 && 
                         String.fromCharCode(...bytes.slice(0, 8)) === 'Salted__';
        
        let decryptedData;
        
        if (isOpenSSL) {
            // OpenSSL format: "Salted__" + 8-byte salt + encrypted data
            const salt = bytes.slice(8, 16);
            const ciphertext = bytes.slice(16);
            
            // Derive key and IV using PBKDF2 (matching OpenSSL's -pbkdf2 -iter 100000)
            const passwordBytes = new TextEncoder().encode(password);
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBytes,
                'PBKDF2',
                false,
                ['deriveBits']
            );
            
            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                384 // 32 bytes key + 16 bytes IV = 48 bytes * 8
            );
            
            const derived = new Uint8Array(derivedBits);
            const key = derived.slice(0, 32);  // 256-bit key
            const iv = derived.slice(32, 48);   // 128-bit IV
            
            // Import the key for AES-CBC
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'AES-CBC' },
                false,
                ['decrypt']
            );
            
            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-CBC', iv: iv },
                cryptoKey,
                ciphertext
            );
            
            decryptedData = new Uint8Array(decrypted);
        } else {
            // Decrypt using Web Crypto API (AES-GCM format from Python script)
            if (!encryptionKey) {
                encryptionKey = await deriveKey(password);
            }
            
            const iv = arrayBuffer.slice(0, 12);
            const data = arrayBuffer.slice(12);
            
            decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                encryptionKey,
                data
            );
        }
        
        // Create download link
        const blob = new Blob([decryptedData]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        if (button) {
            button.textContent = 'Download';
            button.disabled = false;
        }
    } catch (error) {
        alert('Error downloading file: ' + error.message);
        console.error('Decryption error:', error);
        if (button) {
            button.textContent = 'Download';
            button.disabled = false;
        }
    }
}

// Check if already authenticated
window.onload = async function() {
    if (sessionStorage.getItem('authenticated') === 'true') {
        const password = sessionStorage.getItem('userPassword');
        if (password) {
            encryptionKey = await deriveKey(password);
        }
        showDrive();
    }
    
    // Allow Enter key to submit password
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
};
