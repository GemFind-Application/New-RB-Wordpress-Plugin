# GemFind Ring Builder — build all frontend bundles (admin + v2 + v1)
# Usage: .\build.ps1
#        .\build.ps1 -Target admin
#        .\build.ps1 -Target v2,v1

param(
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "GemFind Ring Builder build" -ForegroundColor Cyan

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not on PATH."
}

Write-Host "Installing dependencies (if needed)..." -ForegroundColor Yellow
npm run install:all
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($Target -eq "all") {
    npm run build
} else {
    $parts = $Target.Split(",") | ForEach-Object { $_.Trim().ToLower() }
    node scripts/build-all.cjs @parts
}

exit $LASTEXITCODE
