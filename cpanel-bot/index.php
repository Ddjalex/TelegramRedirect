<?php
/**
 * Telegram Bot Configuration Panel
 * 
 * SECURITY: This file should be password-protected via .htaccess
 * or removed from production servers after configuration.
 */

require_once 'config.php';

session_start();

$ADMIN_PASSWORD = 'changeme123';
$AUTH_TIMEOUT = 1800;

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true || 
    (time() - ($_SESSION['auth_time'] ?? 0)) > $AUTH_TIMEOUT) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
        if (hash_equals($ADMIN_PASSWORD, $_POST['password'])) {
            session_regenerate_id(true);
            $_SESSION['authenticated'] = true;
            $_SESSION['auth_time'] = time();
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        } else {
            $loginError = 'Invalid password';
        }
    }
    
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login - Bot Configuration</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .login-box {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 100%;
                }
                h1 { margin: 0 0 10px; font-size: 24px; color: #333; }
                p { color: #666; margin: 0 0 30px; font-size: 14px; }
                input[type="password"] {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 16px;
                    margin-bottom: 15px;
                }
                button {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .error { color: #dc3545; margin-bottom: 15px; font-weight: 500; }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    color: #856404;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h1>🔒 Login Required</h1>
                <p>Enter password to access bot configuration</p>
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Change the default password in index.php ($ADMIN_PASSWORD) before deployment!
                </div>
                <?php if (isset($loginError)): ?>
                    <div class="error"><?php echo htmlspecialchars($loginError); ?></div>
                <?php endif; ?>
                <form method="POST">
                    <input type="password" name="password" placeholder="Enter password" required autofocus>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function validateChatId($chatId) {
    return preg_match('/^-?\d{1,20}$/', $chatId);
}

function getCsrfField() {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($_SESSION['csrf_token']) . '">';
}

function validateCsrfToken() {
    if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $_POST['csrf_token']);
}

$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken()) {
        $message = 'Invalid security token. Please try again.';
        $messageType = 'error';
    } else {
        $action = $_POST['action'] ?? '';
        
        if ($action === 'add' && !empty($_POST['chat_id'])) {
            $newChatId = trim($_POST['chat_id']);
            if (!validateChatId($newChatId)) {
                $message = 'Invalid chat ID format. Must be a number (optionally negative).';
                $messageType = 'error';
            } else {
                $result = addExcludedChatId($newChatId);
                $message = $result['message'];
                $messageType = $result['success'] ? 'success' : 'error';
            }
        } elseif ($action === 'remove' && !empty($_POST['chat_id'])) {
            $chatIdToRemove = trim($_POST['chat_id']);
            if (!validateChatId($chatIdToRemove)) {
                $message = 'Invalid chat ID format.';
                $messageType = 'error';
            } else {
                $result = removeExcludedChatId($chatIdToRemove);
                $message = $result['message'];
                $messageType = $result['success'] ? 'success' : 'error';
            }
        } elseif ($action === 'clear') {
            $result = clearExcludedChatIds();
            $message = $result['message'];
            $messageType = $result['success'] ? 'success' : 'error';
        } elseif ($action === 'logout') {
            session_destroy();
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        }
    }
    
    $configContent = file_get_contents(__DIR__ . '/config.php');
    preg_match("/define\('EXCLUDED_CHAT_IDS',\s*\[(.*?)\]\);/s", $configContent, $matches);
    $excludedIds = [];
    if (isset($matches[1]) && !empty(trim($matches[1]))) {
        $idsString = $matches[1];
        preg_match_all("/'([^']+)'/", $idsString, $idMatches);
        $excludedIds = $idMatches[1] ?? [];
    }
} else {
    $excludedIds = EXCLUDED_CHAT_IDS;
}

function addExcludedChatId($chatId) {
    $configFile = __DIR__ . '/config.php';
    
    $fp = fopen($configFile, 'c+');
    if (!$fp) {
        return ['success' => false, 'message' => 'Failed to open config file.'];
    }
    
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['success' => false, 'message' => 'Failed to lock config file.'];
    }
    
    $configContent = stream_get_contents($fp);
    
    $pattern = "/define\('EXCLUDED_CHAT_IDS',\s*(?:\[(.*?)\]|array\((.*?)\))\);/s";
    preg_match($pattern, $configContent, $matches);
    $currentIds = [];
    
    if (isset($matches[1]) && !empty(trim($matches[1]))) {
        preg_match_all("/'([^']+)'/", $matches[1], $idMatches);
        $currentIds = $idMatches[1] ?? [];
    } elseif (isset($matches[2]) && !empty(trim($matches[2]))) {
        preg_match_all("/'([^']+)'/", $matches[2], $idMatches);
        $currentIds = $idMatches[1] ?? [];
    }
    
    if (in_array($chatId, $currentIds, true)) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return ['success' => false, 'message' => "Chat ID '$chatId' is already in the excluded list."];
    }
    
    $currentIds[] = $chatId;
    
    $arrayContent = var_export($currentIds, true);
    $arrayContent = preg_replace('/^array\s*\(/', '[', $arrayContent);
    $arrayContent = preg_replace('/\)$/', ']', $arrayContent);
    
    $newDefine = "define('EXCLUDED_CHAT_IDS', " . $arrayContent . ");";
    
    $newContent = preg_replace($pattern, $newDefine, $configContent);
    
    rewind($fp);
    ftruncate($fp, 0);
    fwrite($fp, $newContent);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    
    return ['success' => true, 'message' => "Chat ID '$chatId' added successfully!"];
}

function removeExcludedChatId($chatId) {
    $configFile = __DIR__ . '/config.php';
    
    $fp = fopen($configFile, 'c+');
    if (!$fp) {
        return ['success' => false, 'message' => 'Failed to open config file.'];
    }
    
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['success' => false, 'message' => 'Failed to lock config file.'];
    }
    
    $configContent = stream_get_contents($fp);
    
    $pattern = "/define\('EXCLUDED_CHAT_IDS',\s*(?:\[(.*?)\]|array\((.*?)\))\);/s";
    preg_match($pattern, $configContent, $matches);
    $currentIds = [];
    
    if (isset($matches[1]) && !empty(trim($matches[1]))) {
        preg_match_all("/'([^']+)'/", $matches[1], $idMatches);
        $currentIds = $idMatches[1] ?? [];
    } elseif (isset($matches[2]) && !empty(trim($matches[2]))) {
        preg_match_all("/'([^']+)'/", $matches[2], $idMatches);
        $currentIds = $idMatches[1] ?? [];
    }
    
    $currentIds = array_filter($currentIds, function($id) use ($chatId) {
        return $id !== $chatId;
    });
    $currentIds = array_values($currentIds);
    
    if (empty($currentIds)) {
        $newDefine = "define('EXCLUDED_CHAT_IDS', []);";
    } else {
        $arrayContent = var_export($currentIds, true);
        $arrayContent = preg_replace('/^array\s*\(/', '[', $arrayContent);
        $arrayContent = preg_replace('/\)$/', ']', $arrayContent);
        $newDefine = "define('EXCLUDED_CHAT_IDS', " . $arrayContent . ");";
    }
    
    $newContent = preg_replace($pattern, $newDefine, $configContent);
    
    rewind($fp);
    ftruncate($fp, 0);
    fwrite($fp, $newContent);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    
    return ['success' => true, 'message' => "Chat ID '$chatId' removed successfully!"];
}

function clearExcludedChatIds() {
    $configFile = __DIR__ . '/config.php';
    
    $fp = fopen($configFile, 'c+');
    if (!$fp) {
        return ['success' => false, 'message' => 'Failed to open config file.'];
    }
    
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['success' => false, 'message' => 'Failed to lock config file.'];
    }
    
    $configContent = stream_get_contents($fp);
    
    $newDefine = "define('EXCLUDED_CHAT_IDS', []);";
    
    $pattern = "/define\('EXCLUDED_CHAT_IDS',\s*(?:\[(.*?)\]|array\((.*?)\))\);/s";
    $newContent = preg_replace($pattern, $newDefine, $configContent);
    
    rewind($fp);
    ftruncate($fp, 0);
    fwrite($fp, $newContent);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    
    return ['success' => true, 'message' => 'All excluded chat IDs cleared successfully!'];
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Bot - Configuration Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .logout-btn {
            position: absolute;
            top: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .logout-btn:hover { background: rgba(255, 255, 255, 0.3); }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #333;
            border-left: 4px solid #667eea;
            padding-left: 12px;
        }
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
        }
        input[type="text"]:focus { outline: none; border-color: #667eea; }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-danger { background: #dc3545; color: white; }
        .btn-small { padding: 6px 12px; font-size: 14px; }
        .excluded-list { background: #f8f9fa; border-radius: 8px; padding: 20px; }
        .excluded-item {
            background: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .chat-id { font-family: 'Courier New', monospace; font-weight: 600; color: #667eea; }
        .empty-state { text-align: center; padding: 40px 20px; color: #999; }
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .info-box p { margin: 0; color: #1976D2; font-size: 14px; }
        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .warning-box p { margin: 0; color: #856404; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <form method="POST" style="display: inline;">
                <?php echo getCsrfField(); ?>
                <button type="submit" name="action" value="logout" class="logout-btn">🚪 Logout</button>
            </form>
            <h1>🤖 Telegram Bot Configuration</h1>
            <p>Manage Excluded Chat IDs</p>
        </div>
        
        <div class="content">
            <div class="warning-box">
                <p><strong>⚠️ Security:</strong> Change the default password in index.php ($ADMIN_PASSWORD = 'changeme123') before deploying to production!</p>
            </div>
            
            <?php if ($message): ?>
                <div class="message <?php echo $messageType; ?>">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>
            
            <div class="section">
                <h2>📝 Add Excluded Chat ID</h2>
                <div class="info-box">
                    <p><strong>ℹ️ Info:</strong> Messages from excluded chat IDs will NOT be forwarded. Chat IDs must be numbers (e.g., 123456789 or -987654321).</p>
                </div>
                <form method="POST">
                    <?php echo getCsrfField(); ?>
                    <div class="form-group">
                        <label for="chat_id">Chat ID to Exclude:</label>
                        <input type="text" id="chat_id" name="chat_id" placeholder="Enter chat ID (e.g., 123456789)" pattern="-?\d+" required>
                    </div>
                    <button type="submit" name="action" value="add" class="btn btn-primary">➕ Add Chat ID</button>
                </form>
            </div>
            
            <div class="section">
                <h2>🚫 Excluded Chat IDs</h2>
                <div class="excluded-list">
                    <?php if (empty($excludedIds)): ?>
                        <div class="empty-state">
                            <p>No excluded chat IDs yet.<br>Add one above to get started.</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($excludedIds as $chatId): ?>
                            <div class="excluded-item">
                                <span class="chat-id"><?php echo htmlspecialchars($chatId); ?></span>
                                <form method="POST" style="display: inline;">
                                    <?php echo getCsrfField(); ?>
                                    <input type="hidden" name="chat_id" value="<?php echo htmlspecialchars($chatId); ?>">
                                    <button type="submit" name="action" value="remove" class="btn btn-danger btn-small" onclick="return confirm('Remove chat ID <?php echo htmlspecialchars($chatId); ?>?');">
                                        🗑️ Remove
                                    </button>
                                </form>
                            </div>
                        <?php endforeach; ?>
                        
                        <form method="POST" style="margin-top: 20px;">
                            <?php echo getCsrfField(); ?>
                            <button type="submit" name="action" value="clear" class="btn btn-danger" onclick="return confirm('Clear ALL excluded chat IDs?');">
                                🗑️ Clear All
                            </button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
