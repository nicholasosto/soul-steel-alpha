# Soul Steel Alpha - Development Guide

## Table of Contents
- [Common Pitfalls](#common-pitfalls)
- [Code Standards](#code-standards)
- [Network Programming](#network-programming)
- [Type Safety](#type-safety)
- [Performance Guidelines](#performance-guidelines)

## Common Pitfalls

### 1. Undefined/Null Validation

**⚠️ Problem**: Using truthy/falsy checks can lead to unexpected behavior with valid falsy values.

**✅ CORRECT:**
```typescript
// Explicit undefined checks
if (variableToCheck === undefined) return;
if (variableToCheck !== undefined) {
    // Safe to use variableToCheck
}

// For null checks
if (value === null) return;
if (value !== null) {
    // Safe to use value
}
```

**❌ INCORRECT:**
```typescript
// Avoid truthy/falsy checks for existence
if (!variableCheck) return; // Will trigger for 0, "", false, null, undefined
if (variableCheck) {
    // May not execute when variableCheck is 0, "", or false
}
```

**Why this matters**: In Roblox-TS, valid values like `0`, empty strings `""`, or `false` would incorrectly trigger falsy conditions, leading to bugs.

### 2. @rbxts/net ServerAsyncFunction Types

**⚠️ Problem**: Manually wrapping return types in Promise causes double-wrapping errors.

**✅ CORRECT:**
```typescript
export const AbilityRemotes = Definitions.Create({
    START_ABILITY: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => boolean>(),
    GET_PLAYER_DATA: Definitions.ServerAsyncFunction<(playerId: number) => PlayerData>(),
});
```

**❌ INCORRECT:**
```typescript
export const AbilityRemotes = Definitions.Create({
    START_ABILITY: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => Promise<boolean>>(),
    GET_PLAYER_DATA: Definitions.ServerAsyncFunction<(playerId: number) => Promise<PlayerData>>(),
});
```

**Why this matters**: `@rbxts/net` ServerAsyncFunction automatically wraps return values in Promises. Adding `Promise<T>` manually creates `Promise<Promise<T>>`, causing type errors and runtime issues.

### 3. Client-Server Data Validation

**⚠️ Problem**: Trusting client data without validation creates security vulnerabilities.

**✅ CORRECT:**
```typescript
// Server-side validation
AbilityRemotes.Server.Get("START_ABILITY").SetCallback((player, abilityKey) => {
    // Validate the ability key exists
    if (!ABILITY_KEYS.includes(abilityKey)) {
        warn(`Invalid ability key received from ${player.Name}: ${abilityKey}`);
        return false;
    }
    
    // Additional game logic validation
    if (!canPlayerUseAbility(player, abilityKey)) {
        return false;
    }
    
    return startAbility(player, abilityKey);
});
```

**❌ INCORRECT:**
```typescript
// No validation - security risk
AbilityRemotes.Server.Get("START_ABILITY").SetCallback((player, abilityKey) => {
    return startAbility(player, abilityKey); // Directly using client data
});
```

## Code Standards

### Import Organization
```typescript
// 1. External packages
import { Definitions } from "@rbxts/net";
import { Players, Workspace } from "@rbxts/services";

// 2. Shared modules (alphabetical)
import { AbilityKey } from "shared/keys";
import { PlayerData } from "shared/types";

// 3. Local modules (relative imports)
import { validatePlayer } from "./utils";
```

### Function Declarations
```typescript
// Use explicit return types
function calculateDamage(baseDamage: number, multiplier: number): number {
    return baseDamage * multiplier;
}

// Use type annotations for parameters
const processAbility = (player: Player, abilityKey: AbilityKey): boolean => {
    // Implementation
    return true;
};
```

### Error Handling
```typescript
// Use proper error handling and logging
try {
    const result = riskyOperation();
    return result;
} catch (error) {
    warn(`Operation failed: ${error}`);
    return false;
}
```

## Network Programming

### Remote Event Patterns
```typescript
// Always validate data types
GameCycleRemotes.Server.Get("ClientUILoaded").Connect((player) => {
    if (!player || !player.Parent) {
        warn("Invalid player in ClientUILoaded event");
        return;
    }
    
    handleUILoaded(player);
});
```

### Async Function Best Practices
```typescript
// Client-side async calls
const success = await AbilityRemotes.Client.Get("START_ABILITY").CallServerAsync("Melee");
if (success) {
    // Handle success
} else {
    // Handle failure
}
```

## Type Safety

### Define Clear Interfaces
```typescript
interface PlayerStats {
    readonly health: number;
    readonly mana: number;
    readonly level: number;
}

// Use const assertions for literal types
export const DAMAGE_TYPES = ["Physical", "Magical", "True"] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];
```

### Avoid Any Types
```typescript
// ✅ GOOD: Specific types
function processData(data: PlayerData): ProcessedData {
    return transformData(data);
}

// ❌ BAD: Using any
function processData(data: any): any {
    return data.whatever;
}
```

## Performance Guidelines

### Event Connections
```typescript
// Clean up connections properly
const connection = workspace.ChildAdded.Connect((child) => {
    // Handle child added
});

// Clean up when no longer needed
connection.Disconnect();
```

### Loop Optimization
```typescript
// Cache array length in loops
const items = getItems();
const itemCount = items.length;
for (let i = 0; i < itemCount; i++) {
    processItem(items[i]);
}

// Use for-of for simpler iteration
for (const item of items) {
    processItem(item);
}
```

### Memory Management
```typescript
// Clear references when done
let largeDataStructure: LargeData | undefined = createLargeData();
processData(largeDataStructure);
largeDataStructure = undefined; // Allow garbage collection
```

## Project Architecture

### Server-Side Architecture (`src/server/`)

The server-side code follows a service-oriented architecture:

#### Main Server (`main.server.ts`)
- Central server initialization and setup
- Coordinates all server services and systems

#### Services Directory (`services/`)
- **`ability-service.ts`**: Manages player abilities, validation, and execution
- **`animation-service.ts`**: Handles character animations and animation state
- **`data-service.ts`**: Player data management using ProfileService
- **`services.server.ts`**: Service registration and dependency injection

#### Network Directory (`network/`)
- Reserved for server-side network request handlers
- Currently empty - future expansion for dedicated server networking logic

### Client-Side Architecture (`src/client/`)

#### Main Client (`main.client.ts`)
- Client initialization and setup
- UI and local systems coordination

#### Input Handler (`input.client.ts`)
- User input processing and validation
- Client-side input event handling

### Shared Module Architecture

The `src/shared/` directory follows a structured organization pattern:

### Asset IDs (`shared/asset-ids/`)

**Purpose**: Centralized Roblox asset ID constants and utilities

- Contains animation, image, and sound asset IDs
- Uses `const` assertions for type safety
- Provides validation functions for asset availability
- **Review Checklist**: Verify no placeholder IDs in production, check asset availability
- **Creation Pattern**: Constants → Types → Helper Functions

### Catalogs (`shared/catalogs/`)

**Purpose**: Game content configuration and metadata collections

- Structured data for game mechanics and content
- Strongly typed interfaces with validation
- Centralized configuration systems
- **Review Checklist**: Validate data integrity, check for missing entries, verify type safety
- **Creation Pattern**: Interfaces → Catalog Data → Helper Functions

### Helpers (`shared/helpers/`)

**Purpose**: Reusable utility functions and helper classes

- Pure functions with comprehensive type annotations
- Common operations and data transformations
- Type guards and validation utilities
- **Review Checklist**: Test complex logic, ensure performance, verify error handling
- **Creation Pattern**: Imports → Types → Helper Functions → Exports

### Keys (`shared/keys/`)

**Purpose**: String literal constants for entity identification

- Type-safe key definitions using `const` assertions
- Prevents typos and inconsistencies in entity references
- Includes validation and manipulation functions
- **Review Checklist**: Check for duplicates, ensure consistent naming conventions
- **Creation Pattern**: Key Arrays → Type Definitions → Helper Functions

### Meta (`shared/meta/`)

**Purpose**: Entity metadata and configuration data

- Readonly properties with builder patterns
- Default values and factory functions
- Configuration data for game mechanics
- **Review Checklist**: Validate structure integrity, check completeness, verify versioning
- **Creation Pattern**: Interfaces → Default Values → Factory Functions → Utilities

### Network (`shared/network/`)

**Purpose**: Client-server communication definitions

- @rbxts/net remote definitions with proper typing
- Security-focused with server-side validation
- Type-safe communication channels
- **Review Checklist**: Verify parameter types, validate security measures, check rate limiting
- **Creation Pattern**: Imports → Type Definitions → Remote Definitions

### Types (`shared/types/`)

**Purpose**: Shared TypeScript type definitions and interfaces

- PascalCase naming with comprehensive documentation
- Proper inheritance hierarchies
- Generic types for enhanced reusability
- **Review Checklist**: Check type relationships, ensure backwards compatibility, verify documentation
- **Creation Pattern**: Imports → Base Types → Complex Types → Utility Types

## Debugging Tips

### Console Logging

```typescript
// Use structured logging
print(`[${player.Name}] Ability ${abilityKey} started successfully`);
warn(`[ERROR] Failed to validate ability: ${abilityKey}`);

// Use conditional logging for development
const DEBUG = false; // Set to true for development
if (DEBUG) {
    print(`Debug: Player data: ${tostring(playerData)}`);
}
```

### Error Context

```typescript
// Provide context in error messages
if (abilityData === undefined) {
    error(`Ability data not found for key: ${abilityKey}. Available keys: ${ABILITY_KEYS.join(", ")}`);
}
```

---

**Remember**: These guidelines help maintain code quality, prevent bugs, and ensure your Roblox game performs well and remains secure.
