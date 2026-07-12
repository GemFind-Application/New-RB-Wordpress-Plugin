# Register Windows scheduled task: daily GitHub sync at 12:00 AM (local time).
$ErrorActionPreference = "Stop"

$taskName = "GemFind-RB-GitHub-Nightly-Sync"
$scriptPath = Join-Path $PSScriptRoot "nightly-github-sync.ps1"
$repoRoot = Split-Path $PSScriptRoot -Parent

if (-not (Test-Path $scriptPath)) {
    throw "Missing script: $scriptPath"
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" `
    -WorkingDirectory $repoRoot

$trigger = New-ScheduledTaskTrigger -Daily -At "12:00AM"

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Replaced existing task: $taskName"
}

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Sync GemFind Ring Builder plugin to GitHub every night at 12:00 AM." | Out-Null

Write-Host "Scheduled task created: $taskName"
Write-Host "Runs daily at 12:00 AM (local time)."
Write-Host "Script: $scriptPath"
Write-Host "Logs:   $(Join-Path $PSScriptRoot 'logs\nightly-sync.log')"
