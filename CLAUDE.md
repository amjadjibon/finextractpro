# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
bun dev              # Start development server
bun run build        # Build for production
bun start            # Start production server
bun run lint         # Run ESLint (ignores errors during builds)
```

### Package Manager
This project uses **Bun** as the package manager. Use `bun install` for dependencies.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Authentication**: Supabase Auth with email/password and Google OAuth
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS v4.1.11
- **Language**: TypeScript with strict mode enabled

### Project Structure

```
src/                   # Source directory
├── app/               # Next.js App Router pages
│   ├── auth/          # Authentication pages (signin, signup)
│   ├── dashboard/     # Protected dashboard area
│   │   ├── documents/ # Document management
│   │   ├── templates/ # Template management
│   │   ├── exports/   # Export functionality
│   │   └── settings/  # User settings
│   ├── layout.tsx     # Root layout with AuthProvider
│   └── page.tsx       # Landing page
├── components/
│   ├── auth/          # Authentication components (signin-form, signup-form)
│   ├── providers/     # React context providers (auth-provider)
│   └── ui/            # shadcn/ui component library
├── lib/
│   ├── supabase/
│   │   ├── client.ts  # Browser client for client components
│   │   ├── server.ts  # Server client for server components
│   │   └── middleware.ts # Middleware utility for session management
│   └── utils.ts       # General utilities
└── middleware.ts      # Next.js middleware for route protection
```

## Authentication Architecture

The app uses **Supabase Auth** for complete authentication management:
- **Supabase Auth** for session management and user authentication
- **Email/Password** and **Google OAuth** authentication methods
- **Middleware** protection for `/dashboard` routes using Supabase sessions

Key files:
- `lib/supabase/client.ts` - Browser Supabase client for client components
- `lib/supabase/server.ts` - Server Supabase client for server components
- `lib/supabase/middleware.ts` - Session management utility with `updateSession()` function
- `middleware.ts` - Main middleware that uses the session utility
- `components/providers/auth-provider.tsx` - Client-side auth context provider
- `components/auth/signin-form.tsx` - Email/password and Google sign-in
- `components/auth/signup-form.tsx` - Email/password and Google sign-up
- `app/auth/callback/route.ts` - OAuth callback handler for Google authentication

**Important**: 
- Always use `supabase.auth.getUser()` in server components/middleware (never trust `getSession()` on server)
- The middleware refreshes auth tokens and passes them to server components
- OAuth flows redirect through `/auth/callback` route for proper token exchange
- Client components use browser client, server components use server client

## Authentication Setup

### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For seeding and admin operations

# AI Provider Configuration (Choose one provider)
AI_PROVIDER=openai  # Options: openai, google, groq
AI_MODEL=gpt-4o-mini  # Optional: model name (uses defaults if not specified)

# AI API Keys (provide key for your chosen provider)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key  # or GOOGLE_GENERATIVE_AI_API_KEY
GROQ_API_KEY=your_groq_api_key
```

### Google OAuth Setup
1. Configure Google OAuth in Google Cloud Console
2. In Supabase Dashboard > Authentication > Providers:
   - Enable Google provider
   - Add your Google Client ID and Secret
   - Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
3. Configure OAuth redirect in your application:
   - OAuth flows redirect to `/auth/callback?next=/dashboard`
   - The callback route handles token exchange and redirects to dashboard

### Email Authentication
- Email/password authentication is enabled by default
- Users can sign up with email and will receive confirmation emails
- Password reset functionality is built-in through Supabase

## Important Configuration Notes

1. **Build Configuration**: The Next.js config ignores ESLint and TypeScript errors during builds (`next.config.mjs`)

2. **Server-Side Auth**: Uses separate client instances for browser vs server environments following Supabase best practices

3. **Route Protection**: Middleware uses dedicated `updateSession()` utility that validates authentication with `getUser()` and refreshes tokens automatically

4. **OAuth Handling**: Google OAuth flows through `/auth/callback` route for proper token exchange

5. **Token Management**: Middleware automatically refreshes expired tokens and passes them to server components

## API Endpoints

### Document Management APIs

#### Upload Document
- **POST** `/api/documents/upload`
- **Body**: FormData with file and metadata
- **Auth**: Required (except localhost in dev)
- **Returns**: Document metadata with upload status

#### Get Documents List
- **GET** `/api/documents`
- **Query params**: page, limit, search, status, type, sortBy, sortOrder
- **Auth**: Required (except localhost in dev)
- **Returns**: Paginated list of documents

#### Get Single Document
- **GET** `/api/documents/[id]`
- **Auth**: Required (except localhost in dev)
- **Returns**: Complete document data including signed file URL

#### Update Document
- **PUT** `/api/documents/[id]`
- **Body**: JSON with description, document_type, template
- **Auth**: Required (except localhost in dev)
- **Returns**: Updated document data

#### Delete Document
- **DELETE** `/api/documents/[id]`
- **Auth**: Required (except localhost in dev)
- **Returns**: Success confirmation

### Template Management APIs

#### Get Templates List
- **GET** `/api/templates`
- **Query params**: page, limit, search, status, type, sortBy, sortOrder, includePublic
- **Auth**: Required (except localhost in dev)
- **Returns**: Paginated list of templates (user's own + public templates)

#### Create Template
- **POST** `/api/templates`
- **Body**: JSON with name, description, document_type, fields, settings, etc.
- **Auth**: Required (except localhost in dev)
- **Returns**: Created template metadata

#### Get Single Template
- **GET** `/api/templates/[id]`
- **Auth**: Required (except localhost in dev)
- **Returns**: Complete template data including fields and settings

#### Update Template
- **PUT** `/api/templates/[id]`
- **Body**: JSON with fields to update
- **Auth**: Required (except localhost in dev)
- **Returns**: Updated template data

#### Delete Template
- **DELETE** `/api/templates/[id]`
- **Auth**: Required (except localhost in dev)
- **Returns**: Success confirmation (prevents deletion if template is in use)

### Database Schema

**Documents Table**:
- Document metadata (name, type, size, status)
- File storage path in Supabase Storage
- Processing information (confidence, extracted fields)
- User ownership and timestamps
- Processing history as JSONB
- Template reference (template_id)

**Templates Table**:
- Template metadata (name, description, document_type)
- Field definitions as JSONB array
- Settings and configuration as JSONB
- Usage statistics (accuracy, documents_processed)
- Visibility settings (is_public, is_favorite)
- User ownership and timestamps
- Tags array for categorization

### Authentication
- Uses Supabase Auth for user management
- Row Level Security (RLS) enforces user data isolation
- All API endpoints require proper authentication

## Development Notes
- Dashboard layout includes collapsible sidebar navigation
- Uses React 19 with Next.js 15 App Router patterns
- shadcn/ui components are pre-configured with proper aliases
- Path aliases configured: `@/*` maps to `src/*` directory

## Database Seeding

The application includes a comprehensive database seeding system for development and testing.

### Seed Script Location
- **SQL File**: `src/lib/database/seed.sql` - Raw SQL with comprehensive test data
- **JS Runner**: `src/lib/database/seed.js` - JavaScript execution script
- **Documentation**: `src/lib/database/README.md` - Detailed usage instructions

### Running the Seed Script
```bash
# Direct execution
node src/lib/database/seed.js

# Or add to package.json scripts:
npm run db:seed
```

### Test Data Created
- **5 Template Records**: Invoice, Bank Statement, Receipt, Tax Form, Contract templates
- **6 Document Records**: Various document types with different processing states
- **1 Test User**: `testuser@example.com` (if no users exist)
- **Realistic Metadata**: File sizes, processing history, confidence scores, timestamps

### Prerequisites
- Supabase project with applied migrations
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional: `SUPABASE_SERVICE_ROLE_KEY` for admin operations

## AI Document Processing

The application uses AI providers for intelligent document parsing and data extraction.

### Supported AI Providers

**OpenAI**
- Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`
- Vision Support: ✅ (supports image documents)
- Cost: Medium
- Best for: High accuracy, complex documents

**Google Gemini**
- Models: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-1.0-pro`
- Vision Support: ✅ (supports image documents)
- Cost: Medium
- Best for: Balanced performance, fast processing

**Groq**
- Models: `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`
- Vision Support: ❌ (text documents only)
- Cost: Low
- Best for: Fast processing, cost-effective

### Document Processing Features

- **Template-Based Extraction**: Uses predefined templates for structured data extraction
- **Default Template**: Automatic extraction when no template is specified
- **Multi-Format Support**: PDF, images (JPG, PNG, TIFF), text files
- **Structured Output**: JSON, CSV, and formatted exports
- **Confidence Scoring**: AI provides confidence scores for extracted fields
- **Processing History**: Detailed logs of processing steps

### AI Configuration

Set your preferred provider and model:
```bash
# Use OpenAI with GPT-4o-mini (recommended for cost/performance)
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_key

# Use Google Gemini Flash (fast and efficient)
AI_PROVIDER=google
AI_MODEL=gemini-1.5-flash
GOOGLE_API_KEY=your_key

# Use Groq for cost-effective processing (text only)
AI_PROVIDER=groq
AI_MODEL=llama-3.1-8b-instant
GROQ_API_KEY=your_key
```