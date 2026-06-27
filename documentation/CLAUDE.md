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
- Built-in error handling and graceful degradation patterns[byterover-mcp]

# important 
always use byterover-retrieve-knowledge tool to get the related context before any tasks 
always use byterover-store-knowledge to store all the critical informations after sucessful tasks
