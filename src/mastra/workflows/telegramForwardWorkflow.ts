import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { telegramForwardTool } from "../tools/telegramForwardTool";

/**
 * Telegram Forward Workflow
 * 
 * This workflow receives incoming Telegram messages and forwards them to chat ID 7503130172
 */

const TARGET_CHAT_ID = "7503130172";

/**
 * Step 1: Forward the message directly using the tool
 */
const forwardMessage = createStep({
  id: "forward-message",
  description: "Forwards the received Telegram message to the target chat ID using the Telegram tool",

  inputSchema: z.object({
    threadId: z.string().describe("Thread ID for conversation tracking"),
    userName: z.string().describe("Username of the message sender"),
    message: z.string().describe("The message text to forward"),
    chatId: z.string().optional().describe("Original chat ID"),
    mediaType: z.string().optional().describe("Type of media: text, photo, video, audio, voice, document"),
    fileId: z.string().optional().describe("Telegram file ID for media"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    forwardedMessage: z.string(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ inputData, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    logger?.info("🚀 [Step 1] Starting forward", {
      userName: inputData.userName,
      targetChatId: TARGET_CHAT_ID,
      mediaType: inputData.mediaType || "text",
    });

    logger?.info("📤 [Step 1] Calling telegramForwardTool directly");

    // Directly call the tool to ensure deterministic behavior
    const toolResult = await telegramForwardTool.execute({
      context: {
        chatId: TARGET_CHAT_ID,
        message: inputData.message,
        fromUser: inputData.userName,
        mediaType: (inputData.mediaType as any) || "text",
        fileId: inputData.fileId,
        caption: inputData.message,
      },
      mastra,
      runtimeContext,
    });

    logger?.info("📊 [Step 1] Tool execution result", {
      success: toolResult.success,
      messageId: toolResult.messageId,
      error: toolResult.error,
    });

    if (!toolResult.success) {
      logger?.error("❌ [Step 1] Failed to forward message", {
        error: toolResult.error,
      });
      throw new Error(`Failed to forward message: ${toolResult.error}`);
    }

    logger?.info("✅ [Step 1] Message forwarded successfully", {
      messageId: toolResult.messageId,
    });

    return {
      success: toolResult.success,
      forwardedMessage: inputData.message,
      messageId: toolResult.messageId,
      error: toolResult.error,
    };
  },
});

/**
 * Step 2: Log the result
 */
const logResult = createStep({
  id: "log-result",
  description: "Logs the forwarding result",

  inputSchema: z.object({
    success: z.boolean(),
    forwardedMessage: z.string(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),

  outputSchema: z.object({
    completed: z.boolean(),
    summary: z.string(),
    success: z.boolean(),
  }),

  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📝 [Step 2] Logging result");

    const summary = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MESSAGE FORWARDED SUCCESSFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📨 Original Message: ${inputData.forwardedMessage}
📬 Telegram Message ID: ${inputData.messageId || "N/A"}
📊 Status: ${inputData.success ? "SUCCESS" : "FAILED"}
${inputData.error ? `⚠️  Error: ${inputData.error}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    logger?.info(summary);
    logger?.info("✅ [Step 2] Workflow completed", {
      success: inputData.success,
      messageId: inputData.messageId,
    });

    return {
      completed: true,
      summary,
      success: inputData.success,
    };
  },
});

/**
 * Create the workflow by chaining steps
 */
export const telegramForwardWorkflow = createWorkflow({
  id: "telegram-forward-workflow",

  inputSchema: z.object({
    threadId: z.string().describe("Thread ID for conversation tracking"),
    userName: z.string().describe("Username of the message sender"),
    message: z.string().describe("The message text to forward"),
    chatId: z.string().optional().describe("Original chat ID"),
    mediaType: z.string().optional().describe("Type of media: text, photo, video, audio, voice, document"),
    fileId: z.string().optional().describe("Telegram file ID for media"),
  }) as any,

  outputSchema: z.object({
    completed: z.boolean(),
    summary: z.string(),
    success: z.boolean(),
  }),
})
  .then(forwardMessage as any)
  .then(logResult as any)
  .commit();
