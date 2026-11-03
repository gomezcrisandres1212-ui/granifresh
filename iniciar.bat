@echo off
title FROST GLACIAL - Granizados a Domicilio (Spring Boot)
color 0B
cls
echo ============================================================
echo      FROST GLACIAL - GRANIZADOS ARTESANALES A DOMICILIO
echo            Spring Boot 3.2.5 + MongoDB + JWT
echo ============================================================
echo.
echo [*] Iniciando el servidor backend en http://localhost:8080 ...
echo [*] Acceso Admin:
echo     - Usuario:    admin
echo     - Contrasena: admin123
echo.
echo [*] Presiona Ctrl + C en cualquier momento para detener.
echo ============================================================
echo.

call mvn spring-boot:run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] No se pudo ejecutar 'mvn spring-boot:run'.
    echo Verifica que tengas Java 17+ y Apache Maven instalados en tu PATH.
    echo.
    pause
)

