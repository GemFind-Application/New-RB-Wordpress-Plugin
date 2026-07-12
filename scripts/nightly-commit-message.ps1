function Get-AreaLabel {
    param([string]$Path)
    switch -Regex ($Path) {
        "^public/frontpublic/src/" { return "Storefront v2" }
        "^public/frontpublic/build/" { return "Storefront v2 build" }
        "^src/admin-frontend/" { return "Admin React" }
        "^assets/build/" { return "Admin build" }
        "^public/static/" { return "Storefront v1 bundle" }
        "^includes/" { return "PHP backend" }
        "^admin/" { return "WordPress admin" }
        "^templates/" { return "Templates" }
        "^scripts/" { return "Build scripts" }
        "^docs/" { return "Documentation" }
        "^tests/" { return "Tests" }
        "^assets/" { return "Plugin assets" }
        "^vendor/" { return "PHP vendor" }
        default { return "Plugin root" }
    }
}

function Get-FileHighlight {
    param([string]$Path)
    $name = [System.IO.Path]::GetFileName($Path)
    if ($name -match "^(gemfind-ring-builder\.php|package\.json|composer\.json|readme\.txt|developer\.md|\.gitignore)$") {
        return $name
    }
    return [System.IO.Path]::GetFileNameWithoutExtension($name)
}

function Get-NightlyCommitMessage {
    param([string]$DateLabel)

    $entries = git diff --cached --name-status
    if (-not $entries) {
        return "Nightly sync ($DateLabel): minor updates"
    }

    $groups = [ordered]@{}
    $totalFiles = 0

    foreach ($line in $entries) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $parts = $line -split "`t", 2
        if ($parts.Count -lt 2) { continue }

        $status = $parts[0].Trim()
        $path = ($parts[1] -split "`t")[-1].Trim().Replace("\", "/")
        if ($path -match "(^|/)scripts/logs/") { continue }

        $totalFiles++
        $area = Get-AreaLabel -Path $path
        if (-not $groups.Contains($area)) {
            $groups[$area] = [ordered]@{
                Added    = New-Object System.Collections.Generic.List[string]
                Modified = New-Object System.Collections.Generic.List[string]
                Deleted  = New-Object System.Collections.Generic.List[string]
            }
        }

        $highlight = Get-FileHighlight -Path $path
        switch -Regex ($status) {
            "^D" { $groups[$area].Deleted.Add($highlight) | Out-Null }
            "^A" { $groups[$area].Added.Add($highlight) | Out-Null }
            default { $groups[$area].Modified.Add($highlight) | Out-Null }
        }
    }

    if ($totalFiles -eq 0) {
        return "Nightly sync ($DateLabel): log and housekeeping"
    }

    $subjectBits = New-Object System.Collections.Generic.List[string]
    foreach ($area in $groups.Keys) {
        $bucket = $groups[$area]
        $pick = @($bucket.Added + $bucket.Modified + $bucket.Deleted | Select-Object -Unique | Select-Object -First 2)
        if ($pick.Count -gt 0) {
            $subjectBits.Add(($pick -join ", "))
        }
    }

    $subjectCore = ($subjectBits | Select-Object -First 3) -join "; "
    if ([string]::IsNullOrWhiteSpace($subjectCore)) {
        $subjectCore = "plugin updates"
    }
    if ($subjectCore.Length -gt 68) {
        $subjectCore = $subjectCore.Substring(0, 65).TrimEnd(",", ";", " ") + "..."
    }

    $bodyLines = New-Object System.Collections.Generic.List[string]
    foreach ($area in $groups.Keys) {
        $bucket = $groups[$area]
        $count = $bucket.Added.Count + $bucket.Modified.Count + $bucket.Deleted.Count
        $bits = New-Object System.Collections.Generic.List[string]

        if ($bucket.Added.Count -gt 0) {
            $bits.Add("added " + (($bucket.Added | Select-Object -Unique | Select-Object -First 4) -join ", "))
        }
        if ($bucket.Modified.Count -gt 0) {
            $bits.Add("updated " + (($bucket.Modified | Select-Object -Unique | Select-Object -First 4) -join ", "))
        }
        if ($bucket.Deleted.Count -gt 0) {
            $bits.Add("removed " + (($bucket.Deleted | Select-Object -Unique | Select-Object -First 4) -join ", "))
        }

        $bodyLines.Add(("- {0} ({1}): {2}" -f $area, $count, ($bits -join "; "))) | Out-Null
    }

    $bodyLines.Add("") | Out-Null
    $bodyLines.Add("Automated nightly sync on $DateLabel. $totalFiles file(s) changed.") | Out-Null

    $subject = "Nightly sync ($DateLabel): $subjectCore"
    return ($subject + "`n`n" + ($bodyLines -join "`n"))
}
