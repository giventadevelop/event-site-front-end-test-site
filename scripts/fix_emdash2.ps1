$basePath = "E:\project_workspace\mosc-temp\src\app"
$emdash = [char]0x2014

$files = Get-ChildItem -Path $basePath -Recurse -Include '*.ts','*.tsx'
$modifiedCount = 0

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    if ($content.Contains('function getApiBase()') -and $content.Contains('// Lazy getter')) {
        $lines = $content -split "`n"
        $changed = $false
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            if ($line -match '// Lazy getter' -and $line -match 'evaluated at call time') {
                # Detect the indentation from the line
                $indent = ''
                if ($line -match '^(\s*)//') {
                    $indent = $Matches[1]
                }
                $correctComment = "${indent}// Lazy getter ${emdash} evaluated at call time, not module load time (critical for Lambda cold starts)"
                $trimmedLine = $line.TrimEnd("`r")
                if ($trimmedLine -ne $correctComment) {
                    $lines[$i] = $correctComment
                    $changed = $true
                }
            }
        }
        if ($changed) {
            $newContent = $lines -join "`n"
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
            $modifiedCount++
            Write-Output "FIXED: $($file.FullName)"
        }
    }
}

Write-Output ""
Write-Output "Total comment fixes: $modifiedCount"
