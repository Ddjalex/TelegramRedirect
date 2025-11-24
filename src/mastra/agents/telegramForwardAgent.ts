import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { telegramForwardTool } from "../tools/telegramForwardTool";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * LLM CLIENT CONFIGURATION
 */
const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Telegram Forward Agent
 * 
 * This agent processes incoming Telegram messages and forwards them to a target chat
 */

export const telegramForwardAgent = new Agent({
  name: "Telegram Forward Agent",

  instructions: `
    You are a Telegram message forwarding assistant.

    Your job is to:
    1. Receive incoming Telegram messages
    2. Use the telegram-forward-tool to forward them to chat ID 7503130172
    3. Always include the sender's username in the forwarded message
    
    When you receive a message:
    - Extract the message text and sender information
    - Call the telegramForwardTool with the target chat ID (7503130172)
    - Confirm successful forwarding
    
    Be concise and efficient. Your only task is to forward messages.
  `,

  model: openai.responses("gpt-4o"),

  tools: { telegramForwardTool },

  memory: new Memory({
    options: {
      threads: {
        generateTitle: true,
      },
      lastMessages: 5,
    },
    storage: sharedPostgresStorage,
  }),
});
