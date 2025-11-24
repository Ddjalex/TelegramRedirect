<?php
/**
 * Telegram Bot Webhook Handler
 * 
 * This file receives incoming messages from Telegram and forwards them
 * to the specified target chat ID.
 */

require_once 'config.php';
require_once 'functions.php';

// Set content type
header('Content-Type: application/json');

// Get the incoming webhook data
$input = file_get_contents('php://input');
$update = json_decode($input, true);

// Log the incoming request
logMessage("Received webhook", $update);

// Check if we have valid update data
if (!$update || !isset($update['message'])) {
    logMessage("Invalid update - no message data");
    echo json_encode(['ok' => true, 'skipped' => true]);
    exit;
}

$message = $update['message'];

// Extract sender information
$senderId = $message['from']['id'] ?? 'unknown';
$senderUsername = $message['from']['username'] ?? $message['from']['first_name'] ?? 'unknown';

// ========== FILTER: ONLY ACCEPT MESSAGES FROM SPECIFIC CHAT IDs ==========
// Check if sender is allowed (if ALLOWED_CHAT_IDS is not empty)
if (!empty(ALLOWED_CHAT_IDS) && !in_array((string)$senderId, ALLOWED_CHAT_IDS)) {
    logMessage("Blocked - sender not in allowed list", [
        'sender_id' => $senderId,
        'allowed_ids' => ALLOWED_CHAT_IDS
    ]);
    echo json_encode(['ok' => true, 'message' => 'Not authorized']);
    exit;
}
// ========================================================================

// ========== EXCLUDE SPECIFIC USERS BY USERNAME FROM FORWARDING ==========
// Messages from these Telegram usernames will NOT be forwarded
$username = $message['from']['username'] ?? null;
if (!empty(EXCLUDED_USERNAMES) && $username && in_array(strtolower($username), array_map('strtolower', EXCLUDED_USERNAMES))) {
    logMessage("Skipping - user is in excluded list", [
        'username' => $username,
        'excluded_usernames' => EXCLUDED_USERNAMES
    ]);
    echo json_encode(['ok' => true, 'skipped' => true, 'reason' => 'User excluded from forwarding']);
    exit;
}
// ====================================================================

// Detect message type and extract content
$messageData = extractMessageData($message);

logMessage("Processing message", [
    'sender_id' => $senderId,
    'sender_username' => $senderUsername,
    'media_type' => $messageData['type'],
    'has_file' => !empty($messageData['file_id'])
]);

// Forward the message to target chat
$result = forwardMessage(
    TARGET_CHAT_ID,
    $senderUsername,
    $messageData['type'],
    $messageData['text'],
    $messageData['file_id']
);

if ($result['success']) {
    logMessage("Message forwarded successfully", [
        'message_id' => $result['message_id']
    ]);
    echo json_encode(['ok' => true, 'message' => 'Forwarded successfully']);
} else {
    logMessage("Failed to forward message", [
        'error' => $result['error']
    ]);
    echo json_encode(['ok' => false, 'error' => $result['error']]);
}
