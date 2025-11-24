<?php
/**
 * Helper Functions for Telegram Bot
 */

/**
 * Extract message data based on message type
 */
function extractMessageData($message) {
    $data = [
        'type' => 'text',
        'text' => '',
        'file_id' => null
    ];

    // Check for photo
    if (isset($message['photo']) && is_array($message['photo']) && count($message['photo']) > 0) {
        $data['type'] = 'photo';
        $data['file_id'] = end($message['photo'])['file_id']; // Get highest resolution
        $data['text'] = $message['caption'] ?? '';
    }
    // Check for video
    elseif (isset($message['video'])) {
        $data['type'] = 'video';
        $data['file_id'] = $message['video']['file_id'];
        $data['text'] = $message['caption'] ?? '';
    }
    // Check for audio
    elseif (isset($message['audio'])) {
        $data['type'] = 'audio';
        $data['file_id'] = $message['audio']['file_id'];
        $data['text'] = $message['caption'] ?? '';
    }
    // Check for voice
    elseif (isset($message['voice'])) {
        $data['type'] = 'voice';
        $data['file_id'] = $message['voice']['file_id'];
        $data['text'] = $message['caption'] ?? '';
    }
    // Check for document
    elseif (isset($message['document'])) {
        $data['type'] = 'document';
        $data['file_id'] = $message['document']['file_id'];
        $data['text'] = $message['caption'] ?? '';
    }
    // Text message
    elseif (isset($message['text'])) {
        $data['text'] = $message['text'];
    }

    return $data;
}

/**
 * Forward message to target chat
 */
function forwardMessage($chatId, $fromUser, $mediaType, $text, $fileId = null) {
    $formattedText = "📨 Forwarded from @{$fromUser}:\n\n{$text}";
    
    $params = [
        'chat_id' => $chatId
    ];

    $method = '';

    switch ($mediaType) {
        case 'photo':
            $method = 'sendPhoto';
            $params['photo'] = $fileId;
            $params['caption'] = $formattedText;
            break;

        case 'video':
            $method = 'sendVideo';
            $params['video'] = $fileId;
            $params['caption'] = $formattedText;
            break;

        case 'audio':
            $method = 'sendAudio';
            $params['audio'] = $fileId;
            $params['caption'] = $formattedText;
            break;

        case 'voice':
            $method = 'sendVoice';
            $params['voice'] = $fileId;
            $params['caption'] = $formattedText;
            break;

        case 'document':
            $method = 'sendDocument';
            $params['document'] = $fileId;
            $params['caption'] = $formattedText;
            break;

        case 'text':
        default:
            $method = 'sendMessage';
            $params['text'] = $formattedText;
            break;
    }

    return sendTelegramRequest($method, $params);
}

/**
 * Send request to Telegram API
 */
function sendTelegramRequest($method, $params) {
    $url = TELEGRAM_API_URL . '/' . $method;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode == 200 && $result['ok']) {
        return [
            'success' => true,
            'message_id' => $result['result']['message_id'] ?? null
        ];
    } else {
        return [
            'success' => false,
            'error' => $result['description'] ?? 'Unknown error'
        ];
    }
}

/**
 * Log message to file
 */
function logMessage($message, $data = null) {
    if (!ENABLE_LOGGING) {
        return;
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] {$message}";
    
    if ($data !== null) {
        $logEntry .= "\n" . json_encode($data, JSON_PRETTY_PRINT);
    }
    
    $logEntry .= "\n" . str_repeat('-', 80) . "\n";
    
    file_put_contents(LOG_FILE, $logEntry, FILE_APPEND);
}

/**
 * Determine chat type from message
 */
function getChatType($message) {
    if (!isset($message['chat'])) {
        return 'unknown';
    }
    
    $chat = $message['chat'];
    $chatType = $chat['type'] ?? 'unknown';
    
    if ($chatType === 'private') {
        return 'individual';
    } elseif ($chatType === 'group' || $chatType === 'supergroup') {
        return 'group';
    } elseif ($chatType === 'channel') {
        return 'channel';
    }
    
    return 'unknown';
}

/**
 * Get chat name from message
 */
function getChatName($message) {
    if (!isset($message['chat'])) {
        return 'Unknown Chat';
    }
    
    $chat = $message['chat'];
    
    if (isset($chat['title'])) {
        return $chat['title'];
    }
    
    if (isset($chat['username'])) {
        return '@' . $chat['username'];
    }
    
    if (isset($chat['first_name'])) {
        $name = $chat['first_name'];
        if (isset($chat['last_name'])) {
            $name .= ' ' . $chat['last_name'];
        }
        return $name;
    }
    
    return 'Unknown Chat';
}
