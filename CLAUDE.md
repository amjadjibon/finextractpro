# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `bun run dev` - Start development server (Next.js)
- `bun run build` - Build production application
- `bun run start` - Start production server
- `bun run lint` - Run ESLint for code quality

### Package Manager
This project uses **Bun** as the package manager (bun.lock file present). Use `bun install` for dependencies.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
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
├── auth/              # Authentication components
├── providers/         # React context providers
└── ui/                # shadcn/ui component library

lib/
├── auth.ts            # Authentication utilities (client + server)
├── supabase.ts        # Supabase client configuration
└── utils.ts           # General utilities

hooks/                 # Custom React hooks
middleware.ts          # Next.js middleware for route protection
```

### Key Patterns

#### Component Architecture
- Uses shadcn/ui component system with Radix UI primitives
- Tailwind CSS for styling with CSS variables
- Path aliases configured: `@/*` maps to project root

#### Configuration Notes
- TypeScript errors and ESLint warnings are ignored during builds (see next.config.mjs)
- Images are unoptimized for deployment flexibility
- Uses Bun package manager for faster installs

### Development Notes
- Dashboard layout includes collapsible sidebar navigation
- Uses React 19 with Next.js 15 App Router patterns
- shadcn/ui components are pre-configured with proper aliases