# 🚀 Quick Start: Edit Tours & Contact Info

## For Absolute Beginners - 5 Minute Guide

### Step 1: Open the Right File

**To Edit Tours:**
- Open: `client/src/data/tours-data.js`

**To Edit Contact Info:**
- Open: `client/src/data/contact-info.js`

### Step 2: Make Your Changes

Find the line you want to change and edit the text between the quotes.

**Example - Change a tour price:**
```javascript
// Find this line:
price: '$199',

// Change to:
price: '$249',
```

**Example - Change email:**
```javascript
// Find this line:
emailPrimary: 'info@egyptadvisortours.com',

// Change to:
emailPrimary: 'hello@mynewdomain.com',
```

### Step 3: Save the File

Press `Ctrl + S` (Windows) or `Cmd + S` (Mac)

### Step 4: Test Your Changes

Open terminal/command prompt and type:
```bash
cd path/to/egypt-advisor-tours
npm start
```

Wait for it to open in your browser!

---

## 📍 Where Are the Files?

```
egypt-advisor-tours/
└── client/
    └── src/
        └── data/              ← EDIT THESE FILES
            ├── tours-data.js       ← Tours information
            └── contact-info.js     ← Contact details
```

---

## ✅ Rules to Remember

1. **Keep the quotes** around text: `'like this'`
2. **Keep the commas** at the end: `,`
3. **Don't change** field names (name, price, email, etc.)
4. **Save before testing**

---

## ❌ Common Mistakes

| Mistake | How to Fix |
|---------|-----------|
| Missing comma | Add `,` at end of line |
| Missing quote | Add `'` before and after text |
| Changed field name | Change it back (use Ctrl+Z) |
| Website won't load | Check for red error messages |

---

## 🆘 Quick Help

**If something breaks:**
1. Press `Ctrl + Z` to undo
2. Save the file
3. Try again

**Still stuck?** See the full guide: `BEGINNER-GUIDE.md`

---

## 🎯 Most Common Edits

### Change Tour Price
File: `tours-data.js` → Find `price: '$199',` → Change number

### Change Phone Number  
File: `contact-info.js` → Find `phone:` → Change number

### Change Email
File: `contact-info.js` → Find `emailPrimary:` → Change email

### Add Social Media
File: `contact-info.js` → Find `socialMedia:` → Replace `#` with URL

---

**That's it! You're ready to edit your website! 🎉**

For detailed instructions, read: `BEGINNER-GUIDE.md`
