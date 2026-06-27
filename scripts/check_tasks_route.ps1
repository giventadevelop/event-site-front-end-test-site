# Check api/tasks/route.ts for the pattern
$file = "E:\project_workspace\mosc-temp\src\app\api\tasks\route.ts"
if (Test-Path $file) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    $lines = $content -split "`n"
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match 'API_BASE_URL') {
            Write-Output "${lineNum}: $($line.Trim())"
        }
    }
    Write-Output ""
    if ($content.Contains('function getApiBase()')) {
        Write-Output "Has lazy getter: YES"
    } else {
        Write-Output "Has lazy getter: NO"
    }
    if ($content.Contains('const API_BASE_URL = getApiBaseUrl()')) {
        Write-Output "Has old const pattern: YES"
    } else {
        Write-Output "Has old const pattern: NO"
    }
    if ($content.Contains('const API_BASE_URL')) {
        Write-Output "Has SOME const API_BASE_URL: YES"
        # Find the line
        $lineNum = 0
        foreach ($line in $lines) {
            $lineNum++
            if ($line -match 'const API_BASE_URL') {
                Write-Output "  Line ${lineNum}: $($line.Trim())"
            }
        }
    } else {
        Write-Output "Has SOME const API_BASE_URL: NO"
    }
}
