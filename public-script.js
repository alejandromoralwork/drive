// Configuration
const REPO_OWNER = 'alejandromoralwork';
const REPO_NAME = 'drive';
const PUBLIC_FILES_FOLDER = 'public';

// Load files on page load
window.onload = function() {
    loadFiles();
};

async function loadFiles() {
    const filesContainer = document.getElementById('files');
    filesContainer.innerHTML = '<p class="loading">Loading files...</p>';
    
    try {
        // Fetch files from GitHub API
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PUBLIC_FILES_FOLDER}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                filesContainer.innerHTML = '<p class="error">No files folder found. Create a "public" folder in your repository.</p>';
                return;
            }
            throw new Error('Failed to fetch files from repository');
        }
        
        const githubFiles = await response.json();
        
        // Filter out directories, only show files
        const files = githubFiles.filter(file => file.type === 'file');
        
        if (files.length === 0) {
            filesContainer.innerHTML = '<p class="loading">No files available yet.</p>';
            return;
        }
        
        // Render files
        filesContainer.innerHTML = files.map(file => {
            const icon = getFileIcon(file.name);
            const size = formatBytes(file.size);
            
            return `
                <div class="file-card">
                    <div class="file-icon">${icon}</div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${size}</div>
                    <button class="download-btn" onclick="downloadFile('${file.download_url}', '${file.name}')">
                        Download
                    </button>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading files:', error);
        filesContainer.innerHTML = `<p class="error">Error loading files: ${error.message}</p>`;
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const icons = {
        // Documents
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'txt': '📝',
        'md': '📝',
        
        // Images
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'svg': '🖼️',
        'webp': '🖼️',
        
        // Videos
        'mp4': '🎥',
        'avi': '🎥',
        'mkv': '🎥',
        'mov': '🎥',
        
        // Audio
        'mp3': '🎵',
        'wav': '🎵',
        'ogg': '🎵',
        'flac': '🎵',
        
        // Archives
        'zip': '📦',
        'rar': '📦',
        'tar': '📦',
        'gz': '📦',
        '7z': '📦',
        
        // Code
        'js': '💻',
        'py': '💻',
        'java': '💻',
        'cpp': '💻',
        'html': '💻',
        'css': '💻',
        
        // Spreadsheets
        'xls': '📊',
        'xlsx': '📊',
        'csv': '📊',
        
        // Presentations
        'ppt': '📊',
        'pptx': '📊'
    };
    
    return icons[ext] || '📁';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadFile(url, filename) {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
