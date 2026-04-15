# CSS Conflict - Manual Resolution

## When to Use This Guide

Use this guide when:
- The `resolve-css-conflict.bat` script is not available
- You prefer manual control over the resolution
- You want to understand what the scripts do
- Automated scripts aren't working for any reason

## Quick Manual Fix (30 Seconds)

```bash
# Step 1: Accept incoming CSS changes
git checkout --theirs client/src/App.css

# Step 2: Stage the resolved file
git add client/src/App.css

# Step 3: Complete the merge
git commit -m "Resolve CSS merge conflict - accept incoming changes"

# Step 4: Verify resolution
git status
```

**Expected output:** `nothing to commit, working tree clean`

Done! Now continue with `npm install` and start the servers.

## Detailed Step-by-Step

### Step 1: Understand the Conflict

When you see:
```
CONFLICT (content): Merge conflict in client/src/App.css
Automatic merge failed; fix conflicts and then commit the result.
```

This means both your local version and the incoming version have changes to the same CSS file.

### Step 2: Check Current Status

```bash
git status
```

**You'll see:**
```
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   client/src/App.css
```

### Step 3: Choose Resolution Strategy

**We recommend accepting incoming changes** because they include:
- ✅ Logo image styling (`.logo-link`, `.logo-image` classes)
- ✅ Responsive logo sizing (60px desktop, 45px mobile)
- ✅ Updated hero section styling
- ✅ Admin button footer styling
- ✅ All version 1.0.2 improvements

**To accept incoming changes:**
```bash
git checkout --theirs client/src/App.css
```

**Alternative - Keep your local changes (not recommended):**
```bash
git checkout --ours client/src/App.css
```

**Alternative - Manually merge (advanced):**
```bash
# Open file in editor and manually resolve conflicts
notepad client\src\App.css     # Windows
nano client/src/App.css        # Mac/Linux
```

### Step 4: Stage the Resolved File

```bash
git add client/src/App.css
```

**Check staging worked:**
```bash
git status
```

**Should show:**
```
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
        modified:   client/src/App.css
```

### Step 5: Commit the Merge

```bash
git commit -m "Resolve CSS merge conflict - accept incoming changes"
```

**Expected output:**
```
[your-branch abc1234] Resolve CSS merge conflict - accept incoming changes
 1 file changed, X insertions(+), Y deletions(-)
```

### Step 6: Verify Clean State

```bash
git status
```

**Should show:**
```
On branch copilot/remove-video-from-hero
Your branch is ahead of 'origin/copilot/remove-video-from-hero' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

## Command Cheat Sheet

| Command | Purpose |
|---------|---------|
| `git status` | Check conflict status |
| `git checkout --theirs <file>` | Accept incoming version |
| `git checkout --ours <file>` | Keep your version |
| `git add <file>` | Mark as resolved |
| `git commit` | Complete merge |
| `git merge --abort` | Cancel merge and start over |

## Visual: Before and After

**Before (Conflict State):**
```
client/src/App.css
<<<<<<< HEAD
.logo { height: 50px; }
=======
.logo-image { height: 60px; max-width: 280px; }
>>>>>>> copilot/remove-video-from-hero
```

**After (Accepting Incoming):**
```
client/src/App.css
.logo-image { height: 60px; max-width: 280px; }
```

## What's in the Incoming CSS?

The incoming CSS (v1.0.2) includes:

### 1. Logo Image Styling
```css
.logo-link {
  text-decoration: none;
  display: inline-block;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.logo-image {
  height: 60px;
  max-width: 280px;
  width: auto;
  object-fit: contain;
}
```

### 2. Hero Section Updates
```css
.hero-content {
  /* Traditional hero styling */
}
```

### 3. Responsive Design
```css
@media (max-width: 768px) {
  .logo-image {
    height: 45px;
    max-width: 220px;
  }
}
```

## Troubleshooting

### "error: path 'client/src/App.css' is unmerged"

You need to resolve the conflict first. Use `git checkout --theirs` as shown above.

### "fatal: Unable to write new index file"

File permissions issue. Try running terminal as administrator (Windows) or with sudo (Mac/Linux).

### Still showing conflicts after resolution

Make sure you:
1. Ran `git checkout --theirs client/src/App.css`
2. Ran `git add client/src/App.css`
3. Ran `git commit`

Check status: `git status` should show clean working tree.

### Want to start over?

Abort the merge and try again:
```bash
git merge --abort
git status  # Should show clean state
```

Then try pulling again or follow MISSING-SCRIPTS-FIX.md.

## Next Steps

After resolving the conflict:

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

2. **Start servers**:
   ```bash
   # Terminal 1
   npm run start:server

   # Terminal 2
   npm run start:client
   ```

3. **Verify in browser**:
   - Open http://localhost:3000
   - Press Ctrl+Shift+R (hard refresh 3 times)
   - Check logo displays as image (Gold Logo.png)
   - Check Admin button in footer
   - Press F12 and check console for "Version 1.0.2"

## Related Guides

- `MISSING-SCRIPTS-FIX.md` - If scripts aren't available
- `RESOLVE-CSS-CONFLICT.md` - Detailed CSS conflict guide
- `RESOLVE-MERGE-CONFLICTS.md` - General merge conflict guide
- `QUICK-FIX-CONFLICTS.md` - Quick reference

## Summary

**Three commands to fix CSS conflicts:**
```bash
git checkout --theirs client/src/App.css
git add client/src/App.css
git commit -m "Resolve CSS conflict"
```

That's it! The conflict is resolved.
