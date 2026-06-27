# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15+ event management application (MCEFEE - Malayalee Cultural Events Federation for Education & Empowerment) built with TypeScript, using the App Router pattern. The application provides ticketing, event management, and user management functionality with multi-tenant architecture.

## Technology Stack

- **Framework**: Next.js 15.1.1 (App Router)
- **Language**: TypeScript 5.3.3
- **Authentication**: Clerk (currently disabled in layout)
- **Payment**: Stripe integration
- **Styling**: Tailwind CSS 3.4.1 with animations
- **State Management**: TanStack React Query 5.74.4, tRPC 11.1.0
- **Database**: Prisma 6.6.0 with Accelerate
- **UI Components**: Radix UI primitives, custom components
- **Development**: ESLint, Anthropic SDK for AI features

## Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint

# Task Management (Claude Task Master)
npm run task                   # Run task management CLI
npm run task:list              # List all tasks
npm run task:generate          # Generate task files
npm run task:parse-prd         # Parse PRD document

# Utilities
npm run fix:nextjs             # Fix Next.js errors
npm run generate:api           # Generate API endpoints
```

## Architecture Overview

### Application Structure
- **App Router**: Uses Next.js 15+ app directory structure
- **Multi-tenant**: Environment-based tenant ID system via `NEXT_PUBLIC_TENANT_ID` 
- **Hybrid Auth**: Clerk authentication (currently disabled but configured)
- **API Layer**: Multiple API patterns:
  - tRPC for type-safe client-server communication
  - REST API proxy layer (`/api/proxy/*`) for backend integration
  - Direct API routes for webhooks and Stripe integration

### Key Directories
- `src/app/` - App Router pages and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - Utilities, tRPC setup, environment config
- `src/pages/api/` - Pages Router API endpoints (legacy/proxy)
- `src/types/` - TypeScript type definitions
- `public/` - Static assets including extensive image library

### Authentication & Authorization
- Clerk integration (configured but disabled in current layout.tsx)
- JWT-based API authentication via `src/lib/api/jwt.ts`
- Multi-tenant support with automatic tenant ID injection
- Middleware handles auth routing and public/protected paths

### API Architecture
- **Proxy Pattern**: `/api/proxy/*` routes forward to backend API with JWT auth
- **Server Actions**: `ApiServerActions.ts` files contain server-side API calls
- **Client-Server Separation**: Client components never make direct API calls
- **Error Handling**: Graceful failures with fallback data

## Important Patterns & Rules

### API Development
- All proxy routes use shared `createProxyHandler` from `@/lib/proxyHandler`
- JWT authentication via `getCachedApiJwt()` and `generateApiJwt()`
- Automatic tenant ID injection using `withTenantId()` utility
- PATCH/PUT operations require `id` field in payload
- Use `Content-Type: application/merge-patch+json` for PATCH requests

### Client-Server Boundaries
- **Server Components**: Fetch data, handle authentication
- **Client Components**: UI interactions only, receive data via props
- **Server Actions**: Handle mutations, live in `ApiServerActions.ts` files
- Never make API calls directly from client components

### Environment Configuration
- Use `getTenantId()` from `@/lib/env` for tenant identification
- Use `getAppUrl()` for port-agnostic URL construction
- Support for AWS Amplify environment variables with `AMPLIFY_` prefix

### Task Management Integration
- Claude Task Master system for AI-driven development workflow
- Task files in `tasks/` directory generated from `tasks.json`
- Use `node scripts/dev.js` commands for task management
- Comprehensive PRD-to-task generation and complexity analysis

## Development Workflow

1. **Starting Work**: Run `node scripts/dev.js next` to find next task
2. **API Changes**: Update proxy routes using shared handler pattern
3. **Client Changes**: Keep client components UI-only, use server actions for data
4. **Testing**: No test framework currently configured
5. **Type Safety**: Strict TypeScript with path aliases (`@/*`)

## Environment Variables

### Required
- `NEXT_PUBLIC_TENANT_ID` - Multi-tenant identifier
- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL
- `API_JWT_USER` / `API_JWT_PASS` - Backend JWT credentials

### Optional
- Clerk authentication variables (currently disabled)
- Stripe payment variables
- Task management and AI integration keys

## Key Files to Reference

- `src/lib/env.ts` - Environment variable helpers
- `src/lib/proxyHandler.ts` - Shared API proxy logic
- `src/lib/withTenantId.ts` - Tenant ID injection utility
- `src/middleware.ts` - Authentication and routing middleware
- `.cursor/rules/` - Comprehensive development rules and patterns

## Notes

- The application supports both development (port-agnostic) and production environments
- Image optimization configured for AWS S3 media bucket
- Comprehensive form handling with validation
- Event-driven architecture with webhook support
- Built-in error handling and graceful degradation patterns

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

[byterover-mcp]

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase


---

## Karpathy Skills — Behavioral Guidelines

> Derived from Andrej Karpathy's observations on LLM coding pitfalls.
> Source: https://github.com/forrestchang/andrej-karpathy-skills
> Original: https://x.com/karpathy/status/2015883

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Karpathy LLM Wiki — Knowledge Base Pattern

> A pattern for building personal knowledge bases using LLMs.
> Source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

### Core Idea

Instead of just retrieving from raw documents at query time (RAG), the LLM **incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of markdown files. When you add a new source, the LLM reads it, extracts key information, and integrates it into the existing wiki — updating entity pages, revising topic summaries, noting contradictions, and strengthening the evolving synthesis. The wiki is a **persistent, compounding artifact**.

### Architecture (Three Layers)

1. **Raw sources** — Curated source documents (articles, papers, data files). Immutable — the LLM reads but never modifies. This is your source of truth.
2. **The wiki** — A directory of LLM-generated markdown files (summaries, entity pages, concept pages, comparisons, overview, synthesis). The LLM owns this layer entirely — creates pages, updates them, maintains cross-references, keeps everything consistent.
3. **The schema** — This CLAUDE.md file (or equivalent) that tells the LLM how the wiki is structured, what conventions to follow, and what workflows to use for ingesting sources, answering questions, or maintaining the wiki. Co-evolved over time.

### Operations

**Ingest:** Drop a new source into the raw collection and tell the LLM to process it. The LLM reads the source, writes a summary page in the wiki, updates the index, updates relevant entity and concept pages, and appends an entry to the log. A single source might touch 10-15 wiki pages.

**Query:** Ask questions against the wiki. The LLM searches for relevant pages, reads them, and synthesizes an answer with citations. Good answers can be filed back into the wiki as new pages so explorations compound in the knowledge base.

**Lint:** Periodically health-check the wiki. Look for: contradictions between pages, stale claims, orphan pages with no inbound links, important concepts lacking their own page, missing cross-references, data gaps.

### Indexing and Logging

- **index.md** — Content-oriented catalog of everything in the wiki. Each page listed with a link, one-line summary, and metadata. The LLM reads the index first to find relevant pages when answering queries.
- **log.md** — Chronological, append-only record of operations (ingests, queries, lint passes). Each entry prefixed with date and operation type for easy parsing.

### Wiki Directory Structure (Adapt Per Project)

```
project-root/
├── CLAUDE.md           # This file — schema + behavioral guidelines
├── raw/                # Immutable source material
│   └── topic/
│       └── source-article.md
├── wiki/               # Compiled knowledge pages (LLM-maintained)
│   ├── index.md        # Content catalog
│   ├── log.md          # Append-only operation log
│   ├── overview.md     # Evolving synthesis
│   └── pages/          # All wiki pages
│       └── concept-name.md
└── assets/             # Images, PDFs, attachments
```

### Why This Works

The tedious part of maintaining a knowledge base is the bookkeeping — updating cross-references, keeping summaries current, noting contradictions, maintaining consistency. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The wiki stays maintained because the cost of maintenance is near zero.

**The human's job:** Curate sources, direct the analysis, ask good questions, and think about what it all means.
**The LLM's job:** Everything else — summarizing, cross-referencing, filing, and bookkeeping.

---

*Karpathy Skills + LLM Wiki appended on 2026-04-15. These guidelines are designed to be merged with project-specific instructions above.*
