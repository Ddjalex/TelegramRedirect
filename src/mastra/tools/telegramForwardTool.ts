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
    "Forwards messages and media to a specified Telegram chat ID using the Telegram Bot API",

  inputSchema: z.object({
    chatId: z.string().describe("The chat ID to send the message to"),
    message: z.string().optional().describe("The message text to send"),
    fromUser: z.string().optional().describe("Optional: Username of the original sender"),
    mediaType: z.enum(["text", "photo", "video", "audio", "document"]).optional().describe("Type of media to send"),
    fileId: z.string().optional().describe("Telegram file ID for media"),
    caption: z.string().optional().describe("Caption for media"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    
    logger?.info("📤 [telegramForwardTool] Starting forward", {
      chatId: context.chatId,
      fromUser: context.fromUser,
      mediaType: context.mediaType || "text",
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
      const mediaType = context.mediaType || "text";
      const caption = context.caption || context.message || "";
      const formattedCaption = context.fromUser
        ? `📨 Forwarded from @${context.fromUser}:\n\n${caption}`
        : caption;

      let apiUrl = "";
      let body: any = { chat_id: context.chatId };

      // Determine API endpoint and body based on media type
      if (mediaType === "photo") {
        apiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        body.photo = context.fileId;
        body.caption = formattedCaption;
      } else if (mediaType === "video") {
        apiUrl = `https://api.telegram.org/bot${botToken}/sendVideo`;
        body.video = context.fileId;
        body.caption = formattedCaption;
      } else if (mediaType === "audio") {
        apiUrl = `https://api.telegram.org/bot${botToken}/sendAudio`;
        body.audio = context.fileId;
        body.caption = formattedCaption;
      } else if (mediaType === "document") {
        apiUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
        body.document = context.fileId;
        body.caption = formattedCaption;
      } else {
        // Text message
        apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        body.text = formattedCaption;
      }
      
      logger?.info("🔄 [telegramForwardTool] Sending to Telegram API", {
        mediaType,
        chatId: context.chatId,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        logger?.error("❌ [telegramForwardTool] Telegram API error", {
          status: response.status,
          data,
        });
        return {
          success: false,
          error: data.description || "Failed to send",
        };
      }

      logger?.info("✅ [telegramForwardTool] Sent successfully", {
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
