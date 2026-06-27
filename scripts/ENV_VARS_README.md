# Amplify Environment Variables Scripts

Scripts to manage AWS Amplify environment variables in bulk from `.env` files.

## Features

✅ **Flexible Input**: Accept any `.env` file (`.env.production`, `.env.development`, etc.)
✅ **Comment Handling**: Properly ignores comment lines and inline comments
✅ **Quote Handling**: Removes surrounding quotes from values
✅ **Whitespace Trimming**: Handles spaces around keys and values
✅ **Validation**: Checks for empty files and validates before uploading
✅ **Cross-Platform**: Bash script for Linux/Mac, PowerShell for Windows

## Scripts Included

### 1. Main Scripts

- **`set-amplify-env-vars.sh`** - Bash script (Linux/Mac)
- **`set-amplify-env-vars.ps1`** - PowerShell script (Windows)

### 2. Test Scripts

- **`test-env-parsing.sh`** - Test bash parsing logic
- **`test-env-parsing.ps1`** - Test PowerShell parsing logic
- **`../.env.test`** - Sample test file with edge cases

## Usage

### Bash (Linux/Mac)

```bash
# Make executable
chmod +x scripts/set-amplify-env-vars.sh

# Use default file (.env.amplify)
./scripts/set-amplify-env-vars.sh

# Specify custom env file
./scripts/set-amplify-env-vars.sh .env.production

# Specify env file and branch
./scripts/set-amplify-env-vars.sh .env.development feature_Common_Clerk

# Full parameters
./scripts/set-amplify-env-vars.sh .env.production main d1508w3f27cyps us-east-1
```

**Parameters:**
1. `env-file` - Environment file to use (default: `.env.amplify`)
2. `branch-name` - Amplify branch name (default: `feature_Common_Clerk`)
3. `app-id` - Amplify app ID (default: `d1508w3f27cyps`)
4. `region` - AWS region (default: `us-east-1`)

### PowerShell (Windows)

```powershell
# Use default file (.env.amplify)
.\scripts\set-amplify-env-vars.ps1

# Specify custom env file
.\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.production"

# Specify env file and branch
.\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.development" -BranchName "feature_Common_Clerk"

# Full parameters
.\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.production" -BranchName "main" -AppId "d1508w3f27cyps" -Region "us-east-1"
```

**Parameters:**
- `-EnvFile` - Environment file to use (default: `.env.amplify`)
- `-BranchName` - Amplify branch name (default: `feature_Common_Clerk`)
- `-AppId` - Amplify app ID (default: `d1508w3f27cyps`)
- `-Region` - AWS region (default: `us-east-1`)

## Environment File Format

The scripts support standard `.env` file format with the following features:

### ✅ Supported Syntax

```bash
# Comments are ignored
# This is a comment line

# Basic key=value
KEY=value

# Spaces around equals are handled
KEY = value

# Quoted values (quotes are removed)
KEY="value"
KEY='value'

# Inline comments (removed from unquoted values)
KEY=value # This is a comment

# Quoted values with # inside (preserved)
KEY="value with # inside"

# Empty values
EMPTY_KEY=

# Values with special characters
PASSWORD=P@ssw0rd!#Special
URL=https://example.com?param=value&other=123

# Multi-word values
APP_NAME="My Cool App"

# Leading/trailing whitespace (trimmed)
  KEY=value
KEY=value
```

### ❌ Ignored

- Empty lines
- Comment lines starting with `#`
- Lines without `=`
- Lines with empty keys

## Testing

Test the parsing logic without uploading to AWS:

### Bash

```bash
chmod +x scripts/test-env-parsing.sh

# Test default file
./scripts/test-env-parsing.sh

# Test specific file
./scripts/test-env-parsing.sh .env.production
```

### PowerShell

```powershell
# Test default file
.\scripts\test-env-parsing.ps1

# Test specific file
.\scripts\test-env-parsing.ps1 -EnvFile ".env.production"
```

The test scripts will:
- Show how each line is processed
- Display skipped lines (comments, empty)
- Show parsed key-value pairs
- Output final JSON that would be sent to AWS

## Example Workflow

### 1. Create Environment File

```bash
# For production
cp .env.amplify.example .env.production
nano .env.production  # Edit with your values
```

### 2. Test Parsing

```bash
# Verify variables are parsed correctly
./scripts/test-env-parsing.sh .env.production
```

### 3. Upload to Amplify

```bash
# Upload to Amplify
./scripts/set-amplify-env-vars.sh .env.production main
```

### 4. Trigger Deployment

The script will show you the command to trigger deployment:

```bash
aws amplify start-job \
  --app-id d1508w3f27cyps \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-1
```

## Prerequisites

### Bash Script Requirements

- **AWS CLI** - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **jq** - JSON processor
  - **Linux**: `sudo apt-get install jq` or `sudo yum install jq`
  - **Mac**: `brew install jq`

### PowerShell Script Requirements

- **AWS CLI** - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **PowerShell 5.1+** - Built into Windows

### AWS CLI Configuration

```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

## Common Scenarios

### Different Environments

```bash
# Development
./scripts/set-amplify-env-vars.sh .env.development dev

# Staging
./scripts/set-amplify-env-vars.sh .env.staging staging

# Production
./scripts/set-amplify-env-vars.sh .env.production main
```

### Multiple Apps/Regions

```bash
# App in EU region
./scripts/set-amplify-env-vars.sh .env.eu main app-id-eu eu-west-1

# Different app entirely
./scripts/set-amplify-env-vars.sh .env.other main other-app-id us-west-2
```

## Edge Cases Handled

The scripts properly handle:

✅ Comment lines (`# comment`)
✅ Inline comments (`KEY=value # comment`)
✅ Empty lines
✅ Spaces around `=` (`KEY = value`)
✅ Quoted values with spaces (`KEY="my value"`)
✅ Quoted values with `#` inside (`KEY="value # not comment"`)
✅ Leading/trailing whitespace
✅ Empty values (`KEY=`)
✅ Special characters in values
✅ Values containing `=` (`CONNECTION=Server=localhost`)

## Troubleshooting

### Error: "jq is not installed" (Bash)

```bash
# Install jq
# Linux (Ubuntu/Debian)
sudo apt-get install jq

# Linux (CentOS/RHEL)
sudo yum install jq

# Mac
brew install jq
```

### Error: "AWS CLI is not installed"

Download and install from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### Error: "No environment variables found"

Check your `.env` file:
- Ensure it has `KEY=VALUE` pairs
- Remove any syntax errors
- Use test script to debug: `./scripts/test-env-parsing.sh yourfile.env`

### Error: "Environment file not found"

- Check file exists: `ls -la .env*`
- Use correct path (relative to project root)
- Check for typos in filename

## Security Notes

⚠️ **Never commit real environment files to git!**

- Use `.env.amplify.example` as a template
- Add `.env.production`, `.env.development`, etc. to `.gitignore`
- The scripts use these files locally only
- Values are sent directly to AWS via API

✅ Files already in `.gitignore`:
```
.env.amplify
.env.production
.env.development
env-vars.json
current-env.json
```

## Related Documentation

- [AWS Amplify CLI Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/amplify/index.html)
- [Amplify Environment Variables Docs](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- Complete guide: `documentation/AWS_AMPLIFY_ENV_VARS.md`
