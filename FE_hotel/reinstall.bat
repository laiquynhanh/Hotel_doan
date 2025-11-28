@echo off
echo Cleaning up...
rmdir /s /q node_modules
del /f /q package-lock.json

echo Installing dependencies...
npm install

echo Starting dev server...
npm run dev