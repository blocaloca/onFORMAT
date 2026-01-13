# Creative OS - Unified Production Platform

## Current State
- 3 separate tools (LuxPixPro, GenStudioPro, ArtMind) 
- Chat-based interface
- Messages persist in database (messages table)
- Projects load/save correctly
- All working and tested

## Goal
- Unified project interface with visual document grid
- Documents represented as cards (show type, progress, status)
- 5 stage workflow: Concept → Develop → Plan → Execute → Wrap
- Stage-based color system (functional, not decorative)
- Click card to edit document with AI chat panel

## Tech Stack
- Next.js 15.0.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS v3
- Supabase (PostgreSQL)
- Anthropic Claude API (Sonnet 4)

## Database Tables (Supabase)
- profiles: User accounts
- projects: User projects with product_type, name, data JSONB
- messages: Chat history (project_id, role, content)
- project_versions: Version control
- character_library: GenStudio character DNA system

## File Structure
- app/ - Next.js pages and API routes
  - tools/luxpix/ - LuxPixPro tool (being replaced)
  - tools/genstudio/ - GenStudioPro tool (being replaced)
  - tools/artmind/ - ArtMind tool (being replaced)
  - dashboard/ - Project list
  - api/chat/ - AI chat endpoint
  - api/projects/ - Project CRUD
- components/
  - ChatInterface.tsx - Current chat UI (will evolve)
- lib/
  - supabase.ts - Database client
  - anthropic.ts - Claude API client
  - prompts.ts - System prompts for each tool type

## Current System Prompts
- LuxPixPro: Production planning (budgets, shot lists, schedules)
- GenStudioPro: Character DNA and AI generation prompts
- ArtMind: Creative direction and campaign strategy

## Key Design Principles
- Production-grade output (real numbers, real terminology)
- Minimal formatting (tables over paragraphs)
- Industry-specific language
- Visual workflow representation
- Color-coded stages for navigation
- Documents populate as cards in real-time
- One platform, multiple capabilities

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ANTHROPIC_API_KEY

## Working Directory
/Users/davidcasteel/Desktop/creative-os-fixed
