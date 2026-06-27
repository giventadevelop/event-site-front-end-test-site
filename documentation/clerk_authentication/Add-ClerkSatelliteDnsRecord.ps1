# ==============================================================================
# Add-ClerkSatelliteDnsRecord.ps1
# ==============================================================================
# Description: Create Clerk satellite domain CNAME record in Route 53
# Author: System Administrator
# Created: 2025-01-25
# ==============================================================================

<#
.SYNOPSIS
    Creates the required Clerk CNAME DNS record for a satellite domain in AWS Route 53.

.DESCRIPTION
    This script creates the single CNAME record required by Clerk for satellite domain setup:
    - clerk.{domain} → frontend-api.clerk.services (Frontend API)

    Satellite domains only require 1 CNAME record (unlike primary domains which need 5).

.PARAMETER Domain
    The satellite domain name (with or without www prefix). Example: www.mcefee-temp.com or mcefee-temp.com

.PARAMETER HostedZoneId
    The Route 53 hosted zone ID for the domain. If not provided, script will attempt to find it.

.PARAMETER TTL
    Time to live for DNS records. Default: 3600 (1 hour).

.EXAMPLE
    .\Add-ClerkSatelliteDnsRecord.ps1 -Domain "www.mcefee-temp.com" -HostedZoneId "Z0123456789ABCDEF"

    Creates the CNAME record for www.mcefee-temp.com in the specified hosted zone.

.EXAMPLE
    .\Add-ClerkSatelliteDnsRecord.ps1 -Domain "www.mcefee-temp.com"

    Prompts for hosted zone ID, then creates the record.
#>

[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [Parameter(Mandatory=$true, HelpMessage="Satellite domain name (e.g., www.mcefee-temp.com)")]
    [string]$Domain,

    [Parameter(Mandatory=$false, HelpMessage="Route 53 hosted zone ID")]
    [string]$HostedZoneId,

    [Parameter(Mandatory=$false)]
    [int]$TTL = 3600
)

# ==============================================================================
# Helper Functions
# ==============================================================================

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Test-AwsCliInstalled {
    $awsVersion = aws --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "AWS CLI is not installed or not in PATH"
        Write-Host "Please install AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Yellow
        return $false
    }
    Write-Info "AWS CLI found: $awsVersion"
    return $true
}

function Test-AwsCredentials {
    try {
        $result = aws sts get-caller-identity 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "AWS credentials not configured or invalid"
            Write-Host "Please run: aws configure" -ForegroundColor Yellow
            return $false
        }
        $identity = $result | ConvertFrom-Json
        Write-Info "AWS Identity: $($identity.Arn)"
        return $true
    }
    catch {
        Write-Error "Failed to verify AWS credentials: $_"
        return $false
    }
}

function Get-HostedZoneId {
    param([string]$DomainName)

    Write-Info "Searching for hosted zone ID for domain: $DomainName"

    # Extract root domain (remove www. prefix if present)
    $rootDomain = $DomainName -replace '^www\.', ''

    try {
        # Try exact match first
        $zones = aws route53 list-hosted-zones --query "HostedZones[?Name=='$rootDomain.'].Id" --output text 2>&1

        if ($LASTEXITCODE -eq 0 -and $zones -and $zones.Trim()) {
            $zoneId = ($zones -replace '/hostedzone/', '').Trim()
            Write-Success "Found hosted zone ID: $zoneId"
            return $zoneId
        }

        Write-Warning "Hosted zone not found for $rootDomain"
        Write-Host ""
        Write-Host "Available hosted zones:" -ForegroundColor Yellow
        aws route53 list-hosted-zones --query "HostedZones[*].[Name,Id]" --output table

        return $null
    }
    catch {
        Write-Error "Error searching for hosted zone: $_"
        return $null
    }
}

function Create-SatelliteDnsRecord {
    param(
        [string]$DomainName,
        [string]$ZoneId,
        [int]$RecordTTL
    )

    Write-Header "Creating Clerk Satellite DNS Record for $DomainName"

    # Remove trailing dot from domain if present
    $cleanDomain = $DomainName.TrimEnd('.')

    # Build CNAME record name: clerk.{domain}
    # If domain is www.mcefee-temp.com, CNAME should be clerk.www.mcefee-temp.com
    $cnameName = "clerk.$cleanDomain"

    Write-Info "CNAME Record: $cnameName → frontend-api.clerk.services"

    # Build change batch JSON
    $changeBatch = @{
        Comment = "Add Clerk satellite DNS record for $cleanDomain"
        Changes = @(
            @{
                Action = "UPSERT"
                ResourceRecordSet = @{
                    Name = "$cnameName."
                    Type = "CNAME"
                    TTL = $RecordTTL
                    ResourceRecords = @(
                        @{
                            Value = "frontend-api.clerk.services."
                        }
                    )
                }
            }
        )
    }

    $changeBatchJson = $changeBatch | ConvertTo-Json -Depth 10

    Write-Host ""
    Write-Info "Change batch JSON prepared:"
    Write-Host $changeBatchJson -ForegroundColor Gray
    Write-Host ""

    if (-not $PSCmdlet.ShouldProcess("Route 53 hosted zone $ZoneId", "Create CNAME record: $cnameName")) {
        Write-Warning "Operation cancelled by user"
        return $false
    }

    # Save JSON to temp file (UTF-8 without BOM for AWS CLI compatibility)
    $tempFile = [System.IO.Path]::GetTempFileName()
    $tempFile = $tempFile -replace '\.tmp$', '.json'

    try {
        # Write UTF-8 without BOM (AWS CLI doesn't handle BOM)
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($tempFile, $changeBatchJson, $utf8NoBom)
        Write-Info "Saved change batch to: $tempFile"

        # Execute Route 53 change
        Write-Info "Executing Route 53 change-batch operation..."
        $result = aws route53 change-resource-record-sets `
            --hosted-zone-id $ZoneId `
            --change-batch "file://$tempFile" `
            2>&1

        if ($LASTEXITCODE -eq 0) {
            $changeInfo = $result | ConvertFrom-Json
            Write-Success "DNS record created successfully!"
            Write-Host ""
            Write-Host "Change ID: $($changeInfo.ChangeInfo.Id)" -ForegroundColor Yellow
            Write-Host "Status: $($changeInfo.ChangeInfo.Status)" -ForegroundColor Yellow
            Write-Host ""
            Write-Info "DNS propagation typically takes 5-60 minutes."
            Write-Info "Next step: Go to Clerk Dashboard → Configure → Domains → Satellites"
            Write-Info "Click 'Verify configuration' after DNS propagates."
            return $true
        }
        else {
            Write-Error "Failed to create DNS record"
            Write-Host $result -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Error "Error executing Route 53 change: $_"
        return $false
    }
    finally {
        # Clean up temp file
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        }
    }
}

# ==============================================================================
# Main Script Logic
# ==============================================================================

Write-Header "Clerk Satellite DNS Record Setup Script"

# Step 1: Verify AWS CLI
if (-not (Test-AwsCliInstalled)) {
    exit 1
}

if (-not (Test-AwsCredentials)) {
    exit 1
}

# Step 2: Get Hosted Zone ID
if ([string]::IsNullOrWhiteSpace($HostedZoneId)) {
    $HostedZoneId = Get-HostedZoneId -DomainName $Domain

    if ([string]::IsNullOrWhiteSpace($HostedZoneId)) {
        Write-Host ""
        $HostedZoneId = Read-Host "Enter hosted zone ID manually (or 'cancel' to exit)"

        if ($HostedZoneId -eq "cancel" -or [string]::IsNullOrWhiteSpace($HostedZoneId)) {
            Write-Warning "Operation cancelled"
            exit 1
        }
    }
}

# Step 3: Confirm operation
Write-Header "Configuration Summary"
Write-Host "Satellite Domain:     " -NoNewline
Write-Host $Domain -ForegroundColor Cyan
Write-Host "Hosted Zone ID:       " -NoNewline
Write-Host $HostedZoneId -ForegroundColor Cyan
Write-Host "TTL:                  " -NoNewline
Write-Host $TTL -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create 1 CNAME record:" -ForegroundColor Yellow
Write-Host "  clerk.$Domain → frontend-api.clerk.services"
Write-Host ""
Write-Host "After DNS propagation:" -ForegroundColor Cyan
Write-Host "  1. Go to Clerk Dashboard → Configure → Domains → Satellites"
Write-Host "  2. Find your satellite domain: $Domain"
Write-Host "  3. Click 'Verify configuration' button"
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Warning "Operation cancelled by user"
    exit 0
}

# Step 4: Create DNS record
$success = Create-SatelliteDnsRecord -DomainName $Domain -ZoneId $HostedZoneId -RecordTTL $TTL

if ($success) {
    Write-Host ""
    Write-Success "Setup complete! Next steps:"
    Write-Host "  1. Wait 5-60 minutes for DNS propagation"
    Write-Host "  2. Go to Clerk Dashboard → Configure → Domains → Satellites"
    Write-Host "  3. Find: $Domain"
    Write-Host "  4. Click 'Verify configuration' button"
    Write-Host "  5. Status should change to 'Verified' (green checkmark)"
    Write-Host ""
    exit 0
}
else {
    Write-Error "Setup failed. Please check the errors above."
    exit 1
}

