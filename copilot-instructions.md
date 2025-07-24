# Copilot Instructions for Soul Steel Alpha

This is a Roblox TypeScript project that compiles TypeScript code to Lua for Roblox game development.

## Project Context

- **Framework**: Roblox-TS (TypeScript → Lua transpiler)
- **Target**: Roblox games/experiences
- **Architecture**: Client-Server model with shared code

## Key Directories

- `src/client/` - Client-side code (LocalScripts in Roblox)
  - `input.client.ts` - Input handling and user interactions
  - `main.client.ts` - Main client initialization
- `src/server/` - Server-side code (ServerScripts in Roblox)
  - `main.server.ts` - Server initialization and setup
  - `services/` - Service modules (ability, animation, data management)
  - `network/` - Server network handlers (reserved for future use)
- `src/shared/` - Shared modules (ModuleScripts in Roblox)
  - `asset-ids/` - Centralized asset ID constants
  - `catalogs/` - Game content definitions and metadata
  - `helpers/` - Utility functions and helper classes
  - `keys/` - Type-safe string identifiers
  - `meta/` - Entity metadata and configuration
  - `network/` - Client-server communication definitions
  - `types/` - Shared TypeScript type definitions
- `include/` - Direct Lua includes (Promise.lua, RuntimeLib.lua)

## Development Guidelines

1. **Roblox APIs**: Use `@rbxts/types` for proper Roblox API typings
2. **Client-Server**: Ensure proper separation of client and server logic
3. **Security**: Never trust client input on the server
4. **Performance**: Be mindful of script performance in Roblox

## Common Pitfalls & Best Practices

### Undefined/Null Validation

**✅ CORRECT - Explicit undefined checks:**
```typescript
if (variableToCheck === undefined) return;
if (variableCheck !== undefined) {
    // Safe to use variableCheck
}
```

**❌ INCORRECT - Truthy/falsy checks:**
```typescript
if (!variableCheck) return; // Avoids this - can give false positives for 0, "", false
```

**Why:** In Roblox-TS, explicit undefined checks are more reliable than truthy/falsy checks because valid values like `0`, `""`, or `false` would incorrectly trigger falsy conditions.

### @rbxts/net ServerAsyncFunction Types

**✅ CORRECT - Return type without Promise wrapper:**
```typescript
export const AbilityRemotes = Definitions.Create({
    START_ABILITY: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => boolean>(),
});
```

**❌ INCORRECT - Don't manually wrap in Promise:**
```typescript
export const AbilityRemotes = Definitions.Create({
    START_ABILITY: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => Promise<boolean>>(),
});
```

**Why:** `@rbxts/net` ServerAsyncFunction automatically wraps return values in Promises. Manually adding `Promise<T>` creates a `Promise<Promise<T>>` which causes type errors.

## Shared Module Organization

The `src/shared/` directory is organized into specialized folders with specific purposes:

### Asset IDs (`shared/asset-ids/`)
- **Purpose**: Centralized Roblox asset ID constants (animations, images, sounds)
- **Pattern**: Group by category, use `as const`, provide type unions
- **Review**: Check for placeholder IDs, validate asset availability
- **Guidelines**: Use rbxassetid://[number] format, include helper functions

### Catalogs (`shared/catalogs/`)
- **Purpose**: Game content configuration and metadata collections
- **Pattern**: Strongly typed interfaces, const assertions, validation functions
- **Review**: Verify data integrity, check for missing entries
- **Guidelines**: Define clear interfaces, include factory functions

### Helpers (`shared/helpers/`)
- **Purpose**: Reusable utility functions and helper classes
- **Pattern**: Pure functions, comprehensive type annotations, error handling
- **Review**: Test complex logic, ensure performance for frequent calls
- **Guidelines**: Descriptive names, avoid side effects, proper validation

### Keys (`shared/keys/`)
- **Purpose**: String literal constants for entity identification
- **Pattern**: `const` assertions, union types, validation functions
- **Review**: Check for duplicates, ensure consistent naming
- **Guidelines**: Use kebab-case, SCREAMING_SNAKE_CASE for arrays

### Meta (`shared/meta/`)
- **Purpose**: Entity metadata and configuration data
- **Pattern**: Readonly properties, builder patterns, default values
- **Review**: Validate structure integrity, check completeness
- **Guidelines**: Strong typing, factory functions, version compatibility

### Network (`shared/network/`)
- **Purpose**: Client-server communication definitions
- **Pattern**: @rbxts/net Definitions, server validation, security focus
- **Review**: Check parameter types, validate security measures
- **Guidelines**: Never trust client data, use descriptive names

### Types (`shared/types/`)
- **Purpose**: Shared TypeScript type definitions and interfaces
- **Pattern**: PascalCase, interfaces over types, comprehensive docs
- **Review**: Check inheritance hierarchies, ensure backwards compatibility
- **Guidelines**: Generic types for reusability, proper extends relationships

### Additional Best Practices

- **Type Safety**: Always use explicit types for function parameters and return values
- **Asset References**: Use the shared asset ID system instead of hardcoded strings
- **Network Events**: Always validate data received from remotes on the server side
- **Error Handling**: Use proper error boundaries and logging for debugging

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
