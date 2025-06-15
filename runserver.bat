@echo off

wsl --status >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing WSL...
    wsl --install
    echo Reboot your system to complete the WSL installation, and then run this script again.
    pause
    exit /b
)


for /f "tokens=*" %%i in ('wsl.exe -l -v') do (
    echo %%i | findstr /i "Ubuntu" >nul
    if %errorlevel% equ 0 (
        echo Ubuntu is already installed.
        goto ubuntuInstalled
    )
)

echo Installing Ubuntu...
wsl.exe --install -d Ubuntu
echo Reboot your system to complete the Ubuntu installation and then run this script again.
pause
exit /b

:ubuntuInstalled
echo Waiting for WSL to finish starting...

:waitLoop
wsl.exe -l -v >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto waitLoop
)

wsl.exe sh runserver.sh