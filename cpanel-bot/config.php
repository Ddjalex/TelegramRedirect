<?php
/**
 * Telegram Bot Configuration
 * 
 * IMPORTANT: Keep this file secure and don't commit it to public repositories
 */

// Telegram Bot Token - Get this from @BotFather
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');

// Target Chat ID - The chat where all messages will be forwarded
// CHANGE THIS to forward messages to a different chat
define('TARGET_CHAT_ID', '7503130172');

// Allowed Chat IDs - Only these chat IDs can send messages to the bot
// Add multiple IDs separated by commas: ['123456', '789012']
// Set to empty array [] to accept from ALL users
define('ALLOWED_CHAT_IDS', ['383870190']);

// Enable logging for debugging (set to false in production)
define('ENABLE_LOGGING', true);

// Log file path
define('LOG_FILE', __DIR__ . '/bot.log');

// Telegram API Base URL
define('TELEGRAM_API_URL', 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN);
