#!/bin/bash

# File Encryption Script for Private Drive
# This script encrypts files using AES-256-GCM encryption with your password

echo "=========================================="
echo "   Private Drive File Encryption Tool"
echo "=========================================="
echo ""

# Check if openssl is installed
if ! command -v openssl &> /dev/null; then
    echo "Error: openssl is not installed."
    echo "Install it using:"
    echo "  - Ubuntu/Debian: sudo apt-get install openssl"
    echo "  - macOS: brew install openssl"
    exit 1
fi

# Check if files are provided
if [ $# -eq 0 ]; then
    echo "Usage: ./encrypt.sh <file1> <file2> ..."
    echo "Example: ./encrypt.sh document.pdf image.jpg"
    exit 1
fi

# Create files directory if it doesn't exist
mkdir -p files

# Prompt for password
echo "Enter encryption password (same as your drive password):"
read -s PASSWORD
echo ""

if [ -z "$PASSWORD" ]; then
    echo "Error: Password cannot be empty"
    exit 1
fi

# Confirm password
echo "Confirm password:"
read -s PASSWORD_CONFIRM
echo ""

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    echo "Error: Passwords do not match"
    exit 1
fi

# Process each file
SUCCESS_COUNT=0
FAILED_COUNT=0

for FILE in "$@"; do
    if [ ! -f "$FILE" ]; then
        echo "⚠️  Skipping: $FILE (file not found)"
        ((FAILED_COUNT++))
        continue
    fi
    
    FILENAME=$(basename "$FILE")
    OUTPUT="files/${FILENAME}.enc"
    
    echo "Encrypting: $FILENAME..."
    
    # Encrypt using AES-256-CBC (compatible with Web Crypto API approach)
    # Note: For exact Web Crypto API compatibility, we need to use a custom approach
    # This creates a simple encrypted file that can be decrypted with the password
    
    # Generate a random salt
    SALT=$(openssl rand -hex 16)
    
    # Derive key using PBKDF2 (matching the JS implementation)
    KEY=$(echo -n "$PASSWORD" | openssl enc -aes-256-cbc -S "$SALT" -pbkdf2 -iter 100000 -P | grep key= | cut -d'=' -f2)
    
    # Encrypt the file
    if openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "$FILE" -out "$OUTPUT" -pass pass:"$PASSWORD"; then
        SIZE=$(du -h "$OUTPUT" | cut -f1)
        echo "✓ Encrypted: $OUTPUT ($SIZE)"
        ((SUCCESS_COUNT++))
    else
        echo "✗ Failed to encrypt: $FILE"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "=========================================="
echo "Encryption Summary:"
echo "  Success: $SUCCESS_COUNT"
echo "  Failed:  $FAILED_COUNT"
echo "=========================================="
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo "Next steps:"
    echo "1. Review encrypted files in the 'files/' directory"
    echo "2. Add to git: git add files/"
    echo "3. Commit: git commit -m 'Add encrypted files'"
    echo "4. Push: git push origin main"
fi
