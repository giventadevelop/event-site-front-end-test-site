$searchDir = "E:\project_workspace\mosc-temp\src\app\admin\events-analytics"
Get-ChildItem -Path $searchDir -Recurse -Include '*.ts','*.tsx' | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    $lines = $content -split "`n"
    $lineNum = 0
    $hasMatch = $false
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match 'API_BASE_URL') {
            if (-not $hasMatch) {
                Write-Output "FILE: $($_.FullName)"
                $hasMatch = $true
            }
            Write-Output "  ${lineNum}: $($line.TrimEnd())"
        }
    }
}
