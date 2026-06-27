# Cursor Rules Management Guide

## Overview

Cursor rules are project-specific and stored in `.cursor/rules/` directory. This guide explains how to manage and share rules across similar projects.

## Current Rules Status

### ✅ **Project-Specific Rules (Persisted)**
- Stored in `.cursor/rules/` directory
- **Automatically saved** with the project
- Each project has its own isolated rule set
- **Will persist** when switching projects

### ❌ **Memory Rules (Temporary)**
- Rules mentioned in conversation context
- **Will NOT be saved** when switching projects
- Exist only for current session
- **Lost** when you close Cursor or switch projects

## Methods to Share Rules Across Projects

### 1. **Manual Copy Method** (Quick & Simple)
```bash
# Copy rules from current project to another
cp -r .cursor/rules/ /path/to/other/project/.cursor/

# Or use the management script
node scripts/manage-cursor-rules.js export
# Then copy shared-cursor-rules/ to other project
```

### 2. **Git Repository Method** (Recommended)
Create a shared rules repository:

```bash
# Initialize shared rules
node scripts/manage-cursor-rules.js export
node scripts/manage-cursor-rules.js git

# Push to GitHub/GitLab
git remote add origin https://github.com/yourusername/shared-cursor-rules.git
git push -u origin main
```

### 3. **Management Script** (Automated)
Use the provided script for easy rule management:

```bash
# List all rules
node scripts/manage-cursor-rules.js list

# Export current project rules
node scripts/manage-cursor-rules.js export

# Import rules to current project
node scripts/manage-cursor-rules.js import

# Create git repository for shared rules
node scripts/manage-cursor-rules.js git
```

## Workflow for Similar Projects

### Setup New Project with Shared Rules
```bash
# 1. Clone or create new project
git clone https://github.com/yourusername/new-project.git
cd new-project

# 2. Copy shared rules
cp -r /path/to/shared-cursor-rules/* .cursor/rules/

# 3. Or use the script
node scripts/manage-cursor-rules.js import
```

### Update Rules Across Projects
```bash
# 1. Update rules in one project
# 2. Export updated rules
node scripts/manage-cursor-rules.js export

# 3. Commit to shared repository
git add shared-cursor-rules/
git commit -m "Update cursor rules"
git push

# 4. Import in other projects
cd /path/to/other/project
node scripts/manage-cursor-rules.js import
```

## Current Project Rules

Your current project has these rules:

- **common_app_router_aws_amplify_type_safety_best_practices.mdc** (2.7KB)
- **cursor_rules.mdc** (13.7KB)
- **dev_workflow.mdc** (14.1KB)
- **nextjs_api_routes.mdc** (25.6KB)
- **prisma.mdc** (4.0KB)
- **self_improve.mdc** (2.4KB)
- **task-master.mdc** (2.2KB)
- **ui_style_guide.mdc** (14.8KB)

## Best Practices

### 1. **Version Control Your Rules**
- Keep rules in a separate git repository
- Tag releases for major rule updates
- Document rule changes

### 2. **Project-Specific Customization**
- Start with shared rules as base
- Customize for project-specific needs
- Document project-specific additions

### 3. **Regular Updates**
- Review and update rules quarterly
- Remove outdated patterns
- Add new best practices

### 4. **Team Collaboration**
- Share rule repository with team
- Use pull requests for rule changes
- Review rule updates together

## Troubleshooting

### Rules Not Loading
```bash
# Check if .cursor/rules/ exists
ls -la .cursor/rules/

# Recreate rules directory
mkdir -p .cursor/rules/
node scripts/manage-cursor-rules.js import
```

### Rules Not Applying
- Ensure Cursor is restarted after rule changes
- Check rule syntax (must be valid markdown)
- Verify rule file extensions (.mdc)

### Git Issues
```bash
# Reset shared rules
rm -rf shared-cursor-rules/
node scripts/manage-cursor-rules.js export
```

## Quick Commands Reference

```bash
# List all rules
node scripts/manage-cursor-rules.js list

# Export current rules
node scripts/manage-cursor-rules.js export

# Import shared rules
node scripts/manage-cursor-rules.js import

# Create git repo for rules
node scripts/manage-cursor-rules.js git

# Get help
node scripts/manage-cursor-rules.js help
```

## Next Steps

1. **Export your current rules**: `node scripts/manage-cursor-rules.js export`
2. **Create a git repository**: `node scripts/manage-cursor-rules.js git`
3. **Push to GitHub/GitLab** for team sharing
4. **Use in other projects** by importing the shared rules

This ensures your carefully crafted cursor rules are preserved and can be reused across similar Next.js + Clerk + AWS Amplify projects.