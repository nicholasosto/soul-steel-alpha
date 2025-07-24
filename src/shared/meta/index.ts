/**
 * @fileoverview Metadata module - Game entity metadata and configuration data
 * @module shared/meta
 * @layer Shared/Meta
 * @description
 * This module contains metadata definitions and configuration data for game entities.
 * Metadata provides additional information about abilities, items, characters, and
 * other game elements that is used for validation, display, and game logic.
 *
 * **Folder Purpose:**
 * - Contains metadata structures for game entities (abilities, items, etc.)
 * - Provides configuration data for game mechanics and features
 * - Organizes descriptive information used by UI and game systems
 * - Maintains structured data for entity properties and characteristics
 *
 * **Design Consistency Guidelines:**
 * - All metadata should be strongly typed with comprehensive interfaces
 * - Use readonly properties for immutable metadata where appropriate
 * - Include validation functions for metadata structure integrity
 * - Provide default values for optional metadata properties
 * - Group related metadata by entity type or functional category
 * - Implement builder patterns for complex metadata construction
 * - Include comprehensive documentation for all metadata properties
 *
 * **File Creation Guidelines:**
 * - Name files descriptively: `[entity-type]-meta.ts` (e.g., `ability-meta.ts`)
 * - Define clear interfaces for metadata structures
 * - Export both metadata interfaces and factory functions
 * - Include validation and utility functions for metadata manipulation
 * - Add comprehensive TS-Doc headers documenting metadata usage
 * - Follow pattern: Interfaces → Default Values → Factory Functions → Utilities
 * - Consider versioning for metadata schema changes
 * - Maintain compatibility with existing metadata consumers
 *
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 * @lastUpdated 2025-07-24 by Trembus - Added comprehensive documentation
 */

export * from "./ability-meta";
