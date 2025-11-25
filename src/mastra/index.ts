import { Mastra } from "@mastra/core";
import { MastraError } from "@mastra/core/error";
import { PinoLogger } from "@mastra/loggers";
import { LogLevel, MastraLogger } from "@mastra/core/logger";
import pino from "pino";
import { MCPServer } from "@mastra/mcp";
import { NonRetriableError } from "inngest";
import { z } from "zod";

import { sharedPostgresStorage } from "./storage";
import { inngest, inngestServe } from "./inngest";
import { telegramForwardWorkflow } from "./workflows/telegramForwardWorkflow";
import { registerTelegramTrigger } from "../triggers/telegramTriggers";
import { getPausedChats, pauseChat, resumeChat, isChatPaused } from "./storage/pausedChats";

class ProductionPinoLogger extends MastraLogger {
  protected logger: pino.Logger;

  constructor(
    options: {
      name?: string;
      level?: LogLevel;
    } = {},
  ) {
    super(options);

    this.logger = pino({
      name: options.name || "app",
      level: options.level || LogLevel.INFO,
      base: {},
      formatters: {
        level: (label: string, _number: number) => ({
          level: label,
        }),
      },
      timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    });
  }

  debug(message: string, args: Record<string, any> = {}): void {
    this.logger.debug(args, message);
  }

  info(message: string, args: Record<string, any> = {}): void {
    this.logger.info(args, message);
  }

  warn(message: string, args: Record<string, any> = {}): void {
    this.logger.warn(args, message);
  }

  error(message: string, args: Record<string, any> = {}): void {
    this.logger.error(args, message);
  }
}

export const mastra = new Mastra({
  storage: sharedPostgresStorage,
  // Register your workflows here
  workflows: { telegramForwardWorkflow },
  // Register your agents here
  agents: {},
  mcpServers: {
    allTools: new MCPServer({
      name: "allTools",
      version: "1.0.0",
      tools: {},
    }),
  },
  bundler: {
    // A few dependencies are not properly picked up by
    // the bundler if they are not added directly to the
    // entrypoint.
    externals: [
      "@slack/web-api",
      "inngest",
      "inngest/hono",
      "hono",
      "hono/streaming",
    ],
    // sourcemaps are good for debugging.
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    middleware: [
      async (c, next) => {
        const mastra = c.get("mastra");
        const logger = mastra?.getLogger();
        logger?.debug("[Request]", { method: c.req.method, url: c.req.url });
        try {
          await next();
        } catch (error) {
          logger?.error("[Response]", {
            method: c.req.method,
            url: c.req.url,
            error,
          });
          if (error instanceof MastraError) {
            if (error.id === "AGENT_MEMORY_MISSING_RESOURCE_ID") {
              // This is typically a non-retirable error. It means that the request was not
              // setup correctly to pass in the necessary parameters.
              throw new NonRetriableError(error.message, { cause: error });
            }
          } else if (error instanceof z.ZodError) {
            // Validation errors are never retriable.
            throw new NonRetriableError(error.message, { cause: error });
          }

          throw error;
        }
      },
    ],
    apiRoutes: [
      // ======================================================================
      // Inngest Integration Endpoint
      // ======================================================================
      // This API route is used to register the Mastra workflow (inngest function) on the inngest server
      {
        path: "/api/inngest",
        method: "ALL",
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
        // The inngestServe function integrates Mastra workflows with Inngest by:
        // 1. Creating Inngest functions for each workflow with unique IDs (workflow.${workflowId})
        // 2. Setting up event handlers that:
        //    - Generate unique run IDs for each workflow execution
        //    - Create an InngestExecutionEngine to manage step execution
        //    - Handle workflow state persistence and real-time updates
        // 3. Establishing a publish-subscribe system for real-time monitoring
        //    through the workflow:${workflowId}:${runId} channel
      },

      // ======================================================================
      // Connector Webhook Triggers
      // ======================================================================
      // Register your connector webhook handlers here using the spread operator.
      // Each connector trigger should be defined in src/triggers/{connectorName}Triggers.ts
      //
      // PATTERN FOR ADDING A NEW CONNECTOR TRIGGER:
      //
      // 1. Create a trigger file: src/triggers/{connectorName}Triggers.ts
      //    (See src/triggers/exampleConnectorTrigger.ts for a complete example)
      //
      // 2. Create a workflow: src/mastra/workflows/{connectorName}Workflow.ts
      //    (See src/mastra/workflows/linearIssueWorkflow.ts for an example)
      //
      // 3. Import both in this file:
      //    ```typescript
      //    import { register{ConnectorName}Trigger } from "../triggers/{connectorName}Triggers";
      //    import { {connectorName}Workflow } from "./workflows/{connectorName}Workflow";
      //    ```
      //
      // 4. Register the trigger in the apiRoutes array below:
      //    ```typescript
      //    ...register{ConnectorName}Trigger({
      //      triggerType: "{connector}/{event.type}",
      //      handler: async (mastra, triggerInfo) => {
      //        const logger = mastra.getLogger();
      //        logger?.info("🎯 [{Connector} Trigger] Processing {event}", {
      //          // Log relevant fields from triggerInfo.params
      //        });
      //
      //        // Create a unique thread ID for this event
      //        const threadId = `{connector}-{event}-${triggerInfo.params.someUniqueId}`;
      //
      //        // Start the workflow
      //        const run = await {connectorName}Workflow.createRunAsync();
      //        return await run.start({
      //          inputData: {
      //            threadId,
      //            ...triggerInfo.params,
      //          },
      //        });
      //      }
      //    })
      //    ```
      //
      // ======================================================================
      // EXAMPLE: Linear Issue Creation Webhook
      // ======================================================================
      // Uncomment to enable Linear webhook integration:
      //
      // ...registerLinearTrigger({
      //   triggerType: "linear/issue.created",
      //   handler: async (mastra, triggerInfo) => {
      //     // Extract what you need from the full payload
      //     const data = triggerInfo.payload?.data || {};
      //     const title = data.title || "Untitled";
      //
      //     // Start your workflow
      //     const run = await exampleWorkflow.createRunAsync();
      //     return await run.start({
      //       inputData: {
      //         message: `Linear Issue: ${title}`,
      //         includeAnalysis: true,
      //       }
      //     });
      //   }
      // }),
      //
      // To activate:
      // 1. Uncomment the code above
      // 2. Import at the top: import { registerLinearTrigger } from "../triggers/exampleConnectorTrigger";
      //
      // ======================================================================

      // Add more connector triggers below using the same pattern
      // ...registerGithubTrigger({ ... }),
      // ...registerSlackTrigger({ ... }),
      // ...registerStripeWebhook({ ... }),

      // ======================================================================
      // Telegram Webhook Trigger - Direct approach
      // ======================================================================
      {
        path: "/api/telegram/webhook",
        method: "POST",
        createHandler: async ({ mastra }) => {
          return async (c) => {
            const logger = mastra.getLogger();
            try {
              const payload = await c.req.json();
              
              logger?.info("📝 [Telegram] Webhook received", { payload });

              // ========== HANDLE BUSINESS CONNECTION STATUS UPDATES ==========
              // When user clicks START/STOP in Telegram Business, we receive this event
              if (payload.business_connection) {
                const connection = payload.business_connection;
                const chatId = connection.user_chat_id?.toString();
                const isEnabled = connection.is_enabled;
                const userName = connection.user?.username || connection.user?.first_name || "unknown";
                
                logger?.info(`${isEnabled ? '▶️' : '⏸️'} [Telegram Business] Bot ${isEnabled ? 'STARTED' : 'STOPPED'} for chat`, {
                  chatId,
                  userName,
                  isEnabled,
                });
                
                // Store the paused status persistently
                if (!isEnabled && chatId) {
                  // Bot was STOPPED - add to paused list
                  pauseChat(chatId, userName);
                  logger?.info("⏸️ [Telegram] Chat PAUSED - will skip forwarding", { 
                    chatId, 
                    userName,
                    pausedChats: getPausedChats()
                  });
                } else if (isEnabled && chatId) {
                  // Bot was STARTED - remove from paused list
                  resumeChat(chatId);
                  logger?.info("▶️ [Telegram] Chat RESUMED - will forward messages", { 
                    chatId,
                    userName,
                    pausedChats: getPausedChats()
                  });
                }
                
                return c.json({ ok: true, status: "connection_updated" });
              }
              // ====================================================================

              // Support both regular messages and business messages
              const messageData = payload.message || payload.business_message;
              
              // Check if there's any content to forward
              if (!messageData) {
                logger?.info("⏭️ [Telegram] Skipping - no message data");
                return c.json({ ok: true, skipped: true });
              }

              const senderId = messageData.from?.id?.toString();
              const senderUserName = messageData.from?.username || messageData.from?.first_name || "unknown";
              
              // ========== FILTER: ONLY ACCEPT MESSAGES FROM SPECIFIC CHAT IDs ==========
              // Change this list to control who can send messages to the bot
              const ALLOWED_CHAT_IDS = process.env.ALLOWED_CHAT_IDS 
                ? process.env.ALLOWED_CHAT_IDS.split(',')
                : ['383870190']; // Default: only accept from this chat ID
              
              // Check if sender is allowed
              if (!ALLOWED_CHAT_IDS.includes(senderId)) {
                logger?.info("🚫 [Telegram] Blocked - sender not in allowed list", {
                  senderId,
                  allowedIds: ALLOWED_CHAT_IDS,
                });
                return c.json({ ok: true, message: "Not authorized" });
              }
              // ========================================================================
              
              // ========== CHECK IF CHAT IS PAUSED (Business Bot STOP button) ==========
              // If user clicked STOP in Telegram Business, skip forwarding
              const chatId = messageData.chat?.id?.toString();
              if (chatId && isChatPaused(chatId)) {
                logger?.info("⏸️ [Telegram] Skipping - bot is PAUSED for this chat", {
                  chatId,
                  senderUserName,
                  pausedChats: getPausedChats(),
                });
                return c.json({ ok: true, skipped: true, reason: "Bot paused for this chat" });
              }
              
              // ========== EXCLUDE SPECIFIC FOLDERS/CHATS FROM FORWARDING ==========
              // Messages from these chat IDs will NOT be forwarded (e.g., Personal Meet folder chats)
              const EXCLUDED_CHAT_IDS = process.env.EXCLUDED_CHAT_IDS 
                ? process.env.EXCLUDED_CHAT_IDS.split(',').map(id => id.trim())
                : []; // Default: no exclusions
              
              // Check if this chat is excluded from forwarding
              if (chatId && EXCLUDED_CHAT_IDS.includes(chatId)) {
                logger?.info("⏭️ [Telegram] Skipping - chat is in excluded list", {
                  chatId,
                  excludedIds: EXCLUDED_CHAT_IDS,
                });
                return c.json({ ok: true, skipped: true, reason: "Chat excluded from forwarding" });
              }
              // ====================================================================
              
              // Detect message type and extract content
              let mediaType = "text";
              let fileId = "";
              let caption = "";
              let message = messageData.text || "";

              if (messageData.photo && messageData.photo.length > 0) {
                mediaType = "photo";
                fileId = messageData.photo[messageData.photo.length - 1].file_id; // Get highest resolution
                caption = messageData.caption || "";
              } else if (messageData.video) {
                mediaType = "video";
                fileId = messageData.video.file_id;
                caption = messageData.caption || "";
              } else if (messageData.audio) {
                mediaType = "audio";
                fileId = messageData.audio.file_id;
                caption = messageData.caption || "";
              } else if (messageData.voice) {
                mediaType = "voice";
                fileId = messageData.voice.file_id;
                caption = messageData.caption || "";
              } else if (messageData.document) {
                mediaType = "document";
                fileId = messageData.document.file_id;
                caption = messageData.caption || "";
              } else if (!messageData.text) {
                // No text and no supported media
                logger?.info("⏭️ [Telegram] Skipping - unsupported message type");
                return c.json({ ok: true, skipped: true });
              }

              logger?.info("🎯 [Telegram Trigger] Received message", {
                senderId,
                senderUserName,
                mediaType,
                hasText: !!message,
                hasMedia: !!fileId,
                isBusinessMessage: !!payload.business_message,
              });

              logger?.info("✅ [Telegram Trigger] Processing and forwarding");

              // Create a unique thread ID for this sender
              const threadId = `telegram-sender-${senderId}`;

              // Start the workflow
              const run = await telegramForwardWorkflow.createRunAsync();
              await run.start({
                inputData: {
                  threadId,
                  userName: senderUserName,
                  message: caption || message,
                  chatId: senderId,
                  mediaType,
                  fileId,
                },
              });

              return c.json({ ok: true, message: "Message forwarded" });
            } catch (error) {
              logger?.error("❌ [Telegram] Error handling webhook:", error);
              return c.json({ ok: false, error: String(error) }, 500);
            }
          };
        },
      },
    ],
  },
  logger:
    process.env.NODE_ENV === "production"
      ? new ProductionPinoLogger({
          name: "Mastra",
          level: "info",
        })
      : new PinoLogger({
          name: "Mastra",
          level: "info",
        }),
});

/*  Sanity check 1: Throw an error if there are more than 1 workflows.  */
// !!!!!! Do not remove this check. !!!!!!
if (Object.keys(mastra.getWorkflows()).length > 1) {
  throw new Error(
    "More than 1 workflows found. Currently, more than 1 workflows are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}

/*  Sanity check 2: Throw an error if there are more than 1 agents.  */
// !!!!!! Do not remove this check. !!!!!!
if (Object.keys(mastra.getAgents()).length > 1) {
  throw new Error(
    "More than 1 agents found. Currently, more than 1 agents are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}
