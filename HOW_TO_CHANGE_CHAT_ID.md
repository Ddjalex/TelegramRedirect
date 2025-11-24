# 🔄 How to Change Target Chat ID

Your bot is now configured to forward messages to chat ID: **7503130172**

## 📍 Quick Change Guide

### For Node.js Bot (Running on Replit)

**EASY WAY - Use Environment Variables (Recommended):**

1. Click on "Tools" → "Secrets" in the left sidebar
2. Find or add: `TARGET_CHAT_ID`
3. Set the value to your desired chat ID (e.g., `383870190`)
4. Restart the workflow
5. Done! ✅

**OR Edit the File:**

1. Open file: `src/mastra/workflows/telegramForwardWorkflow.ts`
2. Find line 15: `const TARGET_CHAT_ID = process.env.TARGET_CHAT_ID || "7503130172";`
3. Change `"7503130172"` to your new chat ID
4. Restart the workflow

---

### For PHP Bot (cPanel)

1. Open file: `cpanel-bot/config.php`
2. Find line 16: `define('TARGET_CHAT_ID', '7503130172');`
3. Change `'7503130172'` to your new chat ID (e.g., `'383870190'`)
4. Save the file
5. Done! ✅ (No restart needed)

---

## 🎯 Examples

**To forward to chat ID 383870190:**
- Replit: Set environment variable `TARGET_CHAT_ID` = `383870190`
- cPanel: Change line 16 to `define('TARGET_CHAT_ID', '383870190');`

**To forward to chat ID 7503130172:**
- Replit: Set environment variable `TARGET_CHAT_ID` = `7503130172`
- cPanel: Change line 16 to `define('TARGET_CHAT_ID', '7503130172');`

---

## ✅ Current Configuration

- **Node.js Bot (Replit):** Forwards to `7503130172`
- **PHP Bot (cPanel):** Forwards to `7503130172`

You can change these anytime using the instructions above!
