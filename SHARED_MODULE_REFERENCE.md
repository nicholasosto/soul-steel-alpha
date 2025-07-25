# Shared Module Reference Guide

## Overview

The `src/shared/` directory contains all code that is accessible by both client and server in this Roblox-TS project. Each subfolder has a specific purpose and follows established design patterns for maintainability and type safety.

## Directory Structure & Purposes

### 📁 `asset-ids/` - Asset ID Constants
**Purpose**: Centralized Roblox asset ID management
- **Contains**: Animation, image, and sound asset IDs
- **Pattern**: Grouped constants with type unions and validation helpers
- **Key Files**: `animation-assets.ts`, `image-assets.ts`, `sound-assets.ts`
- **Review Focus**: Check for placeholder IDs, validate asset availability

### 📁 `catalogs/` - Configuration Data
**Purpose**: Structured game content definitions and metadata
- **Contains**: Game mechanics configuration, structured data collections
- **Pattern**: Strongly typed interfaces with validation and lookup functions
- **Key Files**: `ability-catalog.ts`
- **Current Files**: `ability-catalog.ts`, `index.ts`
- **Review Focus**: Data integrity, missing entries, type completeness
- **Note**: Contains temporary files (`.tmp`) during development - these should be cleaned up

### 📁 `helpers/` - Utility Functions
**Purpose**: Reusable utility functions and helper classes
- **Contains**: Pure functions, data transformers, common operations
- **Pattern**: Typed utility functions with comprehensive error handling
- **Key Files**: `animation-helpers.ts`, `type-guards.ts`
- **Review Focus**: Performanceerr handling, side effects

### 📁 `keys/` - String Identifiers
**Purpose**: Type-safe string literal constants for entity identification
- **Contains**: Game entity keys and identifiers
- **Pattern**: Const arrays with union types and validation utilities
- **Key Files**: `ability-keys.ts`
- **Review Focus**: Uniqueness, naming consistency, duplication

### 📁 `meta/` - Entity Metadata
**Purpose**: Metadata and configuration data for game entities
- **Contains**: Entity descriptors, configuration schemas
- **Pattern**: Readonly interfaces with builder patterns and defaults
- **Key Files**: `ability-meta.ts`
- **Review Focus**: Structure integrity, versioning, completeness

### 📁 `network/` - Communication Definitions
**Purpose**: Client-server communication interfaces
- **Contains**: Remote event/function definitions using @rbxts/net
- **Pattern**: Typed remote definitions with server validation
- **Key Files**: `ability-remotes.ts`, `game-cycle-remotes.ts`
- **Review Focus**: Security validation, parameter types, rate limiting

### 📁 `types/` - Type Definitions
**Purpose**: Shared TypeScript type definitions and interfaces
- **Contains**: Game entity types, data structures, utility types
- **Pattern**: PascalCase interfaces with inheritance and generics
- **Key Files**: `SSEntity.ts`
- **Review Focus**: Type relationships, backwards compatibility

## Common Design Patterns

### 1. Index File Pattern
Each folder contains an `index.ts` file that:
- Re-exports all modules in the folder
- Contains comprehensive TS-Doc documentation
- Explains folder purpose and guidelines
- Provides creation and review checklists

### 2. File Naming Conventions
- Use kebab-case for file names: `ability-keys.ts`
- Use descriptive category prefixes: `[category]-[type].ts`
- Match the folder's purpose in naming

### 3. Export Patterns
- Export individual items rather than default exports
- Use `export * from` in index files for re-exports
- Provide both data and type exports where applicable

### 4. Type Safety Patterns
- Use `const` assertions (`as const`) for immutable data
- Provide TypeScript union types for string literals
- Include validation functions for runtime checking
- Use descriptive interface names in PascalCase

### 5. Documentation Standards
- Include comprehensive TS-Doc headers
- Document all public interfaces and functions
- Provide usage examples for complex utilities
- Maintain consistent @author, @license, @since tags

## Development Guidelines

### When Adding New Modules
1. Determine the appropriate folder based on module purpose
2. Follow the established naming convention
3. Include comprehensive TS-Doc documentation
4. Add exports to the relevant `index.ts` file
5. Update type definitions as needed
6. Add validation/helper functions where appropriate

### When Reviewing Code
1. Check adherence to folder-specific patterns
2. Verify type safety and error handling
3. Ensure documentation completeness
4. Validate security for network-related code
5. Test performance for helper functions

### Security Considerations
- Never trust client data without server-side validation
- Use type guards for runtime validation
- Implement proper error handling and logging
- Consider rate limiting for client-callable functions

## Integration with Development Tools

### MCP Server
The project includes an MCP server that provides:
- Code reading and searching capabilities
- Project structure understanding
- Roblox-TS specific context and explanations

### Build System
- Uses `rbxtsc` for TypeScript to Lua compilation
- Shared modules become ModuleScripts in Roblox
- Maintains type safety across compilation boundary

### Linting and Formatting
- ESLint configuration for TypeScript
- Consistent code formatting standards
- Automated error detection and fixing

---

This reference guide should be consulted when working with shared modules to ensure consistency and maintainability across the codebase.
