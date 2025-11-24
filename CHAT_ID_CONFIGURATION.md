# 📋 Chat ID Configuration Guide

Your bot now has TWO different chat ID settings:

## 🔵 1. WHO CAN SEND MESSAGES TO THE BOT (Source/Allowed Chat IDs)

This controls **which users can trigger** the bot.

### Current Setting:
- ✅ **Only chat ID `383870190` can send messages to the bot**
- 🚫 All other users will be blocked

### Where to Change It:

#### For Node.js Bot (Replit):

**Option A: Use Environment Variable (Easy)**
1. Go to **Secrets** panel (🔒 icon)
2. Find or add: `ALLOWED_CHAT_IDS`
3. Set value to: `383870190` (single user)
4. Or multiple users: `383870190,7503130172` (comma-separated)
5. Restart workflow

**Option B: Edit Code**
- **File:** `src/mastra/index.ts`
- **Line:** 245
- **Change:** `['383870190']` to your allowed chat IDs

```javascript
const ALLOWED_CHAT_IDS = process.env.ALLOWED_CHAT_IDS 
  ? process.env.ALLOWED_CHAT_IDS.split(',')
  : ['383870190']; // Change this line
```

#### For PHP Bot (cPanel):

- **File:** `cpanel-bot/config.php`
- **Line:** 21
- **Change:** `['383870190']` to your allowed chat IDs

```php
// Single user
define('ALLOWED_CHAT_IDS', ['383870190']);

// Multiple users
define('ALLOWED_CHAT_IDS', ['383870190', '7503130172']);

// Accept from ALL users (no filter)
define('ALLOWED_CHAT_IDS', []);
```

---

## 🔴 2. WHERE MESSAGES ARE FORWARDED TO (Target/Destination Chat ID)

This controls **where the bot sends** the forwarded messages.

### Current Setting:
- ✅ **All messages are forwarded to chat ID `7503130172`**

### Where to Change It:

#### For Node.js Bot (Replit):

**Option A: Use Environment Variable (Easy)**
1. Go to **Secrets** panel (🔒 icon)
2. Find or add: `TARGET_CHAT_ID`
3. Set value to your desired chat ID
4. Restart workflow

**Option B: Edit Code**
- **File:** `src/mastra/workflows/telegramForwardWorkflow.ts`
- **Line:** 15
- **Change:** `"7503130172"` to your target chat ID

```javascript
const TARGET_CHAT_ID = process.env.TARGET_CHAT_ID || "7503130172"; // Change default here
```

#### For PHP Bot (cPanel):

- **File:** `cpanel-bot/config.php`
- **Line:** 16
- **Change:** `'7503130172'` to your target chat ID

```php
define('TARGET_CHAT_ID', '7503130172'); // Change this
```

---

## 📊 CURRENT CONFIGURATION

| Setting | Node.js (Replit) | PHP (cPanel) |
|---------|------------------|--------------|
| **Who can send to bot** | `383870190` | `383870190` |
| **Where messages go to** | `7503130172` | `7503130172` |

---

## 🎯 EXAMPLES

### Example 1: Only user 383870190 can trigger, forward to 7503130172
```
ALLOWED_CHAT_IDS = 383870190
TARGET_CHAT_ID = 7503130172
```
✅ This is your **CURRENT** setup!

### Example 2: Multiple users can trigger, forward to one chat
```
ALLOWED_CHAT_IDS = 383870190,7503130172,111222333
TARGET_CHAT_ID = 7503130172
```

### Example 3: Accept from ALL users, forward to specific chat
```
ALLOWED_CHAT_IDS = [] (empty - no filter)
TARGET_CHAT_ID = 7503130172
```

### Example 4: Only one user can trigger, forward to different chat
```
ALLOWED_CHAT_IDS = 383870190
TARGET_CHAT_ID = 999888777
```

---

## 🔍 VISUAL EXPLANATION

```
User 383870190 → Sends message → BOT → Forwards to → Chat 7503130172
     ↑                                                       ↑
 ALLOWED_CHAT_IDS                                    TARGET_CHAT_ID
(Who can send)                                    (Where it goes)
```

---

## ⚙️ QUICK CHANGE COMMANDS

### To Allow Multiple Senders:
**Replit:** Set `ALLOWED_CHAT_IDS` = `383870190,7503130172`  
**cPanel:** `define('ALLOWED_CHAT_IDS', ['383870190', '7503130172']);`

### To Accept From All Users:
**Replit:** Delete `ALLOWED_CHAT_IDS` variable (or leave empty)  
**cPanel:** `define('ALLOWED_CHAT_IDS', []);`

### To Change Forward Destination:
**Replit:** Set `TARGET_CHAT_ID` = `YOUR_CHAT_ID`  
**cPanel:** `define('TARGET_CHAT_ID', 'YOUR_CHAT_ID');`

---

## ✅ HOW TO TEST

1. **Send message from chat ID 383870190** → ✅ Should work and forward to 7503130172
2. **Send message from any other chat ID** → 🚫 Will be blocked
3. **Check bot.log** to see blocked attempts

---

Need to change who can send to the bot? **Change ALLOWED_CHAT_IDS**  
Need to change where messages go? **Change TARGET_CHAT_ID**

Both settings are independent! 🎉
