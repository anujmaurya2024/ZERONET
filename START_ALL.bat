@echo off
echo ========================================
echo   Starting Zeronet (Spring Boot + React)
echo ========================================

echo [1/2] Starting Java Spring Boot Backend...
start "Zeronet Backend (Spring Boot)" cmd /k "cd backend && mvn spring-boot:run"

echo [2/2] Starting React Frontend...
start "Zeronet Frontend (Vite)" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo ========================================
pause
