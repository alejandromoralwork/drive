# Public File Drive

A simple, open-access file sharing platform hosted on GitHub Pages.

## Features

- 📂 No authentication required
- 🌐 Automatic file discovery from GitHub
- 📱 Responsive design
- 🎨 Beautiful file cards with icons
- ⚡ Fast downloads directly from GitHub

## Setup

1. **Create a public files folder:**
   ```bash
   mkdir public
   ```

2. **Add your public files:**
   ```bash
   cp your-file.pdf public/
   ```

3. **Push to GitHub:**
   ```bash
   git add public/
   git commit -m "Add public files"
   git push origin main
   ```

4. **Access your public drive:**
   - URL: `https://alejandromoralwork.github.io/drive/public.html`

## Usage

### Adding Files

Simply place any files you want to share in the `public/` folder:

```bash
# Add a single file
cp document.pdf public/

# Add multiple files
cp *.pdf public/

# Push changes
git add public/
git commit -m "Add new files"
git push origin main
```

### Removing Files

```bash
git rm public/old-file.pdf
git commit -m "Remove old file"
git push origin main
```

### File Types Supported

All file types are supported with automatic icon detection:
- Documents (PDF, DOC, TXT, MD)
- Images (JPG, PNG, GIF, SVG)
- Videos (MP4, AVI, MKV)
- Audio (MP3, WAV, OGG)
- Archives (ZIP, RAR, TAR, GZ)
- Code files (JS, PY, HTML, CSS)
- Spreadsheets (XLS, XLSX, CSV)
- Presentations (PPT, PPTX)

## Links

- **Private Drive**: `https://alejandromoralwork.github.io/drive/`
- **Public Drive**: `https://alejandromoralwork.github.io/drive/public.html`

## Notes

- Files are served directly from GitHub
- No file size encryption overhead
- Maximum file size: 100 MB (GitHub limit)
- Files are publicly accessible to anyone with the link
