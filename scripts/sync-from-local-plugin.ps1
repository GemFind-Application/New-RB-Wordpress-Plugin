# Sync gemfind-ring-builder plugin source into this repo (excludes node_modules).
$ErrorActionPreference = "Stop"

$source = "C:\Users\javai\Local Sites\gemfind-dl-plugin\app\public\wp-content\plugins\gemfind-ring-builder"
$dest = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path $source)) {
  throw "Source plugin not found: $source"
}

Write-Host "Syncing from:" $source
Write-Host "Syncing to:  " $dest

robocopy $source $dest /MIR /XD node_modules .git /XF *.zip /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "robocopy failed with exit code $LASTEXITCODE"
}

Write-Host "Sync complete."
