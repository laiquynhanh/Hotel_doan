@echo off
echo Cleaning Vite cache...
rmdir /s /q node_modules\.vite
rmdir /s /q node_modules\.vite-temp

echo Installing dependencies...
npm install react-router-dom @mui/material @emotion/react @emotion/styled formik yup axios

echo Cleaning and starting dev server...
npm run dev