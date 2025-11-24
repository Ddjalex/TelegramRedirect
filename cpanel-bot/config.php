<?php
/**
 * Telegram Bot Configuration
 * 
 * IMPORTANT: Keep this file secure and don't commit it to public repositories
 */

// Telegram Bot Token - Get this from @BotFather
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');

// Target Chat ID - The chat where all messages will be forwarded
define('TARGET_CHAT_ID', '7503130172');

// Enable logging for debugging (set to false in production)
define('ENABLE_LOGGING', true);

// Log file path
define('LOG_FILE', __DIR__ . '/bot.log');

// Telegram API Base URL
define('TELEGRAM_API_URL', 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN);
