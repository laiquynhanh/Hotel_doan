@echo off
echo Cleaning Vite cache...
rmdir /s /q "node_modules\.vite"
rmdir /s /q "node_modules\.vite-temp"

echo Cleaning up build files...
rmdir /s /q dist
del /f /q ".vite\*"

echo Installing dependencies...
call npm install

echo Building project...
call npm run build

echo Starting dev server...
call npm run dev