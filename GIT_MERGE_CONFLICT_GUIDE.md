# Git Merge Conflict Resolution Guide

## Issue Encountered

When attempting to pull updates from the `copilot/finish-project-tasks` branch, you may encounter this error:

```
error: The following untracked working tree files would be overwritten by merge:
        server/package-lock.json
Please move or remove them before you merge.
Aborting
```

## Why This Happens

This error occurs when:
1. You have a local `server/package-lock.json` file that Git is not tracking
2. The remote branch you're pulling contains a tracked `server/package-lock.json` file
3. Git refuses to overwrite your local untracked file to prevent data loss

## Solution Options

### Option 1: Remove Local File and Pull (Recommended)

This is the simplest solution if you don't have any local changes you need to keep:

```bash
# Navigate to the server directory
cd server

# Remove the local package-lock.json
rm package-lock.json
# On Windows: del package-lock.json

# Go back to root directory
cd ..

# Now pull the changes
git pull origin copilot/finish-project-tasks

# Install dependencies to regenerate package-lock.json if needed
cd server
npm install
```

### Option 2: Backup and Pull

If you want to keep your local file for comparison:

```bash
# From the egypt-advisor-tours root directory

# Backup the local file
copy server\package-lock.json server\package-lock.json.backup
# On Mac/Linux: cp server/package-lock.json server/package-lock.json.backup

# Remove the original
del server\package-lock.json
# On Mac/Linux: rm server/package-lock.json

# Pull the changes
git pull origin copilot/finish-project-tasks

# Compare if needed
# Your backup is in server/package-lock.json.backup
```

### Option 3: Force Overwrite (Use with Caution)

If you're certain you want to discard local changes:

```bash
# This will overwrite your local untracked files
git fetch origin copilot/finish-project-tasks
git reset --hard origin/copilot/finish-project-tasks
```

**⚠️ Warning:** This will discard ALL local changes in your working directory!

## After Pulling Successfully

Once you've successfully pulled the changes, verify everything works:

```bash
# Navigate to server directory
cd server

# Install dependencies (in case of any updates)
npm install

# Verify no vulnerabilities (should show 0)
npm audit

# Test the development server
npm run dev
```

Expected results:
- ✅ `npm install` completes successfully
- ✅ `npm audit` shows "found 0 vulnerabilities"
- ✅ `npm run dev` starts the server without errors

## What Changed in the Latest Update

The recent pull includes a security fix that:
- Updated `nodemon` from version 2.0.7 to 3.1.11
- Fixed 3 high severity vulnerabilities
- Updated `package-lock.json` with secure dependencies

## Prevention for Future

To avoid this issue in the future:

1. **Always check git status before pulling:**
   ```bash
   git status
   ```

2. **Stash local changes before pulling:**
   ```bash
   git stash
   git pull origin copilot/finish-project-tasks
   git stash pop
   ```

3. **Keep your local branch in sync:**
   ```bash
   git pull origin copilot/finish-project-tasks
   ```
   Do this regularly to avoid conflicts.

## Still Having Issues?

If you continue to experience problems:

1. **Check which files are untracked:**
   ```bash
   git status
   ```

2. **Check if package-lock.json should be ignored:**
   ```bash
   # This should NOT show package-lock.json
   cat .gitignore
   ```
   Note: `package-lock.json` should be committed to git (not ignored)

3. **Verify your current branch:**
   ```bash
   git branch
   ```

4. **Check remote connection:**
   ```bash
   git remote -v
   ```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git status` | Check current state |
| `git pull origin copilot/finish-project-tasks` | Pull latest changes |
| `git fetch origin` | Download changes without merging |
| `git reset --hard origin/copilot/finish-project-tasks` | Force sync with remote (loses local changes) |
| `npm install` | Install/update dependencies |
| `npm audit` | Check for vulnerabilities |

## Need Help?

If the issue persists, provide the output of:
```bash
git status
git log --oneline -5
ls -la server/
```

This will help diagnose the specific issue with your repository state.
