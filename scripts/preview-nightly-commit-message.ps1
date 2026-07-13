# Preview the nightly commit message for current staged changes.
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "nightly-commit-message.ps1")

function Invoke-Git {
    param([string[]]$GitArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & git @GitArgs 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "git $($GitArgs -join ' ') failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        $ErrorActionPreference = $prev
    }
}

$repoRoot = Split-Path $PSScriptRoot -Parent
Push-Location $repoRoot
try {
    Invoke-Git -GitArgs @("add", "-A") | Out-Null
    Write-Output "--- Nightly commit preview ---"
    Write-Output ""
    Write-Output (Get-NightlyCommitMessage)
}
finally {
    Pop-Location
}
