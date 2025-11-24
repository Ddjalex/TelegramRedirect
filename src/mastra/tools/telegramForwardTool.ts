import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Telegram Forward Tool
 * 
 * This tool forwards messages to a specified Telegram chat using the Telegram Bot API
 */

export const telegramForwardTool = createTool({
  id: "telegram-forward-tool",

  description:
    "Forwards messages to a specified Telegram chat ID using the Telegram Bot API",

  inputSchema: z.object({
    chatId: z.string().describe("The chat ID to send the message to"),
    message: z.string().describe("The message text to send"),
    fromUser: z.string().optional().describe("Optional: Username of the original sender"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    
    logger?.info("📤 [telegramForwardTool] Starting message forward", {
      chatId: context.chatId,
      messageLength: context.message.length,
      fromUser: context.fromUser,
    });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      logger?.error("❌ [telegramForwardTool] Missing TELEGRAM_BOT_TOKEN");
      return {
        success: false,
        error: "Bot token not configured",
      };
    }

    try {
      // Format the message with sender info if available
      const formattedMessage = context.fromUser
        ? `📨 Forwarded from @${context.fromUser}:\n\n${context.message}`
        : context.message;

      const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      logger?.info("🔄 [telegramForwardTool] Sending request to Telegram API", {
        url: apiUrl,
        chatId: context.chatId,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: context.chatId,
          text: formattedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger?.error("❌ [telegramForwardTool] Telegram API error", {
          status: response.status,
          data,
        });
        return {
          success: false,
          error: data.description || "Failed to send message",
        };
      }

      logger?.info("✅ [telegramForwardTool] Message sent successfully", {
        messageId: data.result.message_id,
      });

      return {
        success: true,
        messageId: data.result.message_id,
      };
    } catch (error) {
      logger?.error("❌ [telegramForwardTool] Exception occurred", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
