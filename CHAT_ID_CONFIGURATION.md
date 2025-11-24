# 📋 Chat ID Configuration Guide

Your bot now has THREE different chat ID settings:

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

## 🟡 2. EXCLUDE SPECIFIC FOLDERS/CHATS FROM FORWARDING (NEW!)

This controls **which folders/chats to SKIP** (not forward).

### Current Setting:
- ✅ **No exclusions - all messages are forwarded**

### Where to Change It:

#### For Node.js Bot (Replit):

**Option A: Use Environment Variable (Easy)**
1. Go to **Secrets** panel (🔒 icon)
2. Add new secret: `EXCLUDED_CHAT_IDS`
3. Set value to chat IDs you want to exclude:
   - Single: `123456789`
   - Multiple: `123456789,987654321` (comma-separated)
4. Restart workflow

**Option B: Edit Code**
- **File:** `src/mastra/index.ts`
- **Line:** 260-262

```javascript
const EXCLUDED_CHAT_IDS = process.env.EXCLUDED_CHAT_IDS 
  ? process.env.EXCLUDED_CHAT_IDS.split(',').map(id => id.trim())
  : []; // Add chat IDs here to exclude them
```

#### For PHP Bot (cPanel):

- **File:** `cpanel-bot/config.php`
- **Line:** 27

```php
// Exclude chats from forwarding (Personal Meet folder example)
define('EXCLUDED_CHAT_IDS', ['123456789', '987654321']);

// No exclusions (forward everything)
define('EXCLUDED_CHAT_IDS', []);
```

### 📖 Full Guide:
See **`HOW_TO_EXCLUDE_FOLDERS.md`** for detailed instructions on how to exclude your "Personal Meet" folder!

---

## 🔴 3. WHERE MESSAGES ARE FORWARDED TO (Target/Destination Chat ID)

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
| **Excluded chats (don't forward)** | None | None |
| **Where messages go to** | `7503130172` | `7503130172` |

---

## 🎯 EXAMPLES

### Example 1: Basic setup (current)
```
ALLOWED_CHAT_IDS = 383870190
EXCLUDED_CHAT_IDS = (empty)
TARGET_CHAT_ID = 7503130172
```
✅ User 383870190 can send, all chats forward to 7503130172

### Example 2: Exclude "Personal Meet" folder
```
ALLOWED_CHAT_IDS = 383870190
EXCLUDED_CHAT_IDS = 123456789,987654321
TARGET_CHAT_ID = 7503130172
```
✅ User 383870190 can send, but chats 123456789 & 987654321 are skipped

### Example 3: Multiple users, with exclusions
```
ALLOWED_CHAT_IDS = 383870190,7503130172
EXCLUDED_CHAT_IDS = 555666777
TARGET_CHAT_ID = 7503130172
```
✅ Two users can send, chat 555666777 is excluded from forwarding

### Example 4: Accept from all, but exclude private chats
```
ALLOWED_CHAT_IDS = [] (accept all)
EXCLUDED_CHAT_IDS = 111222,333444
TARGET_CHAT_ID = 7503130172
```
✅ Anyone can send, but chats 111222 & 333444 won't forward

---

## 🔍 VISUAL EXPLANATION

```
User 383870190 → Sends message → BOT → Check if excluded? → Forwards to → Chat 7503130172
     ↑                               ↓                                          ↑
 ALLOWED_CHAT_IDS          If chat in EXCLUDED_CHAT_IDS?               TARGET_CHAT_ID
(Who can send)                  ↓ Yes: Skip                          (Where it goes)
                                ↓ No: Forward
```

---

## ⚙️ QUICK CHANGE COMMANDS

### To Allow Multiple Senders:
**Replit:** Set `ALLOWED_CHAT_IDS` = `383870190,7503130172`  
**cPanel:** `define('ALLOWED_CHAT_IDS', ['383870190', '7503130172']);`

### To Exclude Folders/Chats (NEW!):
**Replit:** Set `EXCLUDED_CHAT_IDS` = `123456789,987654321`  
**cPanel:** `define('EXCLUDED_CHAT_IDS', ['123456789', '987654321']);`

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

## 📚 Related Guides

- **How to exclude folders:** See `HOW_TO_EXCLUDE_FOLDERS.md`
- **How to change target chat:** See `HOW_TO_CHANGE_CHAT_ID.md`

---

Need to change who can send to the bot? **Change ALLOWED_CHAT_IDS**  
Need to exclude certain folders? **Change EXCLUDED_CHAT_IDS** (NEW!)  
Need to change where messages go? **Change TARGET_CHAT_ID**

All three settings are independent! 🎉
