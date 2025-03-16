@echo off
echo Iniciando servidor FRP...
start "FRP Server" cmd /k "cd C:\frp && .\frps.exe -c D:\nextProject\voltAdmin\scripts\frp.ini"

echo Iniciando cliente FRP...
start "FRP Client" cmd /k "cd D:\nextProject\voltAdmin && npm run frp"

echo Iniciando aplicación Next.js...
cd D:\nextProject\voltAdmin
npm run dev 