import type { ContentfulStatusCode } from "hono/utils/http-status";

import { registerApiRoute } from "../mastra/inngest";
import { Mastra } from "@mastra/core";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn(
    "Trying to initialize Telegram triggers without TELEGRAM_BOT_TOKEN. Can you confirm that the Telegram integration is configured correctly?",
  );
}

export type TriggerInfoTelegramOnNewMessage = {
  type: "telegram/message";
  params: {
    userName: string;
    message: string;
    mediaType?: string;
    fileId?: string;
    chatId?: string;
  };
  payload: any;
};

/**
 * Helper function to extract media information from Telegram message
 */
function extractMediaInfo(message: any): {
  mediaType: string;
  fileId?: string;
  text: string;
} {
  // Check for photo (array of PhotoSize objects, get the largest one)
  if (message.photo && message.photo.length > 0) {
    const photo = message.photo[message.photo.length - 1];
    return {
      mediaType: "photo",
      fileId: photo.file_id,
      text: message.caption || "",
    };
  }

  // Check for video
  if (message.video) {
    return {
      mediaType: "video",
      fileId: message.video.file_id,
      text: message.caption || "",
    };
  }

  // Check for audio
  if (message.audio) {
    return {
      mediaType: "audio",
      fileId: message.audio.file_id,
      text: message.caption || "",
    };
  }

  // Check for voice message
  if (message.voice) {
    return {
      mediaType: "voice",
      fileId: message.voice.file_id,
      text: message.caption || "",
    };
  }

  // Check for document
  if (message.document) {
    return {
      mediaType: "document",
      fileId: message.document.file_id,
      text: message.caption || "",
    };
  }

  // Default to text message
  return {
    mediaType: "text",
    text: message.text || "",
  };
}

export function registerTelegramTrigger({
  triggerType,
  handler,
}: {
  triggerType: string;
  handler: (
    mastra: Mastra,
    triggerInfo: TriggerInfoTelegramOnNewMessage,
  ) => Promise<void>;
}) {
  return [
    registerApiRoute("/webhooks/telegram/action", {
      method: "POST",
      handler: async (c) => {
        const mastra = c.get("mastra");
        const logger = mastra.getLogger();
        try {
          const payload = await c.req.json();

          logger?.info("📝 [Telegram] payload", payload);

          // Extract media information from the message
          const mediaInfo = extractMediaInfo(payload.message);
          
          logger?.info("📎 [Telegram] Detected media type", {
            mediaType: mediaInfo.mediaType,
            hasFileId: !!mediaInfo.fileId,
            textLength: mediaInfo.text.length,
          });

          await handler(mastra, {
            type: triggerType,
            params: {
              userName: payload.message.from.username,
              message: mediaInfo.text,
              mediaType: mediaInfo.mediaType,
              fileId: mediaInfo.fileId,
              chatId: payload.message.chat.id.toString(),
            },
            payload,
          } as TriggerInfoTelegramOnNewMessage);

          return c.text("OK", 200);
        } catch (error) {
          logger?.error("Error handling Telegram webhook:", error);
          return c.text("Internal Server Error", 500);
        }
      },
    }),
  ];
}
