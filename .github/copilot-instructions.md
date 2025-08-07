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

### ✅ Validation Best Practices
```typescript
// CORRECT - Explicit undefined checks
if (variableToCheck === undefined) return;
if (resource !== undefined) { /* safe to use */ }

// WRONG - Truthy/falsy checks (can fail for 0, "", false)
if (!variable) return;
```

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

### 🔨 Build Commands
```bash
npm run build        # Build Roblox project
npm run watch        # Auto-build on changes
npm run build:mcp    # Build MCP server for AI integration
npm run lint         # ESLint with roblox-ts rules
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

## File Organization Conventions
- Use kebab-case for all file names: `enhanced-combat-service.ts`, `ability-remotes.ts`
- Exception: Fusion UI components use PascalCase: `PlayerHealthBar.tsx`, `AbilityButton.tsx`
- Use descriptive PascalCase for type files: `SSEntity.ts`, `ResourceDTO.ts`
- Network files: `[category]-remotes.ts`
- Services: `[name]-service.ts`
- Include comprehensive TSDoc headers
- Follow existing import/export patterns from index files
