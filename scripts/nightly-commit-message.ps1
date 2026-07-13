function Get-NightlyCommitMessage {
    param([datetime]$When = (Get-Date))
    return "Update Code - {0}" -f $When.ToString("dd-MM-yyyy")
}
