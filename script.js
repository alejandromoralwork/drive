// Use SHA-256 hash of your password for security
// Generate hash at: https://emn178.github.io/online-tools/sha256.html
// Example: if password is "mySecurePass123", store its SHA-256 hash below
const PASSWORD_HASH = "0fd07c483999f506fee95971a4bef2001703e45f9229630fe6e5a945b5bbf753";

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
        sessionStorage.setItem('authenticated', 'true');
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
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('drive-container').style.display = 'none';
    document.getElementById('password').value = '';
}

function loadFiles() {
    // Example files - replace with your actual file list
    const files = [
        { name: 'Document1.pdf', size: '2.5 MB', date: '2026-01-10' },
        { name: 'Image.jpg', size: '1.2 MB', date: '2026-01-12' },
        { name: 'Notes.txt', size: '45 KB', date: '2026-01-13' }
    ];
    
    const filesContainer = document.getElementById('files');
    filesContainer.innerHTML = files.map(file => `
        <div class="file-item">
            <div>
                <strong>${file.name}</strong><br>
                <small>${file.size} - ${file.date}</small>
            </div>
            <button onclick="downloadFile('${file.name}')">Download</button>
        </div>
    `).join('');
}

function downloadFile(filename) {
    alert(`Downloading: ${filename}`);
    // Add actual download logic here
}

// Check if already authenticated
window.onload = function() {
    if (sessionStorage.getItem('authenticated') === 'true') {
        showDrive();
    }
    
    // Allow Enter key to submit password
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
};