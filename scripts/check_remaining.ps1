# Check for remaining bare API_BASE_URL references
Get-ChildItem -Path 'E:\project_workspace\mosc-temp\src\app' -Recurse -Include '*.ts','*.tsx' | 
    Select-String -Pattern 'API_BASE_URL' |
    Where-Object { 
        $_.Line -notmatch 'getApiBase\(\)' -and 
        $_.Line -notmatch 'function getApiBase' -and 
        $_.Line -notmatch '// Lazy getter' -and
        $_.Line -notmatch 'const API_BASE_URL'
    } |
    ForEach-Object { 
        Write-Output "$($_.Path):$($_.LineNumber): $($_.Line.Trim())"
    }
