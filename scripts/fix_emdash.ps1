$basePath = "E:\project_workspace\mosc-temp\src\app"

# The corrupted pattern - the em dash got mangled during bash heredoc
# We need to find and fix any corrupted versions of the comment
$files = Get-ChildItem -Path $basePath -Recurse -Include '*.ts','*.tsx'
$modifiedCount = 0

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    if ($content.Contains('function getApiBase()')) {
        # Check what the comment line actually looks like
        $lines = $content -split "`n"
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            if ($line -match '// Lazy getter' -and $line -match 'evaluated at call time') {
                $correctComment = '// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)'
                $trimmedLine = $line.TrimEnd("`r")
                if ($trimmedLine -ne $correctComment) {
                    Write-Output "FIXING COMMENT in: $($file.FullName)"
                    Write-Output "  OLD: $trimmedLine"
                    $lines[$i] = $correctComment
                    $newContent = $lines -join "`n"
                    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                    [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
                    $modifiedCount++
                    Write-Output "  NEW: $correctComment"
                    break
                }
            }
        }
    }
}

Write-Output ""
Write-Output "Total comment fixes: $modifiedCount"
