# Soul Steel Alpha - Roblox TypeScript Project

A Roblox TypeScript project with Model Context Protocol (MCP) server integration.

## Documentation

- **[📁 PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Comprehensive project structure overview (MCP-generated)
- **[🔧 DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Development guidelines and best practices
- **[📚 SHARED_MODULE_REFERENCE.md](SHARED_MODULE_REFERENCE.md)** - Shared module architecture guide
- **[⚡ QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common pitfalls and quick fixes

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

### Roblox Development
```bash
# Build the Roblox project
npm run build

# Watch for changes and auto-build
npm run watch

# Lint the code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### MCP Server

The MCP (Model Context Protocol) server allows AI assistants to understand and interact with your Roblox TypeScript codebase.

#### Building the MCP Server
```bash
# Build the MCP server
npm run build:mcp
```

#### Running the MCP Server
```bash
# Run the MCP server
npm run mcp:server
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
