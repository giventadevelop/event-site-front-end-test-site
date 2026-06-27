$basePath = "E:\project_workspace\mosc-temp\src\app"
$excludeFile = "E:\project_workspace\mosc-temp\src\app\admin\ApiServerActions.ts"
$pattern = 'const API_BASE_URL = getApiBaseUrl();'
$replacement = @"
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
"@

$files = Get-ChildItem -Path $basePath -Recurse -Include '*.ts','*.tsx' | Where-Object {
    $_.FullName -ne $excludeFile
}

$modifiedFiles = @()

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    if ($content.Contains($pattern)) {
        # Replace the const declaration with lazy getter function
        $newContent = $content.Replace($pattern, $replacement)
        
        # Replace all ${API_BASE_URL} with ${getApiBase()}
        $newContent = $newContent.Replace('${API_BASE_URL}', '${getApiBase()}')
        
        # Write back with UTF-8 encoding (no BOM)
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
        
        $modifiedFiles += $file.FullName
        Write-Output "FIXED: $($file.FullName)"
    }
}

Write-Output ""
Write-Output "Total files modified: $($modifiedFiles.Count)"
