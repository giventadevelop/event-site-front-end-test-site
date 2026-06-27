# Git Long Path Support Fix for Windows

## Problem
When trying to checkout a Git branch on Windows, you may encounter this error:
```
error: unable to create file [very-long-path]: Filename too long
fatal: cannot create directory at '[very-long-path]': Filename too long
```

This happens because Windows filesystem has a 260-character limit for file paths, and Git is trying to create files with longer paths.

## Solution 1: Enable Long Path Support in Git (Recommended)

Run this command to enable Git's long path support:

```bash
git config --global core.longpaths true
```

Then retry your checkout:

```bash
git checkout your-branch-name -f
```

## Alternative Solutions

### Solution 2: Enable Long Path Support in Windows (System-wide)
1. Open PowerShell as Administrator
2. Run this command:
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```
3. Restart your computer

### Solution 3: Use Git Bash
Git Bash often handles long paths better than PowerShell on Windows.

### Solution 4: Clone to a shorter path
If the issue persists, clone the repository to a shorter path like `C:\git\project-name` instead of a very long path.

## What the fix does
The `core.longpaths true` setting tells Git to use Windows' long path support when available, allowing it to handle file paths longer than 260 characters. This is set globally for all your Git repositories, so you won't encounter this issue again in the future.

## Verification
After applying the fix, you can verify it worked by checking your current branch:
```bash
git branch
```

## Example Success Output
```
PS C:\Users\gain\git\mal_us_site_event_register\malayalees-us-site> git checkout free_event_registration -f
Updating files: 100% (631/631), done.
branch 'free_event_registration' set up to track 'origin/free_event_registration'.
Switched to a new branch 'free_event_registration'
```

---
*This documentation was generated to help resolve Git long path issues on Windows systems.*
