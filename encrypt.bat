@echo off
REM File Encryption Script for Private Drive (Windows)
REM This script encrypts files using AES-256 encryption with your password

echo ==========================================
echo    Private Drive File Encryption Tool
echo ==========================================
echo.

REM Check if files are provided
if "%~1"=="" (
    echo Usage: encrypt.bat file1 file2 ...
    echo Example: encrypt.bat document.pdf image.jpg
    exit /b 1
)

REM Check if openssl is available
where openssl >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: OpenSSL is not installed or not in PATH
    echo.
    echo Install OpenSSL from:
    echo   - https://slproweb.com/products/Win32OpenSSL.html
    echo   - Or use: winget install -e --id ShiningLight.OpenSSL
    echo.
    exit /b 1
)

REM Create files directory if it doesn't exist
if not exist "files" mkdir files

REM Prompt for password
set /p "PASSWORD=Enter encryption password (same as your drive password): "

if "%PASSWORD%"=="" (
    echo Error: Password cannot be empty
    exit /b 1
)

REM Confirm password
set /p "PASSWORD_CONFIRM=Confirm password: "

if not "%PASSWORD%"=="%PASSWORD_CONFIRM%" (
    echo Error: Passwords do not match
    exit /b 1
)

REM Initialize counters
set SUCCESS_COUNT=0
set FAILED_COUNT=0

REM Process each file
:loop
if "%~1"=="" goto summary

if not exist "%~1" (
    echo Warning: Skipping %~1 (file not found^)
    set /a FAILED_COUNT+=1
    shift
    goto loop
)

echo Encrypting: %~nx1...

REM Encrypt using AES-256-CBC with PBKDF2
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "%~1" -out "files\%~nx1.enc" -k %PASSWORD% 2>nul

if %errorlevel% equ 0 (
    echo [OK] Encrypted: files\%~nx1.enc
    
    REM Delete the original unencrypted file
    del "%~1" >nul 2>&1
    if %errorlevel% equ 0 (
        echo     -^> Deleted original: %~1
    )
    
    set /a SUCCESS_COUNT+=1
) else (
    echo [FAIL] Failed to encrypt: %~1
    set /a FAILED_COUNT+=1
)

shift
goto loop

:summary
echo.
echo ==========================================
echo Encryption Summary:
echo   Success: %SUCCESS_COUNT%
echo   Failed:  %FAILED_COUNT%
echo ==========================================
echo.

if %SUCCESS_COUNT% gtr 0 (
    echo Next steps:
    echo 1. Review encrypted files in the 'files\' directory
    echo 2. Add to git: git add files/
    echo 3. Commit: git commit -m "Add encrypted files"
    echo 4. Push: git push origin main
)

pause
