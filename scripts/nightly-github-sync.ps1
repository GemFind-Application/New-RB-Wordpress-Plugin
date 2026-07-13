# Nightly: sync Local WP plugin -> git repo, commit if changed, push to GitHub.
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "nightly-commit-message.ps1")

$repoRoot = Split-Path $PSScriptRoot -Parent
$source = "C:\Users\javai\Local Sites\gemfind-dl-plugin\app\public\wp-content\plugins\gemfind-ring-builder"
$logDir = Join-Path $PSScriptRoot "logs"
$logFile = Join-Path $logDir "nightly-sync.log"

function Write-Log {
    param([string]$Message)
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    Add-Content -Path $logFile -Value $line -Encoding UTF8
    Write-Host $line
}

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

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

try {
    Write-Log "Nightly sync started."

    if (-not (Test-Path $source)) {
        throw "Source plugin not found: $source"
    }

    Write-Log "Copying from $source to $repoRoot"
    # /E updates files; do not use /MIR so repo-only scripts are not deleted.
    robocopy $source $repoRoot /E /XD node_modules .git /XF *.zip /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy failed with exit code $LASTEXITCODE"
    }

    Push-Location $repoRoot
    try {
        $status = git status --porcelain
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Log "No changes detected. Skipping commit and push."
            exit 0
        }

        Invoke-Git -GitArgs @("add", "-A") | Out-Null
        $commitMessage = Get-NightlyCommitMessage
        $msgFile = Join-Path $env:TEMP ("gemfind-rb-nightly-commit-{0}.txt" -f ([guid]::NewGuid().ToString("N")))
        try {
            Set-Content -Path $msgFile -Value $commitMessage -Encoding UTF8
            $commitOutput = Invoke-Git -GitArgs @("commit", "-F", $msgFile)
            if ($commitOutput) {
                Write-Log ($commitOutput | Out-String).Trim()
            }
        }
        finally {
            if (Test-Path $msgFile) {
                Remove-Item $msgFile -Force
            }
        }
        Write-Log ("Commit message: {0}" -f $commitMessage)

        Invoke-Git -GitArgs @("push", "origin", "main") | Out-Null
        Write-Log "Pushed to origin/main."
    }
    finally {
        Pop-Location
    }

    Write-Log "Nightly sync completed successfully."
}
catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    exit 1
}
