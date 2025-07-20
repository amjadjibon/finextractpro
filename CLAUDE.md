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
app/                    # Next.js App Router pages
├── auth/              # Authentication pages (signin, signup)
├── dashboard/         # Protected dashboard area
│   ├── documents/     # Document management
│   ├── templates/     # Template management
│   ├── exports/       # Export functionality
│   └── settings/      # User settings
├── layout.tsx         # Root layout with AuthProvider
└── page.tsx           # Landing page

components/
├── auth/              # Authentication components (signin-form, signup-form)
├── providers/         # React context providers (auth-provider)
└── ui/                # shadcn/ui component library

lib/
├── supabase/
│   ├── client.ts      # Browser client for client components
│   ├── server.ts      # Server client for server components
│   └── middleware.ts  # Middleware utility for session management
└── utils.ts           # General utilities

middleware.ts          # Next.js middleware for route protection
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## Development Notes
- Dashboard layout includes collapsible sidebar navigation
- Uses React 19 with Next.js 15 App Router patterns
- shadcn/ui components are pre-configured with proper aliases
- Path aliases configured: `@/*` maps to project root