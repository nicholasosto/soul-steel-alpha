/**
 * @fileoverview Type Definitions module - Shared TypeScript type definitions
 * @module shared/types
 * @layer Shared/Types
 * @description
 * This module contains all shared TypeScript type definitions, interfaces, and
 * type utilities used across the game. Types provide compile-time safety and
 * enable better code documentation and IDE support.
 *
 * **Folder Purpose:**
 * - Contains shared TypeScript interfaces and type definitions
 * - Provides type utilities and helper types for common patterns
 * - Organizes complex type definitions for game entities and data structures
 * - Maintains type safety across client, server, and shared code boundaries
 *
 * **Design Consistency Guidelines:**
 * - Use PascalCase naming for interfaces and type aliases
 * - Prefer interfaces over type aliases for object shapes
 * - Include comprehensive documentation for all exported types
 * - Use generic types appropriately to enhance reusability
 * - Group related types and maintain logical organization
 * - Implement proper inheritance hierarchies for related types
 * - Use utility types (Partial, Required, Pick, etc.) for type transformations
 *
 * **File Creation Guidelines:**
 * - Name files descriptively using PascalCase: `[EntityType].ts` (e.g., `SSEntity.ts`)
 * - Include comprehensive TS-Doc comments for all exported types
 * - Export types individually rather than using default exports
 * - Follow pattern: Imports → Base Types → Complex Types → Utility Types
 * - Consider type versioning for breaking changes
 * - Use proper extends relationships for type hierarchies
 * - Include examples in documentation for complex types
 * - Maintain backwards compatibility when possible
 *
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 * @lastUpdated 2025-07-24 by Trembus - Added comprehensive documentation
 */

export * from "./ss-entity";
export * from "./message-types";
export * from "./player-data";
