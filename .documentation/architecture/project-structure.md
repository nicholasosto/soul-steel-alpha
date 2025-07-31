# Soul Steel Alpha - Project Structure Overview

## Current Project Structure (Generated from MCP Server Analysis)

This document provides a comprehensive overview of the Soul Steel Alpha project structure, automatically generated using the project's MCP server to ensure accuracy.

## High-Level Architecture

**Project Type**: Roblox TypeScript (roblox-ts)
**Version**: 1.0.0
**Compiler**: rbxtsc (Roblox TypeScript Compiler)

### Directory Overview

```
soul-steel-alpha/
├── src/                           # TypeScript source code
│   ├── client/                    # Client-side scripts (LocalScripts)
│   ├── server/                    # Server-side scripts (ServerScripts)
│   └── shared/                    # Shared modules (ModuleScripts)
├── include/                       # Direct Lua includes
├── mcp-build/                     # Built MCP server output
└── [config files]                # Build and project configuration
```

## Detailed Structure Analysis

### Client Directory (`src/client/`)

**Purpose**: Code that runs on the player's device
**Compilation Target**: LocalScripts in Roblox

- `main.client.ts` - Client initialization and main entry point
- `input.client.ts` - User input processing and validation
- `ui.client.ts` - UI management and initialization
- `network.client.ts` - Client-side network communication
- `event-dispatcher.ts` - Client-side event coordination and dispatch

#### Client State Management (`src/client/states/`)

- `message-state.ts` - Message display state using Fusion reactive programming
- `movement-state.ts` - Player movement and input state management

#### Client UI System (`src/client/client-ui/`)

**Architecture**: Atomic Design Pattern with Fusion reactive UI framework

**Atoms** (`client-ui/atoms/`):

- `MessageBox.ts` - Reactive message display component with type-based styling
- `IconButton.ts` - Reusable icon button component with click handlers
- `index.ts` - Atomic component exports

**Organisms** (`client-ui/organisms/`):

- `button-bars/ButtonBar.ts` - Horizontal button bar layout component
- `button-bars/ability-buttons.ts` - Ability activation button bar
- `button-bars/menu-buttons.ts` - Menu navigation button bar
- `button-bars/index.ts` - Button bar exports

**Helpers** (`client-ui/helpers/`):

- `decorator-helpers.ts` - UI layout and styling utility functions
- `index.ts` - Helper function exports

### Server Directory (`src/server/`)

**Purpose**: Code that runs on Roblox servers
**Compilation Target**: ServerScripts in Roblox

- `main.server.ts` - Server initialization and main entry point
- `service.server.ts` - Service orchestration and initialization

#### Service Architecture (`src/server/services/`)

- `ability-service.ts` - Player abilities management and validation
  - Ability registration and client-server communication
  - Cooldown management and validation
  - Player cleanup systems
- `animation-service.ts` - Character animation handling
  - Automatic animation loading for SSEntity characters
  - Default and custom animation registration
  - Memory management and cleanup
- `combat-service.ts` - Comprehensive combat system management
  - Weapon system with stat requirements and special effects
  - Combat calculations (hit chance, damage, critical hits)
  - Combo chains and skill sequences
  - Combat sessions for different game modes (PvP/PvE/training)
  - Status effect application and tracking
- `data-service.ts` - Player data management (ProfileService integration)
- `health-service.ts` - Entity health and damage processing (deprecated - see resource-service)
- `message-service.ts` - Server-side message broadcasting and management
- `resource-service.ts` - Health, mana, stamina, and combat stat management
  - Damage and healing calculations with modifiers
  - Resource regeneration systems
  - Combat statistics and status effects
  - Entity lifecycle management
- `index.ts` - Service exports and coordination

#### Network Handlers (`src/server/network/`)

- `vfx.server.ts` - Visual effects and particle system management

### Shared Directory (`src/shared/`)

**Purpose**: Code accessible by both client and server
**Compilation Target**: ModuleScripts in Roblox

#### Asset Management

- `asset-ids/` - Centralized Roblox asset ID constants
  - `animation-assets.ts` - Animation asset IDs
  - `image-assets.ts` - Image/texture asset IDs  
  - `sound-assets.ts` - Audio asset IDs
  - `index.ts` - Exports and asset utilities

#### Game Content

- `catalogs/` - Structured game content definitions
  - `ability-catalog.ts` - Ability definitions and metadata
  - `animation-catalog.ts` - Animation asset organization and sets
  - `weapon-catalog.ts` - Weapon definitions with stats, requirements, and special effects
  - `index.ts` - Catalog exports and utilities

#### Utilities

- `helpers/` - Reusable utility functions
  - `animation-helpers.ts` - Animation utility functions
  - `audio-helpers.ts` - Audio processing utilities
  - `health-helpers.ts` - Health and combat calculation utilities
  - `type-guards.ts` - Runtime type validation functions
  - `index.ts` - Helper function exports

#### Identifiers

- `keys/` - Type-safe string identifiers
  - `ability-keys.ts` - Ability identifier constants
  - `combat-keys.ts` - Combat action, weapon, and damage type identifiers
  - `event-keys.ts` - Event system signal and message keys
  - `player-data-keys.ts` - Player data key constants
  - `index.ts` - Key exports and validation

#### Metadata

- `meta/` - Entity metadata and configuration
  - `ability-meta.ts` - Ability metadata schemas
  - `index.ts` - Metadata exports

#### Networking

- `network/` - Client-server communication definitions
  - `ability-remotes.ts` - Ability-related remote events/functions
  - `combat-remotes.ts` - Combat action and weapon system remotes
  - `effect-remotes.ts` - Visual/audio effect remotes
  - `game-cycle-remotes.ts` - Game lifecycle remotes
  - `health-remotes.ts` - Health, damage, and resource management remotes
  - `message-remotes.ts` - Message system remotes
  - `index.ts` - Network definition exports

#### Type Definitions

- `types/` - Shared TypeScript interfaces and types
  - `SSEntity.ts` - Core entity type definitions
  - `health-types.ts` - Health, combat, damage, and status effect type definitions
  - `message-type.ts` - Message system type definitions
  - `index.ts` - Type exports

- `module.ts` - Main shared module entry point

### Build Artifacts

- `include/` - Direct Lua includes
  - `Promise.lua` - Promise implementation for Lua
  - `RuntimeLib.lua` - TypeScript runtime library
- `mcp-build/` - Model Context Protocol server build output
  - `mcp-server.js` - Compiled MCP server executable

## Build System

### Roblox Development Scripts

```json
{
  "build": "rbxtsc",                    // Compile TypeScript to Lua
  "watch": "rbxtsc -w",                 // Watch mode compilation
  "lint": "eslint \"src/**/*.{ts,tsx}\"",  // Code linting
  "lint:fix": "eslint \"src/**/*.{ts,tsx}\" --fix"  // Auto-fix linting issues
}
```

### MCP Server Scripts

```json
{
  "build:mcp": "tsc --project tsconfig.mcp.json",  // Build MCP server
  "mcp:server": "node mcp-build/mcp-server.js"     // Run MCP server
}
```

## Key Dependencies

### Roblox Development

- `roblox-ts` ^3.0.0 - TypeScript to Lua compiler
- `@rbxts/types` ^1.0.865 - Roblox API type definitions
- `@rbxts/services` ^1.5.5 - Type-safe service access
- `@rbxts/net` ^3.0.10 - Type-safe networking
- `@rbxts/fusion` ^0.2.0 - Reactive UI framework
- `@rbxts/maid` ^1.1.0 - Memory management utilities
- `@rbxts/profileservice` ^1.4.2 - Player data management

### Development Tools

- `typescript` ^5.8.3 - TypeScript compiler
- `eslint` with Roblox-TS plugins - Code linting
- `prettier` ^3.6.2 - Code formatting
- `@modelcontextprotocol/sdk` ^1.16.0 - MCP server development
- `zod` ^3.25.76 - Runtime type validation

## Development Workflow

1. **Code Development**: Write TypeScript in `src/` directories
2. **Building**: Run `npm run build` or `npm run watch` for auto-compilation
3. **Linting**: Use `npm run lint` for code quality checks
4. **Roblox Integration**: Import generated Lua files into Roblox Studio
5. **Testing**: Test in Roblox Studio environment
6. **MCP Integration**: Use built MCP server for AI assistant support

## Architecture Patterns

### Service-Oriented Architecture (Server)

- Modular services for different game systems
- Centralized service registration and dependency injection
- Clear separation of concerns

### Shared Module Pattern

- Organized by functionality (assets, types, helpers, etc.)
- Consistent index file exports
- Type-safe constants and validation functions

### Messaging System

- **Client State**: Fusion reactive state management for message display
- **Network Layer**: Type-safe server-to-client message broadcasting  
- **UI Components**: Reactive MessageBox component with severity-based styling
- **Features**: Auto-hiding messages, type-based color coding (error, warning, info)

### UI Architecture (Fusion + Atomic Design)

- **Atomic Components**: Reusable button and display components
- **Organism Components**: Complex layouts like button bars and menus
- **Reactive State**: Fusion-based reactive programming for real-time updates
- **Layout Helpers**: Utility functions for consistent spacing and arrangement

### Type Safety

- Comprehensive TypeScript typing throughout
- Runtime validation using type guards and Zod
- Explicit undefined/null checks (no truthy/falsy assumptions)

## File Organization Conventions

- **kebab-case** for file names (`ability-service.ts`)
- **PascalCase** for TypeScript interfaces and types
- **SCREAMING_SNAKE_CASE** for constants
- **camelCase** for variables and functions
- Descriptive folder names matching functionality
- Consistent `index.ts` files for exports in each directory

---

*This document was generated using the project's MCP server to ensure accuracy and completeness. Last updated: July 31, 2025*
