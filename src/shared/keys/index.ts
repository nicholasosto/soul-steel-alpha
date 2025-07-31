/**
 * @fileoverview Keys and Identifiers module - Centralized key definitions and constants
 * @module shared/keys
 * @layer Shared/Keys
 * @description
 * This module centralizes all key definitions, identifiers, and string constants
 * used throughout the game for referencing abilities, items, events, and other
 * game entities. Keys provide type-safe string literals for consistent referencing.
 *
 * **Folder Purpose:**
 * - Contains string literal constants for game entity identification
 * - Provides type-safe key definitions for abilities, items, events, etc.
 * - Centralizes identifier management to prevent typos and inconsistencies
 * - Maintains a single source of truth for all game keys and identifiers
 *
 * **Design Consistency Guidelines:**
 * - All key arrays should use `const` assertions with `as const`
 * - Use descriptive, kebab-case naming for string keys (e.g., "ice-rain")
 * - Provide corresponding TypeScript union types for each key array
 * - Include validation functions to check key validity
 * - Group related keys into logical categories (abilities, items, etc.)
 * - Maintain alphabetical ordering within key arrays for consistency
 * - Use SCREAMING_SNAKE_CASE for exported constant arrays
 *
 * **File Creation Guidelines:**
 * - Name files descriptively: `[category]-keys.ts` (e.g., `ability-keys.ts`)
 * - Export both the key array constant and its corresponding type
 * - Include helper functions for key validation and manipulation
 * - Add comprehensive TS-Doc headers documenting key usage
 * - Follow pattern: Key Arrays → Type Definitions → Helper Functions
 * - Ensure keys are unique within each category
 * - Consider backwards compatibility when adding or removing keys
 *
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 * @lastUpdated 2025-07-24 by Trembus - Added comprehensive documentation
 */

export * from "./ability-keys";
export * from "./combat-keys";
export * from "./event-keys";
export * from "./player-data-keys";
