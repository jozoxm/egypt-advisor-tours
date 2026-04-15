# How to Replace the Logo

This guide explains how to replace the current logo with your new logo file.

## 📍 Current Logo Location

**File Path:** `D:\save\New folder\egypt-advisor-tours\client\public\Gold Logo.png`

**Current Reference in Code:** `client/src/App.js` line 117

## 🎯 Two Options for Replacing Logo

### Option 1: Keep Same Filename (RECOMMENDED - Easiest)

This is the simplest approach - just replace the file directly.

#### Steps:

1. **Navigate to the logo directory:**
   ```bash
   cd "D:\save\New folder\egypt-advisor-tours\client\public"
   ```

2. **Delete the old logo:**
   ```bash
   del "Gold Logo.png"
   ```

3. **Copy your new logo to the same location with the same name:**
   ```bash
   copy "C:\path\to\your\new-logo.png" "Gold Logo.png"
   ```
   
   *Replace `C:\path\to\your\new-logo.png` with the actual path to your new logo file*

4. **Go back to repository root:**
   ```bash
   cd "D:\save\New folder\egypt-advisor-tours"
   ```

5. **Update cache-busting version in App.js:**
   - Open `client\src\App.js`
   - Find line 117 (the logo line)
   - Change `?v=4` to `?v=5` (increment the number)
   
   ```jsx
   // Before:
   <img src="/Gold Logo.png?v=4" alt="Egypt Advisor Tours" className="logo-img" />
   
   // After:
   <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-img" />
   ```

6. **Save the file**

7. **Test locally:**
   ```bash
   # If server is running, stop it (Ctrl+C)
   npm run start:client
   ```
   
8. **Open browser and hard refresh:**
   - Press `Ctrl + Shift + R` (Windows)
   - Verify your new logo appears

9. **Commit and push changes:**
   ```bash
   git add "client/public/Gold Logo.png"
   git add client/src/App.js
   git commit -m "Replace logo with new version"
   git push origin copilot/add-logo-mobile-responsiveness
   ```

**Done!** Your new logo is now live.

---

### Option 2: Use Different Filename

If you want to use a different filename (e.g., "My-Company-Logo.png"), follow these steps:

#### Steps:

1. **Copy your new logo file to the public directory:**
   ```bash
   cd "D:\save\New folder\egypt-advisor-tours\client\public"
   copy "C:\path\to\your\new-logo.png" "My-Company-Logo.png"
   ```

2. **Update the reference in App.js:**
   - Open `client\src\App.js`
   - Find line 117
   - Change the filename AND increment version:
   
   ```jsx
   // Before:
   <img src="/Gold Logo.png?v=4" alt="Egypt Advisor Tours" className="logo-img" />
   
   // After:
   <img src="/My-Company-Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-img" />
   ```

3. **Optionally delete the old logo:**
   ```bash
   del "Gold Logo.png"
   ```

4. **Test, commit, and push (same as Option 1 steps 7-9)**

---

## 💡 Important Notes

### Logo File Specifications

**Recommended Formats:**
- PNG (with transparency) - Best for most logos
- SVG (vector) - Best for scaling, smallest file size
- JPG - Only if logo has no transparency

**Recommended Dimensions:**
- Width: 400-600 pixels
- Height: 100-200 pixels
- Aspect Ratio: 2:1 to 4:1 (wider logos work best)

**File Size:**
- Keep under 500 KB for fast loading
- Optimize/compress before uploading

### Why Increment the Version Number?

The `?v=4` parameter is called "cache-busting". It forces browsers to download the new logo instead of using the cached version.

**Always increment this number when you replace the logo:**
- First logo: `?v=1`
- Second logo: `?v=2`
- Third logo: `?v=3`
- Current logo: `?v=4`
- Your new logo: `?v=5`
- Next logo: `?v=6`
... and so on.

### Current Logo CSS Settings

Your logo will automatically use these responsive settings:

**Desktop (> 768px):**
- Height: 60px
- Max-width: 280px
- Object-fit: contain (preserves aspect ratio)

**Mobile (< 768px):**
- Height: 45px
- Max-width: 220px
- Object-fit: contain

**Hover Effects:**
- Scale: 1.05 (5% zoom)
- Opacity: 0.9
- Smooth transition

**These settings work for most logo shapes, but if your logo looks odd, you may need to adjust the max-width in `client/src/App.css`.**

---

## 🔍 Verification Checklist

After replacing the logo, verify:

- [ ] Logo displays in the navigation bar (top-left)
- [ ] Logo is clear and not pixelated
- [ ] Logo maintains proper aspect ratio (not stretched)
- [ ] Logo is clickable (links to home)
- [ ] Logo looks good on desktop (check at localhost:3000)
- [ ] Logo looks good on mobile (resize browser window)
- [ ] Hover effect works (logo zooms slightly)
- [ ] No console errors in browser DevTools (F12)
- [ ] Git changes are committed and pushed

---

## 🐛 Troubleshooting

### Logo Not Showing After Replacement

**Solution:**
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache: `Ctrl + Shift + Delete`
3. Try in private/incognito window
4. Verify file is in correct location
5. Check filename spelling matches code exactly

### Logo Too Large/Small

**Solution:**
Edit `client/src/App.css`:

```css
/* For desktop - around line 65 */
.logo-img {
  max-width: 280px;  /* Adjust this value */
}

/* For mobile - around line 923 */
@media (max-width: 768px) {
  .logo-img {
    max-width: 220px;  /* Adjust this value */
  }
}
```

### Logo Looks Blurry

**Solutions:**
- Use a higher resolution image
- Use SVG format (vector, never blurry)
- Use PNG at 2x the display size (e.g., 800px wide for 400px display)

### File Size Too Large

**Solutions:**
- Use https://tinypng.com/ to compress PNG
- Use https://www.svgminify.com/ to compress SVG
- Use image editing software to reduce dimensions
- Convert to SVG format

### Git Says File Not Found

**Solution:**
Make sure you're using the correct path with quotes:
```bash
git add "client/public/Gold Logo.png"
```

Not:
```bash
git add client/public/Gold Logo.png  # ❌ Won't work (spaces in filename)
```

---

## ⚡ Quick Reference Card

For future logo replacements (once you've done it once):

```bash
# 1. Navigate to repo
cd "D:\save\New folder\egypt-advisor-tours"

# 2. Replace file
copy "path\to\new-logo.png" "client\public\Gold Logo.png"

# 3. Edit client/src/App.js - increment ?v=4 to ?v=5

# 4. Test
npm run start:client
# Hard refresh: Ctrl+Shift+R

# 5. Commit
git add "client/public/Gold Logo.png"
git add client/src/App.js
git commit -m "Update logo"
git push origin copilot/add-logo-mobile-responsiveness
```

---

## 📚 Related Documentation

- **COMMAND-REFERENCE.md** - All git and npm commands
- **LOGO-CACHE-TROUBLESHOOTING.md** - Detailed cache issues
- **QUICK-START-GUIDE.md** - General setup guide

---

**Need help? Check the troubleshooting section above or review the emergency guides in the repository root.**
