```markdown
# 🌟 Glidebar — The Fastest Sidebar for Links & Notes

Glidebar is a beautifully designed, ultra-minimal Chrome sidebar that opens instantly with  
**⌘ + ⇧ + Y (Command + Shift + Y)**.

Save links, take notes, and stay organized — all inside a smooth, glass-morphic UI inspired by modern macOS aesthetics.

---

## 🚀 Features

### 🔗 **Save Links Instantly**
Just paste a URL and hit **Enter**.  
Glidebar auto-detects valid links, adds the favicon, and stores everything neatly.

### 📝 **Quick Notes**
Type anything and hit:
- **Enter** → Save as a quick note  
- **Shift + Enter** → Save a note forcibly  
- **Ctrl/Cmd + Enter** → Open the note editor for full editing  

### 🌓 **Light / Dark Theme**
Click the top-right toggle to switch themes instantly.

### 🔍 **Smart Search**
Search through all your saved links and notes in real time.

### 🗑 **Delete Anything Easily**
Clean UI with non-intrusive trash icons — remove notes or links instantly.

### ⚡ **Instant Open**
Click any saved link — it opens immediately in a new tab.

---

## 🎹 Shortcut

### **Open Glidebar Anytime:**
```

⌘ + ⇧ + Y
(Command + Shift + Y)

````

This works anywhere inside Chrome — no need to click anything.

---

## 📦 Installation

### **Option A — Install from Chrome Store (when published)**
(Coming soon)



2. Open Chrome → go to:

   ```
   chrome://extensions
   ```
3. Enable **Developer Mode** (top-right corner)
4. Click **Load Unpacked**
5. Select the project folder you downloaded

You should now see **Glidebar** in your extensions bar.

---

## 🛠 File Structure

```
glidebar/
│
├── popup.html         # UI layout for the popup sidebar
├── popup.css          # Styling / glass UI / animations
├── popup.js           # Core logic (links, notes, search, storage)
│
├── icons/             # Extension icons
├── manifest.json      # Chrome extension manifest
│
└── README.md
```

---

## 🧠 How Data is Stored

Glidebar uses **Chrome Storage Local** — meaning:

✔ Data stays on your device
✔ Fast read/write
✔ Notes & links persist even if Chrome restarts
✔ No cloud or external dependencies

Stored under:

```
chrome.storage.local → Glidebar
```

---

## 📘 How to Use Glidebar

### **Adding a Link**

1. Paste URL
2. Hit **Enter**
3. Done — it appears at the top of the list

### **Adding a Note**

1. Type text
2. Hit:

   * **Enter** → Save
   * **Shift + Enter** → Force save as note
   * **Cmd/Ctrl + Enter** → Open editor

### **Editing Notes**

* Click any note card → opens modal editor
* Save with **Save Note**

### **Deleting Items**

* Each link → trash icon
* Each note → trash icon
* Removes instantly

---

## ⭐ If you like Glidebar…

Drop a star on GitHub!
Every star helps others discover it.
