$basePath = "E:\project_workspace\mosc-temp\src\app"
$excludeFile = "E:\project_workspace\mosc-temp\src\app\admin\ApiServerActions.ts"

# Get all files that have the lazy getter function (meaning they were already converted)
# AND still have bare API_BASE_URL references
$files = Get-ChildItem -Path $basePath -Recurse -Include '*.ts','*.tsx' | Where-Object {
    $_.FullName -ne $excludeFile
}

$modifiedFiles = @()

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Only process files that have the lazy getter (already converted) AND still have bare API_BASE_URL
    if ($content.Contains('function getApiBase()') -and $content -match '(?<!\$\{)API_BASE_URL(?!\})') {
        $newContent = $content
        
        # Replace bare API_BASE_URL usages (not inside string literals or comments about the env var name)
        # Replace: if (!API_BASE_URL) -> if (!getApiBase())
        $newContent = $newContent.Replace('if (!API_BASE_URL)', 'if (!getApiBase())')
        
        # Replace: `${API_BASE_URL}/ -> `${getApiBase()}/  (already done, but just in case)
        $newContent = $newContent.Replace('${API_BASE_URL}', '${getApiBase()}')
        
        if ($newContent -ne $content) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
            $modifiedFiles += $file.FullName
            Write-Output "FIXED: $($file.FullName)"
        }
    }
}

Write-Output ""
Write-Output "Total files modified: $($modifiedFiles.Count)"

# Now check what still remains
Write-Output ""
Write-Output "=== REMAINING BARE API_BASE_URL REFERENCES (in files with lazy getter) ==="
Get-ChildItem -Path $basePath -Recurse -Include '*.ts','*.tsx' | Where-Object {
    $_.FullName -ne $excludeFile
} | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    if ($content.Contains('function getApiBase()')) {
        $lines = $content -split "`n"
        $lineNum = 0
        foreach ($line in $lines) {
            $lineNum++
            # Match API_BASE_URL that is NOT inside getApiBase() or the function definition or a comment about env var
            if ($line -match 'API_BASE_URL' -and $line -notmatch 'function getApiBase' -and $line -notmatch 'getApiBase\(\)' -and $line -notmatch '// Lazy getter') {
                Write-Output "$($_.FullName):${lineNum}: $($line.Trim())"
            }
        }
    }
}
