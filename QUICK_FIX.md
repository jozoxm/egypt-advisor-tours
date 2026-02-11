# Quick Fix: Git Merge Conflict Error

## The Problem

You tried to run:
```bash
git pull origin copilot/finish-project-tasks
```

And got this error:
```
error: The following untracked working tree files would be overwritten by merge:
        server/package-lock.json
Please move or remove them before you merge.
Aborting
```

## The Solution (3 Easy Steps)

### Windows Users:

```cmd
cd server
del package-lock.json
cd ..
git pull origin copilot/finish-project-tasks
cd server
npm install
```

### Mac/Linux Users:

```bash
cd server
rm package-lock.json
cd ..
git pull origin copilot/finish-project-tasks
cd server
npm install
```

## What This Does

1. **Removes** your local untracked `package-lock.json` file
2. **Pulls** the updated version from GitHub (which includes security fixes)
3. **Installs** dependencies with the new secure `package-lock.json`

## Expected Result

After following these steps, you should see:

```
✅ added 221 packages
✅ found 0 vulnerabilities
```

## Why This Happened

- You had a local `package-lock.json` file that Git wasn't tracking
- The remote branch has a tracked version of this file with security updates
- Git won't overwrite your local file to prevent data loss
- Solution: Remove your local version and pull the updated one

## Automated Fix Available

After you successfully pull the updates, you'll have access to automated fix scripts for future issues:

- **Windows**: `fix-merge-conflict.bat`
- **Mac/Linux**: `fix-merge-conflict.sh`

## Need More Help?

After pulling the updates, see:
- `GIT_MERGE_CONFLICT_GUIDE.md` - Complete troubleshooting guide
- `NEXT_STEPS.md` - Troubleshooting section

## What's in the Update?

The latest pull includes:
- ✅ Updated nodemon from 2.0.7 to 3.1.11
- ✅ Fixed 3 high severity vulnerabilities
- ✅ Secure package-lock.json
- ✅ Helper scripts and documentation

---

**Still having trouble?** Run these commands to check your status:

```bash
git status
git branch
ls -la server/  # Mac/Linux
dir server\     # Windows
```
