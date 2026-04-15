# Visual Guide: New Features

## 1. Photo Upload for Tours

### Admin Panel - Tours Tab

```
┌─────────────────────────────────────────────────────────────┐
│ 🎨 Full Control Admin Panel                                 │
├─────────────────────────────────────────────────────────────┤
│ [🎫 Edit Tours] [📝 Edit Blogs] [🖼️ Gallery] ...           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Manage Tours                    [➕ Add New Tour]          │
│  ═══════════════════════════════════════════════════════     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Editing: Pyramids of Giza                             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │ Tour Name:     [Pyramids of Giza                    ]  │  │
│  │ Price:         [$225                                ]  │  │
│  │ Duration:      [4 hours                             ]  │  │
│  │ Icon Emoji:    [🏛️                                   ]  │  │
│  │                                                         │  │
│  │ Photo URL (Optional):                                  │  │
│  │ [https://images.unsplash.com/...                    ]  │  │
│  │ Enter an image URL or upload a file below.             │  │
│  │                                                         │  │
│  │ Or Upload Photo:                          ← NEW!       │  │
│  │ [Choose File] No file chosen                           │  │
│  │ Upload an image file (max 5MB)                         │  │
│  │                                                         │  │
│  │ ╔═══════════════════════════════════════════╗          │  │
│  │ ║  📷 Preview                                ║ ← NEW!  │  │
│  │ ║  ┌────────────────────────────────────┐  ║          │  │
│  │ ║  │                                      │  ║          │  │
│  │ ║  │      [Uploaded Image Preview]       │  ║          │  │
│  │ ║  │                                      │  ║          │  │
│  │ ║  └────────────────────────────────────┘  ║          │  │
│  │ ║  [✕ Remove Photo]                        ║ ← NEW!  │  │
│  │ ╚═══════════════════════════════════════════╝          │  │
│  │                                                         │  │
│  │ Description:                                            │  │
│  │ [Stand in awe of the world's last remaining wonder...]  │
│  │                                                         │  │
│  │ [Save Changes] [Cancel]                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Features:
- **File Input**: Standard browser file picker
- **Validation**: 5MB limit, images only
- **Preview**: Shows uploaded image immediately
- **Remove Button**: Clear the uploaded photo
- **Dual Option**: Can use URL or upload file

---

## 2. Mobile Inquiry Button

### Desktop View (>768px)

```
┌─────────────────────────────────────────────────┐
│ [🏛️ Logo]  [Home] [Tours] [About] [Contact] [Inquiry] │  ← Button in navbar
├─────────────────────────────────────────────────┤
│                                                   │
│              Hero Section                        │
│                                                   │
│         [Content flows normally]                 │
│                                                   │
│                                                   │
│              Tours Section                       │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Mobile View (≤768px)

```
┌──────────────────────────┐
│ [🏛️ Logo]      [☰]      │  ← Inquiry button HIDDEN in navbar
├──────────────────────────┤
│                          │
│    Hero Section          │
│                          │
│   [Content flows]        │
│                          │
│    Tours Section         │
│                          │
│   [Content flows]        │
│                          │
│    About Section         │
│                          │
│   [Content flows]        │
│                          │
│                    ┌────┐│  ← NEW! Fixed button
│                    │📧  ││     Always visible
│                    │Inq ││     Pulses for attention
│                    └────┘│     Bottom-right corner
│    Contact Section       │
│                          │
└──────────────────────────┘
```

### Button Behavior:

**Desktop (>768px)**
- ✅ Navbar button visible
- ❌ Fixed button hidden

**Mobile (≤768px)**
- ❌ Navbar button hidden
- ✅ Fixed button visible
- 💫 Pulse animation
- 📍 Bottom-right: 20px
- 🎯 Click → scroll to contact
- 🎨 Gold gradient theme

---

## 3. User Flows

### Photo Upload Flow

```
Start
  ↓
User clicks "Edit Tour" or "Add New Tour"
  ↓
Form opens with two photo options:
  ├─→ Enter Photo URL (existing)
  └─→ Upload Photo File (NEW)
        ↓
User clicks "Choose File"
        ↓
Browser file picker opens
        ↓
User selects image file
        ↓
    ┌──────────────────┐
    │  Validation      │
    │  - Size ≤ 5MB?   │
    │  - Image type?   │
    └──────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
   PASS         FAIL
    │             │
    ↓             ↓
Convert to    Show error
Base64        message
    ↓             │
Show preview      │
    ↓             │
[Remove button]   │
    ↓             │
User clicks "Save Changes"
    ↓
Photo saved to server
    ↓
Success message
    ↓
End
```

### Mobile Inquiry Flow

```
User visits site on mobile
         ↓
Page loads
         ↓
Fixed button appears at bottom-right
         ↓
Button pulses (animation)
         ↓
User notices button
         ↓
User taps button
         ↓
Page smoothly scrolls to contact section
         ↓
User can fill contact form
         ↓
End
```

---

## 4. CSS Structure

### Mobile Media Query Breakdown

```css
/* Desktop (Default) */
.contact-btn {
  display: block;        /* Visible in navbar */
}
.mobile-inquiry-btn {
  display: none;         /* Hidden on desktop */
}

/* Mobile (≤768px) */
@media (max-width: 768px) {
  .contact-btn {
    display: none;       /* Hide navbar button */
  }
  
  .mobile-inquiry-btn {
    display: block;      /* Show fixed button */
    position: fixed;     /* Fixed positioning */
    bottom: 20px;        /* 20px from bottom */
    right: 20px;         /* 20px from right */
    z-index: 998;        /* Above content */
    animation: pulse-button 2s infinite; /* Attention */
  }
}
```

---

## 5. File Structure

```
client/src/
├── App.js
│   └── Added: <button className="mobile-inquiry-btn">
├── App.css
│   ├── Added: .mobile-inquiry-btn styles
│   ├── Added: @keyframes pulse-button
│   └── Updated: @media (max-width: 768px)
├── pages/
│   ├── AdminPanel.jsx
│   │   ├── Added: handleTourPhotoUpload()
│   │   └── Updated: Tour edit form with file input
│   └── AdminPanel.css
│       ├── Added: .file-input
│       ├── Added: .photo-preview-container
│       ├── Added: .photo-preview
│       └── Added: .btn-remove-photo
└── data/
    └── tours-data.js
        └── Photos stored in photoUrl field (base64)
```

---

## 6. Testing Checklist

### Photo Upload
- [ ] JPG upload works
- [ ] PNG upload works  
- [ ] GIF upload works
- [ ] WebP upload works
- [ ] File >5MB rejected
- [ ] Non-image file rejected
- [ ] Preview displays correctly
- [ ] Remove button works
- [ ] Save persists photo
- [ ] URL field still works

### Mobile Button
- [ ] Visible on 768px width
- [ ] Visible on 414px width (iPhone)
- [ ] Visible on 375px width (iPhone SE)
- [ ] Visible on 320px width (small phones)
- [ ] Hidden on 769px width (desktop)
- [ ] Pulse animation works
- [ ] Click scrolls smoothly
- [ ] Doesn't cover footer content
- [ ] Z-index is correct (above content, below modals)
- [ ] Works in landscape orientation
