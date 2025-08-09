# Soul Steel Alpha - Roblox TypeScript Project

A Roblox TypeScript project with Model Context Protocol (MCP) server integration.

## 📚 Documentation

**Complete documentation is available in the [`.documentation/`](.documentation/README.md) folder**

- **[API References](.documentation/api/)** - Technical documentation for all services
- **[User Guides](.documentation/guides/)** - How-to guides for game systems  
- **[Migration Guides](.documentation/migration/)** - System upgrade and transition guides
- **[Current Status](.documentation/status/current-status.md)** - What's implemented and what's not

## Features

### 🎮 Game Systems
- **Ability System**: Server-side ability management with cooldowns and validation
- **Enhanced NPC System**: Combat-ready NPCs with full SSEntity compatibility and AI behaviors
- **Combat System**: Basic weapon-based combat with NPC integration
- **Animation System**: Automatic character animation loading and management
- **Resource Management**: Health, mana, stamina tracking with regeneration for players and NPCs
- **Message System**: Type-safe client-server communication

### 🤖 Enhanced NPC Features
- **Combat Integration**: NPCs can fight players and vice versa using the full ability system
- **Advanced AI**: Intelligent behaviors including idle, patrol, combat, pursuit, and retreat states
- **Ability Usage**: NPCs can use abilities (Melee, Soul-Drain) against players with proper resource management
- **Template System**: Configurable NPC types (goblin, skeleton, guard) with distinct combat roles
- **Full SSEntity Compatibility**: NPCs work seamlessly with all player abilities and targeting systems

### ⚔️ Combat Features
- **Weapon Types**: Swords, Staves, Bows, Daggers, Hammers, Shields, Fists
- **Combat Calculations**: Hit chance, critical hits, damage modifiers
- **Combo System**: Skill chains with bonus damage multipliers
- **Status Effects**: Buffs, debuffs, and damage over time effects
- **Combat Sessions**: PvP, PvE, training, and duel modes

### 🏗️ Architecture
- **Service-Oriented**: Modular server services with dependency injection
- **Type-Safe**: Full TypeScript with runtime validation
- **Reactive UI**: Fusion-based reactive components
- **MCP Integration**: AI assistant support for development

## Documentation

- **[� Documentation Index](.documentation/README.md)** - Complete documentation navigation guide
- **[🚀 Getting Started](.documentation/guides/development-guide.md)** - Setup and development practices
- **[🤖 NPC Integration](.documentation/guides/npc-integration.md)** - How to use Enhanced NPCs with combat
- **[🔧 Enhanced NPC API](.documentation/api/enhanced-npc-service.md)** - Complete NPC Service API reference
- **[⚔️ Combat System API](.documentation/api/combat-service.md)** - Combat system documentation
- **[📊 Current Status](.documentation/status/current-status.md)** - What's implemented vs planned
- **[⚡ Quick Reference](.documentation/reference/quick-reference.md)** - Common patterns and solutions

## Project Structure

- `src/client/` - Client-side TypeScript code (runs on player devices)
  - `input.client.ts` - Input handling and user interactions
  - `main.client.ts` - Main client initialization and setup
- `src/server/` - Server-side TypeScript code (runs on Roblox servers)
  - `main.server.ts` - Main server initialization
  - `services/` - Server-side service modules (ability, animation, data management)
  - `network/` - Server network handlers (currently empty, reserved for future use)
- `src/shared/` - Shared TypeScript code (accessible by both client and server)
  - `asset-ids/` - Centralized Roblox asset ID constants
  - `catalogs/` - Game content definitions and metadata
  - `helpers/` - Utility functions and helper classes
  - `keys/` - Type-safe string identifiers for entities
  - `meta/` - Entity metadata and configuration schemas
  - `network/` - Client-server communication definitions
  - `types/` - Shared TypeScript type definitions
- `include/` - Lua files included directly in the build (Promise.lua, RuntimeLib.lua)
- `mcp-build/` - Built MCP server output
- `mcp-server.ts` - MCP server source for AI assistant integration

## Development

### Prerequisites
This project uses **pnpm** as the package manager for better performance and disk efficiency. Install dependencies with:
```bash
pnpm install
```

### Roblox Development
```bash
# Build the Roblox project
pnpm run build

# Watch for changes and auto-build
pnpm run watch

# Lint the code
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix
```

### MCP Server

The MCP (Model Context Protocol) server allows AI assistants to understand and interact with your Roblox TypeScript codebase.

#### Building the MCP Server
```bash
# Build the MCP server
pnpm run build:mcp
```

#### Running the MCP Server
```bash
# Run the MCP server
pnpm run mcp:server
```

#### MCP Server Capabilities

The MCP server provides these tools to AI assistants:

1. **read_file** - Read the contents of any file in the project
2. **list_files** - List all TypeScript files in the project 
3. **get_project_info** - Get project information including dependencies and scripts
4. **search_code** - Search for specific text or patterns in the codebase
5. **explain_roblox_structure** - Get detailed explanation of Roblox-TS project structure

#### Using with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "soul-steel-alpha": {
      "command": "node",
      "args": ["E://_VSProjects//soul-steel-alpha//mcp-build//mcp-server.js"]
    }
  }
}
```

Replace the path with the absolute path to your project directory.

#### Using with VS Code

The project includes a `.vscode/mcp.json` configuration file for VS Code MCP integration.

## Toolchain

- **Roblox-TS**: TypeScript to Lua transpiler for Roblox development
- **TypeScript**: Static type checking and modern JavaScript features
- **ESLint**: Code linting with TypeScript and Roblox-specific rules
- **Prettier**: Code formatting
- **MCP SDK**: Model Context Protocol for AI assistant integration

## Key Dependencies

### Roblox Development
- `roblox-ts`: TypeScript to Lua compiler for Roblox
- `@rbxts/types`: TypeScript definitions for Roblox APIs
- `@rbxts/services`: Type-safe Roblox service access
- `@rbxts/net`: Type-safe client-server networking
- `@rbxts/fusion`: Modern reactive UI framework for Roblox
- `@rbxts/maid`: Memory management and cleanup utilities
- `@rbxts/profileservice`: Player data management system

### Development Tools
- `typescript`: TypeScript compiler
- `eslint`: Code linting with Roblox-TS specific rules
- `prettier`: Code formatting
- `@modelcontextprotocol/sdk`: MCP server development
- `zod`: Runtime type validation

## SDK Reference

For more information about MCP development, see: https://github.com/modelcontextprotocol/create-python-server
