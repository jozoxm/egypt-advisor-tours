# Missing Scripts Fix

## Problem

You tried to run `resolve-css-conflict.bat` but got this error:
```
'resolve-css-conflict.bat' is not recognized as an internal or external command,
operable program or batch file.
```

Even after running `git pull`, the scripts aren't available.

## Why This Happens

The scripts exist in the `copilot/remove-video-from-hero` branch but you might be:
1. On a different branch (main/master)
2. Have merge conflicts preventing file checkout
3. Not tracking the right remote branch
4. Git fetched but didn't merge the changes

## Quick Check

First, check which branch you're on:
```bash
git branch
```

If you see `* main` or `* master` instead of `* copilot/remove-video-from-hero`, that's the issue!

## Solution 1: Switch to Correct Branch (Recommended)

**This is the easiest solution if you don't have uncommitted changes:**

```bash
# Switch to the feature branch
git checkout copilot/remove-video-from-hero

# Pull latest changes
git pull origin copilot/remove-video-from-hero

# Verify scripts are now available
dir resolve*.bat    # Windows
ls resolve*.bat     # Mac/Linux

# Run the script
resolve-css-conflict.bat
```

**Expected output after checkout:**
```
Switched to branch 'copilot/remove-video-from-hero'
Your branch is up to date with 'origin/copilot/remove-video-from-hero'.
```

## Solution 2: Get Scripts Without Switching Branch

**If you want to stay on your current branch but need the scripts:**

```bash
# Get the script from the feature branch
git checkout origin/copilot/remove-video-from-hero -- resolve-css-conflict.bat
git checkout origin/copilot/remove-video-from-hero -- resolve-css-conflict.sh

# Verify scripts downloaded
dir resolve-css-conflict.bat

# Now run the script
resolve-css-conflict.bat
```

## Solution 3: Manual Resolution (No Scripts Needed)

**If you just want to fix the CSS conflict without the scripts:**

See `CSS-CONFLICT-MANUAL.md` for complete manual instructions, or use these commands:

```bash
# Accept incoming changes for CSS file
git checkout --theirs client/src/App.css

# Stage the resolved file
git add client/src/App.css

# Commit the merge
git commit -m "Resolve CSS merge conflict - accept incoming changes"

# Verify no conflicts remain
git status
```

**Expected output:**
```
On branch [your-branch]
nothing to commit, working tree clean
```

## Solution 4: Fresh Clone (Nuclear Option)

**If nothing else works, start fresh:**

```bash
# Navigate out of current directory
cd ..

# Backup your current directory (optional)
move egypt-advisor-tours egypt-advisor-tours-backup

# Clone fresh from the correct branch
git clone -b copilot/remove-video-from-hero https://github.com/jozoxm/egypt-advisor-tours.git

# Navigate into new clone
cd egypt-advisor-tours

# Verify scripts exist
dir resolve*.bat

# Continue with setup
npm install
```

## Verification

After applying any solution, verify everything is ready:

```bash
# 1. Check you're on the right branch
git branch
# Should show: * copilot/remove-video-from-hero

# 2. Check scripts exist
dir resolve*.bat          # Windows
ls -l resolve*.bat        # Mac/Linux
# Should show: resolve-css-conflict.bat, resolve-conflicts.bat

# 3. Check for conflicts
git status
# Should show: clean working tree OR list conflicts to resolve

# 4. If scripts exist, run them
resolve-css-conflict.bat  # Windows
./resolve-css-conflict.sh # Mac/Linux
```

## Understanding "Already up to date"

When `git pull` says "Already up to date", it means:
- Your **current** branch is up to date with what it's tracking
- Doesn't mean you have the latest from **all** branches
- If you're on `main` tracking `origin/main`, it's up to date with that
- But the scripts are in `copilot/remove-video-from-hero`, not `main`

**Example:**
```bash
# You're on main branch
git branch
* main

# You run git pull
git pull
Already up to date.  ← Your main IS up to date

# But scripts are in different branch
git checkout copilot/remove-video-from-hero
Switched to branch 'copilot/remove-video-from-hero'

# Now pull that branch
git pull origin copilot/remove-video-from-hero
Updating files...  ← NOW you get the new files

# Scripts are now available!
resolve-css-conflict.bat
```

## Troubleshooting

### "fatal: pathspec 'copilot/remove-video-from-hero' did not match any file(s)"

The branch doesn't exist locally yet. Fetch it first:
```bash
git fetch origin
git checkout copilot/remove-video-from-hero
```

### "error: Your local changes would be overwritten by checkout"

You have uncommitted changes. Either commit them or stash them:
```bash
# Option 1: Commit your changes
git add .
git commit -m "My local changes"
git checkout copilot/remove-video-from-hero

# Option 2: Stash your changes
git stash
git checkout copilot/remove-video-from-hero
git stash pop  # Apply your changes back
```

### "CONFLICT (content): Merge conflict in..."

You have merge conflicts. Use Solution 3 (manual resolution) or see `RESOLVE-CSS-CONFLICT.md`.

### Scripts downloaded but still not recognized

1. Make sure you're in the repository root directory:
   ```bash
   cd D:\save\New folder\egypt-advisor-tours
   ```

2. Check scripts exist:
   ```bash
   dir resolve*.bat
   ```

3. Run with explicit path:
   ```bash
   .\resolve-css-conflict.bat    # Windows PowerShell
   resolve-css-conflict.bat      # Windows CMD
   ```

## Next Steps

After resolving the script issue and any conflicts:

1. **Install dependencies** (if new packages added):
   ```bash
   cd client
   npm install
   cd ..
   ```

2. **Start the application**:
   ```bash
   # Terminal 1 - Backend
   npm run start:server

   # Terminal 2 - Frontend
   npm run start:client
   ```

3. **Verify in browser**:
   - Open http://localhost:3000
   - Press F12 for console
   - Should see: "Egypt Advisor Tours - Version 1.0.2"
   - Hard refresh: Ctrl+Shift+R (3 times)
   - Check logo displays as image
   - Check Admin button in footer

## Related Documentation

- `CSS-CONFLICT-MANUAL.md` - Manual conflict resolution commands
- `RESOLVE-CSS-CONFLICT.md` - Complete CSS conflict guide
- `QUICK-FIX-CONFLICTS.md` - Quick reference for all conflicts
- `RESOLVE-MERGE-CONFLICTS.md` - General merge conflict guide
- `COMMANDS-IN-ORDER.md` - Complete command reference
- `START-HERE.md` - Main getting started guide

## Summary

**Most common cause:** You're on the wrong branch.

**Quickest fix:**
```bash
git checkout copilot/remove-video-from-hero
git pull origin copilot/remove-video-from-hero
resolve-css-conflict.bat
```

**If that doesn't work:** Use Solution 3 (manual commands) from this guide.

**Still stuck?** See `CSS-CONFLICT-MANUAL.md` for step-by-step manual resolution.
