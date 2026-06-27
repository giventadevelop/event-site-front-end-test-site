# Verify a few files look correct
$files = @(
    "E:\project_workspace\mosc-temp\src\app\calendar\ApiServerActions.ts",
    "E:\project_workspace\mosc-temp\src\app\admin\check-in-analytics\ApiServerActions.ts",
    "E:\project_workspace\mosc-temp\src\app\events\[id]\checkout\CheckoutServerData.tsx"
)

foreach ($file in $files) {
    Write-Output "===== $file ====="
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    $lines = $content -split "`n"
    
    # Find the lazy getter comment and show context
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '// Lazy getter') {
            # Show 5 lines of context
            for ($j = $i; $j -lt [Math]::Min($i + 5, $lines.Count); $j++) {
                Write-Output "  $($j + 1): $($lines[$j].TrimEnd())"
            }
            break
        }
    }
    
    # Check for em-dash byte sequence
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    if ($content.Contains([char]0x2014)) {
        Write-Output "  [OK] Em-dash (U+2014) is present"
    } else {
        Write-Output "  [WARN] Em-dash (U+2014) NOT found"
    }
    
    # Check no bare module-level const API_BASE_URL = getApiBaseUrl()
    if ($content.Contains('const API_BASE_URL = getApiBaseUrl()')) {
        Write-Output "  [WARN] Still has old const pattern!"
    } else {
        Write-Output "  [OK] Old const pattern removed"
    }
    
    Write-Output ""
}
