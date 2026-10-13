@echo off
chcp 65001 > nul
title Ader Sales Telegram Bot
echo ======================================================
echo          تشغيل بوت مبيعات أَدِرْ (Ader Bot)
echo ======================================================
echo.

:: التأكد من وجود node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js غير مثبت على جهازك! يرجى تثبيته أولاً.
    pause
    exit /b
)

:: التأكد من تثبيت الحزم
if not exist "node_modules" (
    echo [INFO] تثبيت المكتبات لأول مرة...
    npm install
)

echo.
echo [START] جاري تشغيل البوت...
echo اضغط Ctrl+C لإيقاف البوت في أي وقت.
echo ======================================================
echo.

node bot.js
pause
