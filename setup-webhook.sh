#!/bin/bash

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Error: TELEGRAM_BOT_TOKEN is not set"
    exit 1
fi

WEBHOOK_URL="https://$REPLIT_DEV_DOMAIN/api/telegram/webhook"

echo "🔧 Setting up Telegram webhook..."
echo "📡 Webhook URL: $WEBHOOK_URL"
echo ""

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\", \"allowed_updates\": [\"message\", \"business_message\", \"business_connection\"]}")

echo "Response from Telegram:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

echo "✅ Checking webhook info..."
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | python3 -m json.tool 2>/dev/null

echo ""
echo "🎯 Done! Your bot should now receive messages at:"
echo "   $WEBHOOK_URL"
