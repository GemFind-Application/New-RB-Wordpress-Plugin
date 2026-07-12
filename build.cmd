@echo off
REM GemFind Ring Builder — build all frontend bundles (admin + v2 + v1)
REM Usage: build.cmd
REM        build.cmd admin
REM        build.cmd v2 v1

cd /d "%~dp0"

echo GemFind Ring Builder build

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm is not installed or not on PATH.
  exit /b 1
)

echo Installing dependencies (if needed)...
call npm run install:all
if errorlevel 1 exit /b 1

if "%~1"=="" (
  call npm run build
) else (
  node scripts/build-all.cjs %*
)

exit /b %ERRORLEVEL%
