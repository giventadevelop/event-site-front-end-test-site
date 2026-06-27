$file = "E:\project_workspace\mosc-temp\src\app\admin\events-analytics\[id]\tickets\list\ApiServerActions.ts"
if (Test-Path $file) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    $lines = $content -split "`n"
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match 'API_BASE_URL' -or $line -match 'getApiBase') {
            Write-Output "${lineNum}: $($line.TrimEnd())"
        }
    }
}
