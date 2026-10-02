@echo off
title LegacyVault SWP391 Prototype Launcher
echo =========================================================================
echo       LEGACYVAULT - HE THONG LUU GIU VA BAN GIAO DI SAN SO (SWP391)
echo               Prototype & Technology Testbench Launcher
echo =========================================================================
echo.

echo [1/2] Khoi dong Backend ASP.NET Core 8 Web API (Port 5000)...
start "LegacyVault Backend API" cmd /k "cd server\LegacyVault.Prototype.WebApi && dotnet run"

timeout /t 3 /nobreak >nul

echo [2/2] Khoi dong Frontend React 19 + Vite (Port 5073)...
start "LegacyVault Frontend App" cmd /k "cd client && npm run dev"

echo.
echo =========================================================================
echo  He thong da duoc khoi dong thanh cong!
echo  - Frontend Testbench UI: http://localhost:5073
echo  - Backend Swagger Docs : http://localhost:5000/swagger
echo =========================================================================
echo.
pause
