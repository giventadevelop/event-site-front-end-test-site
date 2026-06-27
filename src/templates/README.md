# Next.js 15 Project Templates

This directory contains standardized templates for different parts of a Next.js 15 application.

## Directory Structure

```
templates/
├── api/                    # API route templates
├── components/            # React component templates
├── hooks/                # Custom React hooks
├── lib/                  # Utility and configuration
├── server-actions/       # Server action templates
├── types/                # TypeScript type definitions
└── validation/          # Zod schema templates
```

## Usage

Use the generator scripts in `scripts/` to create new files from these templates:

```bash
# Generate API routes
npm run generate:api User "name:string" "email:string"

# Generate components
npm run generate:component Button "variant:string" "size:string"

# Generate server actions
npm run generate:action createUser "name:string" "email:string"
```

## Template Categories

1. **API Routes** (`api/`)
   - REST API endpoints
   - Route handlers
   - Error handling

2. **Components** (`components/`)
   - UI components
   - Layout components
   - Server/Client components

3. **Hooks** (`hooks/`)
   - Data fetching
   - State management
   - Form handling

4. **Library** (`lib/`)
   - Database utilities
   - Authentication helpers
   - API clients

5. **Server Actions** (`server-actions/`)
   - Form actions
   - Data mutations
   - File operations

6. **Types** (`types/`)
   - Common interfaces
   - Type utilities
   - API types

7. **Validation** (`validation/`)
   - Zod schemas
   - Form validation
   - API validation