param(
    [Parameter(Mandatory = $true)][string]$SqlFile,
    [Parameter(Mandatory = $true)][string]$HostName,
    [Parameter(Mandatory = $true)][string]$Port,
    [Parameter(Mandatory = $true)][string]$User,
    [Parameter(Mandatory = $true)][string]$Database,
    [Parameter(Mandatory = $true)][string]$PassFile,
    [string]$SslMode = 'require',
    [int]$StopOnError = 1,
    [switch]$UseDocker,
    [string]$DockerImage = 'postgres:16',
    [string]$PsqlCmd = 'psql'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SqlFile)) {
    Write-Error "SQL file not found: $SqlFile"
    exit 1
}
if (-not (Test-Path -LiteralPath $PassFile)) {
    Write-Error "Password file not found: $PassFile"
    exit 1
}

$password = [IO.File]::ReadAllText($PassFile)
if ($null -eq $password) { $password = '' }
$password = $password.TrimEnd("`r", "`n")

$env:PGPASSWORD = $password
$env:PGSSLMODE = $SslMode

$stopFlag = if ($StopOnError -eq 1) { '1' } else { '0' }

try {
    if ($UseDocker) {
        Get-Content -LiteralPath $SqlFile -Raw -Encoding UTF8 | docker run --rm -i `
            -e PGPASSWORD -e PGSSLMODE `
            $DockerImage `
            psql -h $HostName -p $Port -U $User -d $Database -v "ON_ERROR_STOP=$stopFlag" -f -
        exit $LASTEXITCODE
    }

    & $PsqlCmd -h $HostName -p $Port -U $User -d $Database -v "ON_ERROR_STOP=$stopFlag" -f $SqlFile
    exit $LASTEXITCODE
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue
}
