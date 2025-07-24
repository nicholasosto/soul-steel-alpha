# Copilot Instructions for Soul Steel Alpha

This is a Roblox TypeScript project that compiles TypeScript code to Lua for Roblox game development.

## Project Context

- **Framework**: Roblox-TS (TypeScript → Lua transpiler)
- **Target**: Roblox games/experiences
- **Architecture**: Client-Server model with shared code

## Key Directories

- `src/client/` - Client-side code (LocalScripts in Roblox)
- `src/server/` - Server-side code (ServerScripts in Roblox)  
- `src/shared/` - Shared modules (ModuleScripts in Roblox)
- `include/` - Direct Lua includes

## Development Guidelines

1. **Roblox APIs**: Use `@rbxts/types` for proper Roblox API typings
2. **Client-Server**: Ensure proper separation of client and server logic
3. **Security**: Never trust client input on the server
4. **Performance**: Be mindful of script performance in Roblox

## MCP Server Integration

This project includes an MCP server (`mcp-server.ts`) that provides AI assistants with:
- Code reading and searching capabilities
- Project structure understanding
- Roblox-TS specific context and explanations

For more information about MCP development, see: [Model Context Protocol SDK](https://github.com/modelcontextprotocol/create-python-server)

## Build Process

The build process uses `rbxtsc` to:
1. Transpile TypeScript to Lua
2. Generate Roblox-compatible file structure
3. Output to `out/` directory for Roblox Studio import
