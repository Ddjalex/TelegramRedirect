# 📂 How to Exclude Folders/Chats from Forwarding

## 🎯 What This Feature Does

If you have certain folders (like "Personal Meet") where you **don't want messages forwarded**, you can now exclude them!

The bot will:
- ✅ Forward messages from all other folders
- ⏭️ Skip (ignore) messages from excluded folders

---

## 🔍 How to Find Chat IDs to Exclude

### Step 1: Send a message from the chat you want to exclude

For example, send any message from a chat inside your "Personal Meet" folder

### Step 2: Check the bot logs

The logs will show the chat ID:
```
"chat_id": "123456789"
```

### Step 3: Copy that chat ID

You'll use this ID in the configuration below.

---

## ⚙️ How to Configure Excluded Chats

### For Node.js Bot (Replit):

**Option A: Use Environment Variable (Recommended)**

1. Go to **Secrets** panel (🔒 icon in left sidebar)
2. Add new secret: `EXCLUDED_CHAT_IDS`
3. Set the value:
   - Single chat: `123456789`
   - Multiple chats: `123456789,987654321,555444333` (comma-separated)
4. Restart the workflow
5. Done! ✅

**Option B: Edit Code**

- **File:** `src/mastra/index.ts`
- **Line:** 260-262
- **Change the default:**

```javascript
const EXCLUDED_CHAT_IDS = process.env.EXCLUDED_CHAT_IDS 
  ? process.env.EXCLUDED_CHAT_IDS.split(',').map(id => id.trim())
  : []; // Add chat IDs here: ['123456789', '987654321']
```

---

### For PHP Bot (cPanel):

- **File:** `cpanel-bot/config.php`
- **Line:** 27
- **Edit:**

```php
// Exclude single chat
define('EXCLUDED_CHAT_IDS', ['123456789']);

// Exclude multiple chats
define('EXCLUDED_CHAT_IDS', ['123456789', '987654321', '555444333']);

// Don't exclude any chats (default)
define('EXCLUDED_CHAT_IDS', []);
```

---

## 📊 Examples

### Example 1: Exclude 1 personal chat
```
EXCLUDED_CHAT_IDS = 123456789
```
✅ All folders forward EXCEPT chat 123456789

### Example 2: Exclude multiple chats (Personal Meet folder)
```
EXCLUDED_CHAT_IDS = 123456789,987654321,555444333
```
✅ All folders forward EXCEPT those 3 chats

### Example 3: No exclusions (forward everything)
```
EXCLUDED_CHAT_IDS = (empty or not set)
```
✅ All folders forward normally

---

## 🔍 Visual Explanation

```
┌─────────────────────────────────────────────┐
│  YOUR TELEGRAM FOLDERS:                     │
├─────────────────────────────────────────────┤
│  📁 Personal           → ✅ Forwards         │
│  📁 Important          → ✅ Forwards         │
│  📁 Unread             → ✅ Forwards         │
│  📁 TON News           → ✅ Forwards         │
│  📁 Airdrop            → ✅ Forwards         │
│  📁 Personal Meet      → ⏭️ EXCLUDED         │
│     (Chat ID: 123456)                        │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup Guide

### Step-by-Step:

1. **Create your "Personal Meet" folder** in Telegram
2. **Send a test message** from any chat inside that folder
3. **Check the logs** to find the chat ID
4. **Add the chat ID** to `EXCLUDED_CHAT_IDS`:
   - **Replit:** Add to Secrets: `EXCLUDED_CHAT_IDS` = `123456789`
   - **cPanel:** Edit `config.php` line 27
5. **Restart the workflow** (Replit) or just save (cPanel)
6. **Test:** Send another message from that folder
7. ✅ Message should **NOT** be forwarded!

---

## ✅ How to Verify It's Working

### Test 1: Send from excluded folder
- Send message from "Personal Meet" folder
- Check bot logs → Should show: **"Skipping - chat is in excluded list"**
- ✅ Message NOT forwarded

### Test 2: Send from normal folder
- Send message from "Important" folder
- Check bot logs → Should show: **"Message forwarded successfully"**
- ✅ Message forwarded to target chat

---

## 📋 Current Configuration

| Setting | Current Value |
|---------|---------------|
| **Excluded Chats** | None (empty) |
| **Status** | All folders forward normally |

**To exclude folders, add their chat IDs using the guide above!**

---

## 🔧 Troubleshooting

**Q: How do I find the chat ID?**  
A: Send a message from that chat and check the bot logs. Look for `"chat_id": "123456"`

**Q: Can I exclude multiple chats?**  
A: Yes! Just separate them with commas: `123456,789012,555333`

**Q: Messages are still being forwarded from excluded chat?**  
A: Make sure you:
- Restarted the workflow (Replit)
- Used the correct chat ID (not user ID)
- Saved the config.php file (cPanel)

**Q: What's the difference between chat ID and user ID?**  
A: User ID = who sent the message. Chat ID = where the message was sent (the conversation/group).

---

## 💡 Use Cases

✅ Exclude private/personal conversations  
✅ Exclude work-related chats  
✅ Exclude specific groups  
✅ Create a "Personal Meet" folder and exclude all chats in it  
✅ Keep family chats private while forwarding business chats  

---

**Now you have full control over which folders/chats to forward!** 🎉
