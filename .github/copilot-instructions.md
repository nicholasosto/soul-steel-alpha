---
doc_type: copilot-instructions
doc_id: copilot-instructions
version: 1.0.0
status: approved
last_updated: 2025-08-29

owners:
  - name: Trembus
    github: nicholasosto

applies_to:
  repos: [nicholasosto/SoulSteel]
  languages: [TypeScript, Roblox-TS]

llm:
  audience: "Code assistants (e.g., Copilot Chat) using this repo."
  summary: "Authoritative guidance for answering questions about SoulSteel’s architecture, UI patterns, and data models."
  dos:
    - "Prefer Fusion v4 patterns and ForPairs/ForKeys."
    - "Use UIBlox for UI elements when feasible."
    - "Adhere to @rbxts conventions and keep player/NPC classes readable."
  donts:
    - "Don’t invent APIs that aren’t in the repo."
    - "Don’t contradict constants in src/shared/constants.ts."

  context_files:
    - path: src/shared/constants.ts
      reason: "Canonical constants."
    - path: docs/architecture/overview.md
      reason: "High-level structure."

  knowledge_cutoff: 2025-08-01
  retrieval:
    embed: true
    chunk_size: 900
    keep_together:
      - "^```[\\s\\S]*?```$"   # keep code fences intact
      - "^## .*"              # keep sections together
    exclude_globs:
      - "node_modules/**"
      - "art/**"
tags: [soulsteel, instructions, llm]
---

# GitHub Copilot Instructions for Soul Steel Alpha

## Project Overview
Roblox TypeScript game using roblox-ts transpiler with advanced combat systems, reactive state management via Fusion, and MCP server integration for AI assistance.

## Architecture Patterns

### 🏗️ Core Structure
- **`src/client/`** - Client code (LocalScripts), uses Fusion reactive UI
- **`src/server/`** - Server code (ServerScripts), service-oriented architecture
- **`src/shared/`** - Shared modules (ModuleScripts), organized by purpose:
  - `types/` - TypeScript interfaces, export via index.ts
  - `network/` - @rbxts/net remotes, never wrap ServerAsyncFunction in Promise
  - `keys/` - String literal constants (kebab-case), use SCREAMING_SNAKE_CASE for arrays
  - `meta/` - Entity metadata with lifecycle callbacks
  - `catalogs/` - Game content configuration with const assertions
  - `dtos/` - Data transfer objects for network communication

### 🔧 Service Pattern
All server services follow singleton pattern in `src/server/services/`:
```typescript
export class ServiceName {
    private static instance: ServiceName;
    public static getInstance(): ServiceName {
        if (!ServiceName.instance) {
            ServiceName.instance = new ServiceName();
        }
        return ServiceName.instance;
    }
}
```

### 🌐 Network Communication
Use @rbxts/net with explicit typing:
```typescript
// CORRECT - Return type without Promise wrapper
export const AbilityRemotes = Definitions.Create({
    START_ABILITY: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => boolean>(),
});

// WRONG - Don't manually wrap in Promise
START_ABILITY: Definitions.ServerAsyncFunction<(key: AbilityKey) => Promise<boolean>>(),
```

Always cross-check `.documentation/reference/api-quirks.md#rbxtsnet` before changing or adding remotes.

### 🎯 Client Controller Architecture
Enhanced client architecture follows strict single responsibility:

**Controller Responsibilities:**
- **InputController**: Raw input mapping ONLY (keyboard/mouse → actions)
- **MovementController**: Player movement mechanics ONLY (running, jumping, speed)
- **AbilityController**: Ability system ONLY (activation, cooldowns, effects, UI integration)
- **ZoneController**: Zone management ONLY (creation, events, tracking)
- **ClientController**: Central coordination ONLY (routing, initialization, cleanup)

**Anti-Patterns to Avoid:**
- DON'T mix input handling with game logic
- DON'T duplicate network calls across controllers  
- DON'T add movement logic to ability controllers
- DON'T create vague controllers like "GameController" or "PlayerController"

**Decision Framework:**
1. Does this belong in existing controller? → Add to existing
2. Is this new domain with 3+ responsibilities? → Create new controller  
3. Would this create overlap? → Refactor to eliminate overlap

See `CLIENT_ARCHITECTURE_GUIDELINES.md` for detailed guidance.

### 🎯 Combat Flow Architecture
Enhanced combat follows damage container pattern:
`AbilityActivateAttempt → ValidateAbility → DamageContainerCreated → DamageContainerApplied → DamageRecordedForRewardCalculation`

Key files:
- `enhanced-combat-service.ts` - Core damage container system
- `combat-flow-types.ts` - Complete combat type definitions
- `enhanced-combat-remotes.ts` - Network layer for combat analytics

## Critical Patterns

### 🚦 Copilot Guardrails (Always apply)
- Before writing or editing code, consult both:
    - `.documentation/reference/validation-matrix.md` — when to validate vs. when it’s safe not to
    - `.documentation/reference/api-quirks.md` — Roblox/@rbxts package gotchas and dos/don’ts
- Enforce explicit undefined checks for any optional lookup or post-yield Instance use.
- Never change network definitions to use Promise return types for ServerAsyncFunction.
- On the client, respect controller responsibilities; don’t mix concerns.
- Add a brief inline comment when using non-null assertions (!) explaining the invariant.

### ✅ Validation Best Practices
```typescript
// CORRECT - Explicit undefined checks
if (variableToCheck === undefined) return;
if (resource !== undefined) { /* safe to use */ }

// WRONG - Truthy/falsy checks (can fail for 0, "", false)
if (!variable) return;
```

### ♻️ Avoid redundant existence checks (TypeScript/roblox-ts)

- When checks are NOT needed
    - Non-optional values created in the same scope or guaranteed by constructors/Initialize(): no extra undefined check right after creation.
    - Services acquired via `game.GetService` that are typed as non-optional in rbxts: no existence guard is required.
    - Constants/catalogs/keys imported with `as const`: do not check for undefined.

- When checks ARE required
    - Optional fields and lookups: `Map.get`, dictionary indexing, `array.find`, or catalog lookups can return `undefined` — check explicitly.
    - Roblox Instances that can be absent/destroyed: `Player.Character`, `HumanoidRootPart`, `FindFirstChild*` results — check for `undefined` before use.
    - After yields or asynchronous boundaries: references may be invalidated; re-validate Instances/parts.
    - Network inputs from clients: always validate (use DTOs and `zod` or centralized type guards in `shared/helpers/type-guards.ts`).
    - External resources that may not be loaded yet (animations, assets): add readiness checks or loader gates.

- Practical guidance
    - Prefer early-return guards with explicit `=== undefined` checks to narrow types.
    - Avoid truthy/falsy for values that can be 0, "", or false; check exact conditions (e.g., `arr.size() === 0`).
    - Use the non-null assertion `!` sparingly and only after establishing strong invariants (document why it is safe).
    - Consider `WaitForChild` when presence is required; otherwise handle missing children gracefully.

See the detailed rules and examples in `.documentation/reference/validation-matrix.md`.

### 📊 State Management
Client uses Fusion reactive states in `src/client/states/`:
- `PlayerResourceSlice` - DTO-based resource management
- `MessageState` - UI notifications with queuing
- Follow slice pattern with `fetch()` and `_onUpdate()` methods

### 🔍 Type Safety
- Use type guards in `shared/helpers/type-guards.ts`
- Import from centralized `shared/types/index.ts`
- Leverage SSEntity interface for all game entities
- Use AbilityKey, ZoneKey, etc. for type-safe identifiers

## Development Workflow

### � Package Management
This project uses **pnpm** as the preferred package manager for better performance and disk efficiency.

### �🔨 Build Commands
```bash
pnpm run build        # Build Roblox project
pnpm run watch        # Auto-build on changes
pnpm run build:mcp    # Build MCP server for AI integration
pnpm run lint         # ESLint with roblox-ts rules
```

### 📋 Package Commands
```bash
pnpm install         # Install dependencies
pnpm add <package>   # Add new dependency
pnpm update          # Update dependencies
pnpm list            # List installed packages
```

### 🤖 MCP Server Integration
The project includes Model Context Protocol server (`mcp-server.ts`) for AI assistant integration:
- Analyze abilities system with metadata extraction
- Document UI components automatically
- Find duplicate functions and TODOs
- Search codebase with semantic understanding

## Key Dependencies
- **@rbxts/fusion** - Reactive UI framework
- **@rbxts/net** - Type-safe networking
- **@rbxts/profileservice** - Data persistence
- **@rbxts/zone-plus** - Zone management
- **zod** - Runtime validation

## Security & Performance
- Never trust client input - validate on server
- Use ProfileService for data persistence with proper error handling
- Implement rate limiting for client-callable remotes
- Be mindful of Roblox script performance limits
- Use Maid pattern for cleanup in services

## Game Design Document Management
The project uses a living GDD at `.documentation/soul_steel_gdd.md` managed via MCP tools.

### 📋 When to Use GDD Manager
- **Feature Planning**: Query milestones and features before implementing new systems
- **Task Tracking**: Add tasks when breaking down features into implementation steps
- **Progress Reports**: Export summaries for sprint reviews and project updates
- **Validation**: Check document structure and ensure all features have proper acceptance criteria
- **Priority Management**: Query P1/P2/P3 features to guide development focus

### 🛠️ Key GDD Operations
```typescript
// Always check current milestone status before major work
gdd-manager: query_milestones (include_features: true)

// Add tasks when implementing features
gdd-manager: add_task (feature_id, task details with estimates)

// Validate document health regularly
gdd-manager: validate_structure (check_type: all)

// Generate progress reports for stakeholders
gdd-manager: export_summary (format: markdown, include: all)
```

### 📈 Integration with Development
- Before starting features: Query related tasks and acceptance criteria
- During implementation: Add technical tasks as they emerge
- After completion: Update task status and validate feature completion
- For planning: Export summaries to identify bottlenecks and dependencies

## File Organization Conventions
- Use kebab-case for all file names: `enhanced-combat-service.ts`, `ability-remotes.ts`
- Exception: Fusion UI components use PascalCase: `PlayerHealthBar.tsx`, `AbilityButton.tsx`
- Use descriptive PascalCase for type files: `SSEntity.ts`, `ResourceDTO.ts`
- Network files: `[category]-remotes.ts`
- Services: `[name]-service.ts`
- Include comprehensive TSDoc headers
- Follow existing import/export patterns from index files
