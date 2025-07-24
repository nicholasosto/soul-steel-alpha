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

- `input.client.ts` - User input processing and validation
- `main.client.ts` - Client initialization and main entry point

### Server Directory (`src/server/`)

**Purpose**: Code that runs on Roblox servers
**Compilation Target**: ServerScripts in Roblox

- `main.server.ts` - Server initialization and main entry point
- `services/` - Service-oriented architecture modules
  - `ability-service.ts` - Player abilities management and validation
  - `animation-service.ts` - Character animation handling
  - `data-service.ts` - Player data management (ProfileService integration)
  - `services.server.ts` - Service registration and coordination
- `network/` - Server-side network handlers (currently empty, reserved)

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
  - `index.ts` - Catalog exports and utilities

#### Utilities
- `helpers/` - Reusable utility functions
  - `animation-helpers.ts` - Animation utility functions
  - `audio-helpers.ts` - Audio processing utilities
  - `type-guards.ts` - Runtime type validation functions
  - `index.ts` - Helper function exports

#### Identifiers
- `keys/` - Type-safe string identifiers
  - `ability-keys.ts` - Ability identifier constants
  - `player-data-keys.ts` - Player data key constants
  - `index.ts` - Key exports and validation

#### Metadata
- `meta/` - Entity metadata and configuration
  - `ability-meta.ts` - Ability metadata schemas
  - `index.ts` - Metadata exports

#### Networking
- `network/` - Client-server communication definitions
  - `ability-remotes.ts` - Ability-related remote events/functions
  - `game-cycle-remotes.ts` - Game lifecycle remotes
  - `index.ts` - Network definition exports

#### Type Definitions
- `types/` - Shared TypeScript interfaces and types
  - `SSEntity.ts` - Core entity type definitions
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

*This document was generated using the project's MCP server to ensure accuracy and completeness. Last updated: July 24, 2025*
