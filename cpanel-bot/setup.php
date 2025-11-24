<?php
/**
 * Webhook Setup Script
 * 
 * Run this file once to register your webhook with Telegram
 * Access it via: https://yourdomain.com/setup.php
 */

require_once 'config.php';

// Get your domain - you'll need to set this
$webhookUrl = 'https://YOUR_DOMAIN_HERE/webhook.php';

// You can also get it automatically if your server is configured properly
if (isset($_SERVER['HTTP_HOST'])) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $webhookUrl = $protocol . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/webhook.php';
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Telegram Bot Setup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #0088cc; }
        .info { 
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .success {
            background: #c8e6c9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .error {
            background: #ffcdd2;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        button {
            background: #0088cc;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #006699;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Telegram Bot Setup</h1>
        
        <?php
        if (isset($_POST['setup'])) {
            // Register webhook
            $url = TELEGRAM_API_URL . '/setWebhook?url=' . urlencode($webhookUrl);
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            curl_close($ch);
            
            $result = json_decode($response, true);
            
            if ($result['ok']) {
                echo '<div class="success">';
                echo '<h3>✅ Webhook Registered Successfully!</h3>';
                echo '<p>Your bot is now ready to receive messages.</p>';
                echo '<p><strong>Webhook URL:</strong> ' . htmlspecialchars($webhookUrl) . '</p>';
                echo '</div>';
                
                // Get webhook info
                $infoUrl = TELEGRAM_API_URL . '/getWebhookInfo';
                $ch = curl_init($infoUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $infoResponse = curl_exec($ch);
                curl_close($ch);
                
                $info = json_decode($infoResponse, true);
                if ($info['ok']) {
                    echo '<div class="info">';
                    echo '<h4>Webhook Information:</h4>';
                    echo '<pre>' . json_encode($info['result'], JSON_PRETTY_PRINT) . '</pre>';
                    echo '</div>';
                }
            } else {
                echo '<div class="error">';
                echo '<h3>❌ Setup Failed</h3>';
                echo '<p>' . htmlspecialchars($result['description']) . '</p>';
                echo '</div>';
            }
        }
        ?>
        
        <div class="info">
            <h3>📋 Before Setting Up:</h3>
            <ol>
                <li>Make sure you've updated <code>config.php</code> with your Bot Token</li>
                <li>Verify the target chat ID is correct: <code><?php echo TARGET_CHAT_ID; ?></code></li>
                <li>Ensure this URL is accessible: <code><?php echo htmlspecialchars($webhookUrl); ?></code></li>
            </ol>
        </div>
        
        <form method="POST">
            <p><strong>Webhook URL to register:</strong><br>
            <code><?php echo htmlspecialchars($webhookUrl); ?></code></p>
            
            <button type="submit" name="setup">🚀 Setup Webhook</button>
        </form>
        
        <div class="info" style="margin-top: 30px;">
            <h3>🔧 Troubleshooting:</h3>
            <ul>
                <li>Make sure your bot token is correct in <code>config.php</code></li>
                <li>Ensure your domain has SSL certificate (HTTPS required)</li>
                <li>Check that <code>webhook.php</code> is accessible publicly</li>
                <li>View logs in <code>bot.log</code> for debugging</li>
            </ul>
        </div>
    </div>
</body>
</html>
