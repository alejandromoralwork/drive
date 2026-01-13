# Private Drive 🔒

A secure, password-protected file storage system with client-side encryption hosted on GitHub Pages.

## Features

- 🔐 Client-side AES-256-GCM encryption
- 🔑 Password-based authentication with SHA-256 hashing
- 📁 Dynamic file loading from GitHub repository
- 🌐 Hosted on GitHub Pages (free)
- 💾 Automatic file decryption on download

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/alejandromoralwork/drive.git
cd drive
```

### 2. Set Your Password

1. Go to https://emn178.github.io/online-tools/sha256.html
2. Enter your desired password
3. Copy the SHA-256 hash
4. Replace `PASSWORD_HASH` in `script.js` with your hash

### 3. Encrypt Your Files

#### On Linux/macOS:

```bash
chmod +x encrypt.sh
./encrypt.sh file1.pdf file2.jpg file3.txt
```

#### On Windows:

```cmd
encrypt.bat file1.pdf file2.jpg file3.txt
```

#### Using the Web Tool (Alternative):

Open `encrypt-tool.html` in your browser and follow the instructions.

### 4. Upload Encrypted Files

```bash
git add files/
git commit -m "Add encrypted files"
git push origin main
```

### 5. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → `/root`
4. Click Save

Your drive will be available at: `https://alejandromoralwork.github.io/drive/`

## Usage

### Adding New Files

1. Encrypt the file using the encryption script:
   ```bash
   ./encrypt.sh newfile.pdf
   ```

2. Push to GitHub:
   ```bash
   git add files/
   git commit -m "Add new file"
   git push origin main
   ```

3. The file will automatically appear in your drive interface

### Quick Encrypt (One-Line Command)

Encrypt a file without using the script:

**Linux/macOS:**
```bash
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in yourfile.pdf -out files/yourfile.pdf.enc
```

**With password in command:**d
```bash
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in yourfile.pdf -out files/yourfile.pdf.enc -k "YOUR_PASSWORD"
```

### Quick Decrypt (Download from Terminal)

Download and decrypt a file directly from your GitHub repository:

**Interactive (asks for password):**
```bash
curl -sL "https://raw.githubusercontent.com/alejandromoralwork/drive/main/files/yourfile.pdf.enc" | \
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 > yourfile.pdf
```

**With password in command:**
```bash
curl -sL "https://raw.githubusercontent.com/alejandromoralwork/drive/main/files/yourfile.pdf.enc" | \
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -k "YOUR_PASSWORD" > yourfile.pdf
```

**Create an alias for easier use:**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias drive-get='function _drive_get(){ curl -sL "https://raw.githubusercontent.com/alejandromoralwork/drive/main/files/$1.enc" | openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 > "$1"; }; _drive_get'

# Usage:
drive-get yourfile.pdf
# Then enter your password when prompted
```

### Accessing Files

1. Visit your GitHub Pages URL
2. Enter your password
3. Click on any file to download and decrypt it

## Security Notes

⚠️ **Important Security Considerations:**

- This provides **client-side encryption** - files are encrypted before upload
- The password hash is visible in the source code (provides obscurity, not true security)
- For sensitive data, consider using a backend service with proper authentication
- Keep your password secure and use a strong, unique password
- The encryption uses AES-256-GCM with PBKDF2 key derivation (100,000 iterations)

## Requirements

### For Encryption Scripts:

- **Linux/macOS**: OpenSSL (usually pre-installed)
- **Windows**: OpenSSL
  - Install from: https://slproweb.com/products/Win32OpenSSL.html
  - Or use: `winget install -e --id ShiningLight.OpenSSL`

## File Structure

```
drive/
├── index.html          # Main page
├── script.js           # Application logic
├── styles.css          # Styling
├── encrypt.sh          # Linux/macOS encryption script
├── encrypt.bat         # Windows encryption script
├── encrypt-tool.html   # Browser-based encryption tool
├── files/              # Encrypted files directory
│   ├── file1.pdf.enc
│   └── file2.jpg.enc
└── README.md           # This file
```

## Troubleshooting

### Files not showing up?

- Check that files are in the `files/` directory
- Ensure files have `.enc` extension
- Verify files are pushed to GitHub

### Can't decrypt files?

- Ensure you're using the same password for encryption and login
- Check that PASSWORD_HASH in script.js matches your password's SHA-256 hash

### OpenSSL not found?

- **Linux**: `sudo apt-get install openssl`
- **macOS**: `brew install openssl`
- **Windows**: Install from the link above

## License

MIT License - Feel free to use and modify as needed.
