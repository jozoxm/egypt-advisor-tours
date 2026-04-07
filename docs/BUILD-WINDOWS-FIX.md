# Windows Build Fix

## Problem
When running `npm run build` on Windows, you might encounter this error:
```
'CI' is not recognized as an internal or external command,
operable program or batch file.
```

## Root Cause
The original build script used Unix syntax for setting environment variables:
```json
"build": "CI=false react-scripts build"
```

This syntax works on Mac/Linux but **not on Windows** Command Prompt or PowerShell.

## Solution
We've fixed this by using the `cross-env` package, which provides cross-platform environment variable setting.

### What Changed
1. Added `cross-env` as a development dependency
2. Updated the build script to:
   ```json
   "build": "cross-env CI=false react-scripts build"
   ```

## How to Use

### If You Just Pulled This Update
Everything is already configured! Just run:
```bash
npm run build
```

### If You're on Windows (Before This Fix)
1. Pull the latest changes:
   ```bash
   git pull origin copilot/remove-video-from-hero
   ```

2. Install the new dependency:
   ```bash
   cd client
   npm install
   ```

3. Run the build:
   ```bash
   cd ..
   npm run build
   ```

## What Does CI=false Do?
The `CI=false` environment variable tells React Scripts to treat warnings as warnings (not errors) during the build process. This is useful for development builds where you might have some linting warnings that shouldn't block the build.

## Alternative Solutions (Not Recommended)
If for some reason you can't use `cross-env`, you could:

**Windows PowerShell:**
```powershell
$env:CI="false"; react-scripts build
```

**Windows Command Prompt:**
```cmd
set CI=false && react-scripts build
```

**But these are platform-specific!** That's why we use `cross-env` - it works everywhere.

## Testing
To verify the build works:
```bash
npm run build
```

You should see:
- ✅ "Creating an optimized production build..."
- ✅ "Compiled successfully!" (or with warnings)
- ✅ Build folder created at `client/build/`
- ✅ No errors about 'CI' not being recognized

## About cross-env
- **What**: A cross-platform solution for setting environment variables
- **Size**: Lightweight (~10KB)
- **Compatibility**: Works on Windows, Mac, Linux
- **Industry Standard**: Used by thousands of projects
- **Documentation**: https://www.npmjs.com/package/cross-env

## Need Help?
If you still have build issues:
1. Make sure you've run `npm install` in the client directory
2. Check that Node.js is installed: `node --version`
3. Check that npm is installed: `npm --version`
4. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
5. See other documentation files for troubleshooting: `COMMANDS-IN-ORDER.md`
