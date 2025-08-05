/**
 * @fileoverview Game Catalogs module - Configuration and metadata collections
 * @module shared/catalogs
 * @layer Shared/Catalogs
 * @description
 * This module contains catalog systems that define game content configurations,
 * metadata, and structured data collections used throughout the game.
 * Catalogs serve as centralized data stores for game mechanics and content.
 *
 * **Folder Purpose:**
 * - Contains structured data catalogs for game content (abilities, items, etc.)
 * - Provides centralized configuration systems for game mechanics
 * - Organizes metadata and reference data used by game systems
 * - Maintains data integrity through type-safe catalog definitions
 *
 * **Design Consistency Guidelines:**
 * - All catalog data should be strongly typed with interface definitions
 * - Use const assertions (`as const`) for immutable catalog data
 * - Implement validation functions for catalog entries
 * - Provide lookup utilities and helper functions for catalog access
 * - Group related catalog entries by logical categories
 * - Include comprehensive type definitions for all catalog properties
 *
 * **File Creation Guidelines:**
 * - Name files descriptively: `[content-type]-catalog.ts` (e.g., `ability-catalog.ts`)
 * - Define clear interfaces for catalog entry structures
 * - Export both catalog data and corresponding types
 * - Include validation and lookup helper functions
 * - Add comprehensive TS-Doc headers documenting catalog structure
 * - Follow pattern: Interfaces → Catalog Data → Helper Functions
 * - Use proper import organization and dependency management
 *
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 * @lastUpdated 2025-07-24 by Trembus - Added comprehensive documentation
 */

export * from "./ability-catalog";
export * from "./animation-catalog";
export * from "./force-catalog";
export * from "./npc-model-catalog";
export * from "./zone-catalog";
