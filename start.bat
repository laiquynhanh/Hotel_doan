@echo off
rem start both backend and frontend in separate cmd windows
setlocal
set "ROOT=%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-21"

rem Check if Java exists
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo Error: Java not found at %JAVA_HOME%
    echo Please make sure Java 21 is installed at %JAVA_HOME%
    pause
    exit /b 1
)

echo Found Java at: %JAVA_HOME%
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Root folder: %ROOT%
echo Cleaning and rebuilding Backend...
cd /d %ROOT%BE_hotel

echo Starting Backend in a new window (profile: mysql)...
start "BE_hotel" cmd /k "cd /d %ROOT%BE_hotel && .\gradlew.bat bootRun -Dspring-boot.run.profiles=mysql"
timeout /t 1 >nul
echo Starting Frontend in a new window...
start "FE_hotel" cmd /k "cd /d %ROOT%FE_hotel && npm run dev"
endlocal
