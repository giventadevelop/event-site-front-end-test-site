$file = "E:\project_workspace\mosc-temp\src\app\admin\ApiServerActions.ts"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
$lines = $content -split "`n"

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'getApiBase' -or $line -match 'API_BASE_URL' -or $line -match '// Lazy getter') {
        Write-Output "$($i + 1): $($line.TrimEnd())"
    }
}
