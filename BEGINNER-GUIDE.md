# 🎓 Beginner's Guide to Editing the Egypt Advisor Tours Website

Welcome! This guide will help you easily edit tours, contact information, and other content on your website without needing to know complex programming.

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [How to Edit Tours](#how-to-edit-tours)
3. [How to Edit Contact Information](#how-to-edit-contact-information)
4. [How to Add a New Tour](#how-to-add-a-new-tour)
5. [How to Test Your Changes](#how-to-test-your-changes)
6. [Common Issues and Solutions](#common-issues-and-solutions)

---

## 🚀 Getting Started

### What You'll Need:
- A text editor (VS Code is recommended - it's free!)
- Access to the website files on your computer
- Basic understanding of copying and pasting text

### Important Files to Know:
```
client/src/data/
├── tours-data.js          ← Edit tours here
└── contact-info.js        ← Edit contact info here

client/src/pages/
└── Contact.jsx            ← Contact page details
```

---

## 🎫 How to Edit Tours

### Step 1: Open the Tours File
1. Navigate to: `client/src/data/tours-data.js`
2. Open it in your text editor (VS Code, Notepad++, etc.)

### Step 2: Find the Tour You Want to Edit
Tours are listed like this:
```javascript
{
  id: 1,
  name: 'Pyramids of Giza',
  price: '$199',
  duration: '4 hours',
  description: 'Stand in awe of the world\'s last remaining wonder...',
  image: '🏛️',
  rating: 4.9,
  reviews: 324,
  groupSize: '2-10 people'
}
```

### Step 3: Edit the Information You Want to Change

#### Example: Change the Price
**Before:**
```javascript
price: '$199',
```

**After:**
```javascript
price: '$249',
```

#### Example: Update the Description
**Before:**
```javascript
description: 'Stand in awe of the world\'s last remaining wonder...',
```

**After:**
```javascript
description: 'Experience the magnificent Pyramids with our expert guides...',
```

### ⚠️ Important Rules:
- Keep the quotes around text: `'like this'`
- Keep the comma at the end of each line: `,`
- Don't change the field names (id, name, price, etc.)
- If the text has apostrophes, use `\'` like this: `'world\'s'`

---

## 📞 How to Edit Contact Information

### Step 1: Open the Contact Info File
1. Navigate to: `client/src/data/contact-info.js`
2. Open it in your text editor

### Step 2: Edit Your Contact Details

The file looks like this:
```javascript
export const contactInfo = {
  companyName: 'Egypt Advisor Tours',
  emailPrimary: 'info@egyptadvisortours.com',
  phone: '+20 (123) 456-7890',
  // ... more fields
};
```

### Examples of Changes:

#### Change Email Address:
```javascript
emailPrimary: 'bookings@mynewemail.com',
```

#### Change Phone Number:
```javascript
phone: '+20 (555) 123-4567',
```

#### Update Social Media Links:
```javascript
socialMedia: {
  facebook: 'https://facebook.com/your-page',
  instagram: 'https://instagram.com/your-account',
  twitter: 'https://twitter.com/your-handle',
  youtube: 'https://youtube.com/@your-channel'
}
```

### Update Contact Page Details:
For more detailed contact page changes, edit: `client/src/pages/Contact.jsx`

Find these sections:
```javascript
// Address
<p>Cairo, Egypt</p>

// Phone
<p>+20 123 456 7890</p>

// Email
<p>info@egyptadvisortours.com</p>
```

---

## ➕ How to Add a New Tour

### Step 1: Open tours-data.js
Navigate to: `client/src/data/tours-data.js`

### Step 2: Copy an Existing Tour
Copy this entire block (including the curly braces and comma):
```javascript
  {
    id: 6,
    name: 'Abu Simbel Temples',
    price: '$299',
    duration: '8-10 hours',
    description: 'Visit the spectacular Abu Simbel temples...',
    image: '🗿',
    rating: 4.85,
    reviews: 189,
    groupSize: '2-15 people'
  }
```

### Step 3: Paste it at the End
Paste it just before the closing `];` at the end of the tours array.

### Step 4: Update the Information
```javascript
  {
    id: 7,                              ← Change to next number
    name: 'Aswan High Dam',             ← Your new tour name
    price: '$129',                      ← Your price
    duration: '2 hours',                ← Tour duration
    description: 'Explore the engineering marvel...',  ← Your description
    image: '🏗️',                        ← Choose an emoji
    rating: 4.7,                        ← Rating (0-5)
    reviews: 150,                       ← Number of reviews
    groupSize: '2-20 people'            ← Group size
  }
```

### Step 5: Find Emoji Icons
Visit [Emojipedia.org](https://emojipedia.org) to find and copy emoji icons for your tours.

**Example Icons:**
- 🏛️ Ancient buildings
- 🕌 Mosques/Temples
- ⚱️ Artifacts
- 🚤 Boats/Cruises
- 🏺 Museums
- 🗿 Statues
- 🏜️ Desert
- 🐪 Camel tours

---

## 🧪 How to Test Your Changes

### Option 1: Run Locally (Recommended)

1. **Open Terminal/Command Prompt**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type `terminal`, press Enter

2. **Navigate to Your Project**
   ```bash
   cd path/to/egypt-advisor-tours
   ```

3. **Install Dependencies** (first time only)
   ```bash
   npm run install:all
   ```

4. **Start the Website**
   ```bash
   npm start
   ```

5. **View Your Website**
   - Open your browser
   - Go to: `http://localhost:3000`
   - Check your changes!

6. **Stop the Server**
   - Press `Ctrl + C` in the terminal

### Option 2: Check for Errors

Run this command to check for syntax errors:
```bash
npm run build
```

If there are errors, read the message carefully - it will tell you which file and line has the problem.

---

## ❓ Common Issues and Solutions

### Issue 1: Website Won't Load After Changes

**Problem:** You forgot a comma or quote
**Solution:** 
- Check that every line ends with a comma `,`
- Check that text is wrapped in quotes `'like this'`
- Use your editor's "undo" feature (Ctrl+Z / Cmd+Z)

### Issue 2: Tour Doesn't Appear

**Problem:** Wrong format or syntax error
**Solution:**
- Make sure the tour object has all required fields
- Check that the `id` is unique
- Verify the tour is inside the `tours` array (before the `];`)

### Issue 3: Changes Don't Show Up

**Problem:** Browser cache
**Solution:**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear your browser cache

### Issue 4: "Module not found" Error

**Problem:** File path is wrong
**Solution:**
- Check that all files are in the correct folders
- Make sure file names match exactly (case-sensitive!)

---

## 📚 Quick Reference: Tour Fields

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique number | `7` |
| `name` | Tour title | `'Pyramids of Giza'` |
| `price` | Cost with $ | `'$199'` |
| `duration` | Time length | `'4 hours'` |
| `description` | Details | `'Explore the ancient...'` |
| `image` | Emoji icon | `'🏛️'` |
| `rating` | Stars (0-5) | `4.9` |
| `reviews` | Review count | `324` |
| `groupSize` | People range | `'2-10 people'` |

---

## 📚 Quick Reference: Contact Fields

| Field | Description | Example |
|-------|-------------|---------|
| `companyName` | Business name | `'Egypt Advisor Tours'` |
| `emailPrimary` | Main email | `'info@example.com'` |
| `phone` | Phone number | `'+20 123 456 7890'` |
| `address.city` | City location | `'Cairo'` |
| `socialMedia.facebook` | FB URL | `'https://facebook.com/...'` |

---

## 🎯 Best Practices for Beginners

### ✅ DO:
- Save your file before testing (Ctrl+S / Cmd+S)
- Test one change at a time
- Keep a backup copy of working files
- Read error messages carefully
- Use meaningful tour names and descriptions

### ❌ DON'T:
- Change file names
- Modify field names (like `id`, `name`, `price`)
- Delete commas or quotes
- Mix up single quotes `'` with backticks `` ` ``
- Edit files while the website is running (stop it first)

---

## 🆘 Getting Help

### If You're Stuck:
1. **Check the error message** - it usually tells you what's wrong
2. **Compare with working examples** - copy the format exactly
3. **Undo your changes** - use Ctrl+Z / Cmd+Z
4. **Start fresh** - restore from backup if needed

### Useful Commands:
```bash
# See all available commands
npm run help

# Check for errors without running
npm run build

# Clean start (if things are broken)
rm -rf node_modules
npm run install:all
```

---

## 🎓 Learning Resources

### Want to Learn More?

**Beginner Tutorials:**
- [JavaScript Basics (FreeCodeCamp)](https://www.freecodecamp.org/learn)
- [React Tutorial (Official)](https://react.dev/learn)

**Text Editors:**
- [VS Code](https://code.visualstudio.com/) - Best for beginners
- [Sublime Text](https://www.sublimetext.com/)

**Practice Sites:**
- [CodePen](https://codepen.io/) - Test code snippets
- [JSFiddle](https://jsfiddle.net/) - JavaScript playground

---

## 📞 Next Steps

Once you're comfortable editing tours and contacts:
1. Learn about CSS styling to change colors and layouts
2. Explore React components for more advanced changes
3. Set up version control with Git/GitHub

---

## 🎉 You Did It!

Remember: Everyone starts as a beginner. Take your time, make small changes, and test frequently. You'll get better with practice!

**Happy editing! 🚀**
