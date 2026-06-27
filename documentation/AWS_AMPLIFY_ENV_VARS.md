# AWS Amplify Environment Variables Management

This guide shows how to manage environment variables for your AWS Amplify app in bulk using AWS CLI.

## App Information

- **App ID**: `d1508w3f27cyps`
- **Branch**: `feature_Common_Clerk`
- **Region**: `us-east-1`

## Quick Start

### Method 1: Using Scripts (Recommended)

**Windows (PowerShell):**
```powershell
# 1. Create your environment file
Copy-Item .env.amplify.example .env.amplify
# Edit .env.amplify with your actual values

# 2. Run the script (uses .env.amplify by default)
.\scripts\set-amplify-env-vars.ps1 -BranchName "feature_Common_Clerk"

# Or specify a custom env file
.\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.production" -BranchName "main"

# Full example with all parameters
.\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.development" -BranchName "feature_Common_Clerk" -AppId "d1508w3f27cyps" -Region "us-east-1"
```

**Linux/Mac (Bash):**
```bash
# 1. Create your environment file
cp .env.amplify.example .env.amplify
# Edit .env.amplify with your actual values

# 2. Make script executable and run (uses .env.amplify by default)
chmod +x scripts/set-amplify-env-vars.sh
./scripts/set-amplify-env-vars.sh

# Or specify a custom env file and branch
./scripts/set-amplify-env-vars.sh .env.production main

# Full example with all parameters
./scripts/set-amplify-env-vars.sh .env.development feature_Common_Clerk d1508w3f27cyps us-east-1
```

### Method 2: Direct AWS CLI Commands

#### Option A: Update All Variables at Once (JSON)

1. **Create a JSON file** with your environment variables:

```json
{
  "NEXT_PUBLIC_TENANT_ID": "your_tenant_id",
  "NEXT_PUBLIC_API_BASE_URL": "https://your-api-domain.com",
  "DATABASE_URL": "postgresql://user:pass@host:5432/db",
  "API_JWT_USER": "your_jwt_username",
  "API_JWT_PASS": "your_jwt_password"
 
}
```

Save this as `env-vars.json`

2. **Apply to Amplify:**

```bash
aws amplify update-app \
  --app-id d1508w3f27cyps \
  --environment-variables file://env-vars.json \
  --region us-east-1
```

#### Option B: Set Individual Variables

```bash
# Set a single environment variable
aws amplify update-app \
  --app-id d1508w3f27cyps \
  --environment-variables '{"NEXT_PUBLIC_TENANT_ID":"your_tenant_id"}' \
  --region us-east-1
```

#### Option C: Use from .env file (Linux/Mac)

```bash
# Convert .env file to JSON and apply
jq -n 'reduce inputs as $i ({}; . + ($i | split("=") | {(.[0]): .[1]}))' \
  < <(grep -v '^#' .env.amplify | grep -v '^$') | \
aws amplify update-app \
  --app-id d1508w3f27cyps \
  --environment-variables file:///dev/stdin \
  --region us-east-1
```

## Managing Environment Variables

### View Current Environment Variables

```bash
aws amplify get-app \
  --app-id d1508w3f27cyps \
  --region us-east-1 \
  --query 'app.environmentVariables'
```

### Add New Variable (Without Removing Existing Ones)

```bash
# First, get current vars
CURRENT_VARS=$(aws amplify get-app \
  --app-id d1508w3f27cyps \
  --region us-east-1 \
  --query 'app.environmentVariables' \
  --output json)

# Merge with new variable
NEW_VARS=$(echo $CURRENT_VARS | jq '. + {"NEW_VAR_NAME": "new_value"}')

# Update
aws amplify update-app \
  --app-id d1508w3f27cyps \
  --environment-variables "$NEW_VARS" \
  --region us-east-1
```

### Remove an Environment Variable

```bash
# Get current vars and remove one
CURRENT_VARS=$(aws amplify get-app \
  --app-id d1508w3f27cyps \
  --region us-east-1 \
  --query 'app.environmentVariables' \
  --output json)

NEW_VARS=$(echo $CURRENT_VARS | jq 'del(.VAR_TO_REMOVE)')

aws amplify update-app \
  --app-id d1508w3f27cyps \
  --environment-variables "$NEW_VARS" \
  --region us-east-1
```

### Branch-Specific Environment Variables

```bash
# Set environment variables for a specific branch
aws amplify update-branch \
  --app-id d1508w3f27cyps \
  --branch-name feature_Common_Clerk \
  --environment-variables '{"BRANCH_SPECIFIC_VAR":"value"}' \
  --region us-east-1
```

### View Branch-Specific Variables

```bash
aws amplify get-branch \
  --app-id d1508w3f27cyps \
  --branch-name feature_Common_Clerk \
  --region us-east-1 \
  --query 'branch.environmentVariables'
```

## Triggering a Deployment After Updating Variables

Environment variables are applied to new builds. To apply changes:

```bash
# Trigger a new deployment
aws amplify start-job \
  --app-id d1508w3f27cyps \
  --branch-name feature_Common_Clerk \
  --job-type RELEASE \
  --region us-east-1
```

## Best Practices

### Security

1. **Never commit actual credentials** to git
   - Use `.env.amplify.example` for templates
   - Add `.env.amplify` to `.gitignore`

2. **Use AWS Secrets Manager** for sensitive data:
```bash
# Store secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name amplify/d1508w3f27cyps/db-credentials \
  --secret-string '{"username":"dbuser","password":"dbpass"}' \
  --region us-east-1

# Reference in Amplify (using SSM Parameter Store)
aws ssm put-parameter \
  --name "/amplify/d1508w3f27cyps/feature_Common_Clerk/DATABASE_URL" \
  --value "postgresql://user:pass@host:5432/db" \
  --type "SecureString" \
  --region us-east-1
```

3. **Rotate credentials regularly**

4. **Use different values** for different branches/environments

### Organization

1. **Group variables by purpose**:
   - Database: `DATABASE_URL`, `DB_POOL_SIZE`
   - API: `API_JWT_USER`, `API_JWT_PASS`
   - External Services: `STRIPE_SECRET_KEY`, `CLERK_SECRET_KEY`

2. **Document all variables** in `.env.amplify.example`

3. **Use consistent naming**:
   - `NEXT_PUBLIC_*` for client-side variables
   - All caps with underscores: `API_BASE_URL`

## Common Environment Variables for This Project

### Required Variables

```bash
# Core Configuration
NEXT_PUBLIC_TENANT_ID          # Multi-tenant identifier
NEXT_PUBLIC_API_BASE_URL       # Backend API URL
DATABASE_URL                    # PostgreSQL connection string

# API Authentication
API_JWT_USER                    # JWT username
API_JWT_PASS                    # JWT password
```

### Optional Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# AWS Services
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET

# Build Configuration
NODE_ENV
NEXT_PUBLIC_APP_URL
```

## Troubleshooting

### Error: "An error occurred (NotFoundException)"
- Check that the app ID is correct: `d1508w3f27cyps`
- Verify you're using the correct AWS region: `us-east-1`
- Ensure your AWS credentials have permissions

### Error: "Invalid parameter"
- Ensure JSON is properly formatted
- Check for special characters that need escaping
- Validate with: `echo $JSON | jq .`

### Variables Not Taking Effect
- Trigger a new deployment after updating variables
- Check if variables are set at app level vs branch level
- App-level variables can be overridden by branch-level variables

### AWS CLI Not Found
```bash
# Install AWS CLI
# Windows (PowerShell as Admin):
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Mac:
brew install awscli
```

### Configure AWS CLI
```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

## Complete Example Workflow

```bash
# 1. Get current environment variables
aws amplify get-app \
  --app-id d1508w3f27cyps \
  --region us-east-1 \
  --query 'app.environmentVariables' \
  --output json > current-env.json

# 2. Edit the JSON file with your changes
# Edit current-env.json

# 3. Apply the updated variables
aws amplify update-app \
  --app-id d1508w3f27cyps \
  --environment-variables file://current-env.json \
  --region us-east-1

# 4. Trigger deployment
aws amplify start-job \
  --app-id d1508w3f27cyps \
  --branch-name feature_Common_Clerk \
  --job-type RELEASE \
  --region us-east-1

# 5. Monitor deployment
aws amplify get-job \
  --app-id d1508w3f27cyps \
  --branch-name feature_Common_Clerk \
  --job-id <job-id-from-previous-command> \
  --region us-east-1
```

## Additional Resources

- [AWS Amplify CLI Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/amplify/index.html)
- [Amplify Environment Variables Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [AWS CLI Installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Scripts Included

- `scripts/set-amplify-env-vars.sh` - Bash script for Linux/Mac
- `scripts/set-amplify-env-vars.ps1` - PowerShell script for Windows
- `.env.amplify.example` - Template for environment variables

### Script Parameters

Both scripts support flexible parameter configuration:

**Bash Script (`set-amplify-env-vars.sh`):**
```bash
./scripts/set-amplify-env-vars.sh [env-file] [branch-name] [app-id] [region]
```

Parameters (all optional):
- `env-file` - Path to environment file (default: `.env.amplify`)
- `branch-name` - AWS Amplify branch name (default: `feature_Common_Clerk`)
- `app-id` - AWS Amplify app ID (default: `d1508w3f27cyps`)
- `region` - AWS region (default: `us-east-1`)

**PowerShell Script (`set-amplify-env-vars.ps1`):**
```powershell
.\scripts\set-amplify-env-vars.ps1 [-EnvFile <path>] [-BranchName <name>] [-AppId <id>] [-Region <region>]
```

Parameters (all optional):
- `-EnvFile` - Path to environment file (default: `.env.amplify`)
- `-BranchName` - AWS Amplify branch name (default: `feature_Common_Clerk`)
- `-AppId` - AWS Amplify app ID (default: `d1508w3f27cyps`)
- `-Region` - AWS region (default: `us-east-1`)

### Multiple Environment Support

You can maintain separate environment files for different deployments:

```bash
# Production environment
./scripts/set-amplify-env-vars.sh .env.production main

# Development environment
./scripts/set-amplify-env-vars.sh .env.development dev-branch

# Staging environment
./scripts/set-amplify-env-vars.sh .env.staging staging-branch
```

Both scripts:
- Read from specified `.env` file and parse KEY=VALUE pairs
- Support comments (lines starting with `#`)
- Handle inline comments
- Remove quotes from values
- Apply all variables in one command to AWS Amplify
