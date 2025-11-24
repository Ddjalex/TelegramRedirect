# 🤖 Telegram Bot for cPanel Hosting

This is a PHP-based Telegram bot that forwards all incoming messages to a specific chat ID. It's designed to be hosted on cPanel or any PHP hosting service.

## ✨ Features

- ✅ Forwards text messages
- ✅ Forwards photos with captions
- ✅ Forwards videos with captions
- ✅ Forwards audio files
- ✅ Forwards voice messages
- ✅ Forwards documents
- ✅ Simple and lightweight
- ✅ No database required
- ✅ Easy cPanel deployment

## 📋 Requirements

- PHP 7.4 or higher
- cPanel hosting with SSL certificate (HTTPS)
- Telegram Bot Token from @BotFather
- cURL enabled in PHP

## 🚀 Installation Instructions

### Step 1: Upload Files to cPanel

1. Log into your cPanel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain's root directory)
4. Create a new folder (e.g., `telegram-bot`)
5. Upload all these files to that folder:
   - `config.php`
   - `webhook.php`
   - `functions.php`
   - `setup.php`
   - `.htaccess`

### Step 2: Configure Your Bot

1. Open `config.php` in the cPanel File Manager editor
2. Replace `YOUR_BOT_TOKEN_HERE` with your actual bot token from @BotFather
3. Verify the `TARGET_CHAT_ID` is correct (currently set to `7503130172`)
4. Save the file

### Step 3: Set Up the Webhook

1. Open your browser and go to: `https://yourdomain.com/telegram-bot/setup.php`
2. Click the "🚀 Setup Webhook" button
3. You should see a success message
4. The webhook is now registered with Telegram!

### Step 4: Test Your Bot

Send any message to your Telegram bot:
- Text messages
- Photos
- Videos
- Voice messages
- Audio files
- Documents

All messages should be instantly forwarded to chat ID `7503130172`!

## 🔧 Configuration Options

Edit `config.php` to customize:

```php
// Your bot token from @BotFather
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');

// Chat ID where messages will be forwarded
define('TARGET_CHAT_ID', '7503130172');

// Enable/disable logging (turn off in production for better performance)
define('ENABLE_LOGGING', true);
```

## 📝 Logging

The bot creates a `bot.log` file to help with debugging. You can:

- View it in cPanel File Manager
- Download it to check for errors
- Disable it by setting `ENABLE_LOGGING` to `false` in `config.php`

## 🔒 Security

The `.htaccess` file provides security:
- Forces HTTPS
- Blocks direct access to `config.php`
- Blocks direct access to log files
- Allows only `webhook.php` and `setup.php` to be accessed

## 🐛 Troubleshooting

### Bot not receiving messages?

1. Check that your bot token is correct in `config.php`
2. Make sure your domain has SSL (HTTPS is required)
3. Verify the webhook is set up by visiting `setup.php`
4. Check `bot.log` for error messages

### Getting 403 or 500 errors?

1. Check file permissions (644 for PHP files, 755 for directories)
2. Make sure PHP cURL extension is enabled
3. Contact your hosting provider to verify PHP settings

### Messages not forwarding?

1. Check the `bot.log` file for errors
2. Verify the `TARGET_CHAT_ID` is correct
3. Make sure the bot has permission to send messages to that chat

## 📂 File Structure

```
telegram-bot/
├── config.php         # Configuration settings
├── webhook.php        # Webhook handler (receives messages)
├── functions.php      # Helper functions
├── setup.php          # One-time setup page
├── .htaccess         # Security and routing
├── bot.log           # Log file (auto-created)
└── README.md         # This file
```

## 🔄 Updating

To update your bot:
1. Upload the new files via cPanel File Manager
2. Your `config.php` settings will be preserved
3. No need to re-run setup unless changing domains

## 💡 Tips

- Keep your bot token secret - never share it!
- Regularly check `bot.log` for issues
- Delete `setup.php` after initial setup for added security
- Consider adding rate limiting for high-traffic bots

## 🆘 Support

If you encounter issues:
1. Check the `bot.log` file
2. Verify your cPanel PHP version is 7.4+
3. Ensure cURL is enabled
4. Contact your hosting provider for server-specific issues

## ✅ Verification

To verify your bot is working:
1. Send a message to your bot on Telegram
2. Check if it appears in chat ID `7503130172`
3. Check `bot.log` to see the processing details

---

**Made with ❤️ for easy cPanel deployment**
