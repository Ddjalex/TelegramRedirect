# Overview

This is a Mastra-based agent automation project built for Replit's automation platform. The application enables users to create durable, event-driven workflows using agents, tools, and workflows. It supports both time-based and webhook-based triggers (e.g., Slack, Telegram) to orchestrate multi-step AI-powered automations.

The project uses TypeScript with modern ES modules and is designed to run on Node.js 20.9.0 or later. It integrates with the Mastra framework for agent orchestration, Inngest for durable workflow execution, and supports multiple storage backends including PostgreSQL and LibSQL.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Agent Framework Architecture

**Core Framework**: Mastra v0.20.0 serves as the primary agent orchestration framework, providing agents, workflows, tools, and memory management capabilities.

**Agent Design Pattern**: Agents are configured with instructions (system prompts), model providers, tools, and optional memory. They use the AI SDK for model abstraction, supporting both V1 (legacy) and V2 models through `.generateLegacy()` and `.generate()` methods respectively.

**Memory System**: Multi-tiered memory architecture with three types:
- Working memory: Persistent user/task data stored as Markdown or structured schema
- Conversation history: Recent messages (configurable via `lastMessages`)
- Semantic recall: RAG-based vector search for retrieving relevant past interactions

Memory supports both thread-scoped (per conversation) and resource-scoped (per user across threads) contexts.

## Workflow Execution Architecture

**Workflow Engine**: Mastra workflows provide explicit control over task sequences using `createWorkflow()` and `createStep()`. Steps define input/output schemas with Zod validation and contain business logic in `execute` functions.

**Control Flow**: Workflows support sequential execution (`.then()`), parallel execution (`.parallel()`), conditional branching (`.branch()`), and looping (`.dountil()`). Data flows between steps via automatic schema matching or explicit `.map()` transformations.

**Durability Layer**: Inngest integration provides durable execution with automatic step memoization, retries, and suspend/resume capabilities. Snapshots capture complete workflow state for resumption after suspension or failure.

**Backward Compatibility**: The Replit Playground UI requires `.generateLegacy()` methods for agent calls within workflows to maintain compatibility with the visual workflow inspector.

## Trigger System Architecture

**Webhook Architecture**: Custom trigger registration system in `src/triggers/` for connector webhooks (Telegram, Slack, etc.). Each trigger defines API routes using `registerApiRoute()` and passes full payloads to handler functions.

**Event Processing**: Triggers validate and filter incoming webhook events, extract relevant data, and invoke appropriate workflows or agents. The pattern separates webhook reception from business logic execution.

**API Route Registration**: Triggers return route configurations that Mastra's server automatically mounts, providing endpoints like `/webhooks/telegram/action` for external services.

## Model Provider Architecture

**Model Router**: Unified interface supporting 803+ models from 47+ providers through string-based model selection (`"provider/model-name"`). Automatically detects environment variables for API keys.

**Provider Abstraction**: Uses AI SDK v4 and v5 for model abstraction, with fallback capabilities to switch providers on failure. Supports mixing models within single workflows (e.g., GPT-4o-mini for context, Claude Opus for reasoning).

## Logging and Observability

**Custom Logger**: ProductionPinoLogger extends MastraLogger with structured JSON logging, ISO timestamps, and configurable log levels. Separates log metadata from messages for better parsing.

**Telemetry**: OpenTelemetry instrumentation for distributed tracing via OTLP exporters (gRPC and HTTP). Configured in `.mastra/output/instrumentation.mjs` for production deployments.

## Storage Architecture

**Storage Providers**: Pluggable storage system supporting LibSQL (local/remote SQLite), PostgreSQL with pgvector, and Upstash Redis. Shared storage instance in `src/mastra/storage.ts` used across agents and workflows.

**Vector Storage**: Separate vector database configuration for semantic recall, supporting LibSQL vector, PostgreSQL pgvector, and Upstash Vector backends.

**Data Persistence**: Stores conversation threads, messages, working memory, workflow snapshots, and embeddings for semantic search.

## Development and Deployment Architecture

**Build System**: TypeScript compilation with ES2022 modules, bundler module resolution, and strict type checking. Uses `mastra build` for production builds and `mastra dev` for development.

**CLI Integration**: Mastra CLI (`mastra` dev dependency) provides development server, build commands, and Playground UI access. Inngest CLI for workflow debugging.

**MCP Integration**: Model Context Protocol (MCP) server support via `@mastra/mcp` for exposing tools and agents as MCP resources.

# External Dependencies

## AI Model Providers
- **OpenAI**: Primary LLM provider via `@ai-sdk/openai`, requires `OPENAI_API_KEY`
- **Anthropic**: Alternative provider via AI SDK, requires `ANTHROPIC_API_KEY`
- **OpenRouter**: Aggregated model access via `@openrouter/ai-sdk-provider`
- **AI SDK**: Vercel's `ai` package (v4.3.16) for model abstraction and streaming

## Mastra Ecosystem
- **@mastra/core**: Framework foundation with agents, workflows, tools
- **@mastra/inngest**: Inngest integration for durable workflows
- **@mastra/memory**: Memory management system
- **@mastra/loggers**: Logging abstractions
- **@mastra/mcp**: Model Context Protocol support
- **@mastra/libsql**: LibSQL/SQLite storage adapter
- **@mastra/pg**: PostgreSQL storage adapter with pgvector

## External Services Integration
- **Slack**: Webhook integration via `@slack/web-api` for message triggers and responses
- **Telegram**: Bot API integration via `TELEGRAM_BOT_TOKEN`, requires webhook setup
- **Exa**: Search API integration via `exa-js`

## Infrastructure and Observability
- **Inngest**: Durable workflow execution platform via `inngest` and `@inngest/realtime`
- **OpenTelemetry**: Distributed tracing via auto-instrumentation packages
- **Pino**: High-performance JSON logger for structured logging

## Database and Storage
- **PostgreSQL**: Optional storage backend, requires `DATABASE_URL` with pgvector extension
- **LibSQL**: Local or remote SQLite storage, configured with connection URL
- **Upstash**: Redis and Vector storage options, requires REST URLs and tokens

## Development Tools
- **TypeScript**: v5.9.3 with strict mode and ES2022 target
- **tsx**: TypeScript execution engine for development
- **Prettier**: Code formatting with custom configuration
- **Zod**: Runtime schema validation (v3.25.76) for type safety
- **dotenv**: Environment variable management