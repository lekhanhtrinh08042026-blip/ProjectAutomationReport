@echo off
setlocal
cd /d "%~dp0"
echo.
echo ===========================================
echo   AUTOMATION REPORT - LOCAL WEB APP
echo ===========================================
echo.
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:5500"
  py -m http.server 5500 --directory public
  goto :end
)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:5500"
  python -m http.server 5500 --directory public
  goto :end
)
echo Python chua duoc cai dat hoac chua co trong PATH.
echo Cai Python 3 tu python.org, sau do chay lai start-local.bat.
pause
:end
endlocal
