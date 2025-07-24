/**
 * @fileoverview Asset IDs module - Centralized asset ID constants and utilities
 * @module shared/asset-ids
 * @layer Shared/AssetIds
 * @description
 * This module centralizes all Roblox asset ID constants used throughout the game.
 * Asset IDs include animations, images, sounds, and other media resources that
 * are uploaded to Roblox and referenced by their numeric IDs.
 *
 * **Folder Purpose:**
 * - Contains constants for all Roblox asset IDs (animations, images, sounds)
 * - Provides type-safe access to asset references
 * - Includes validation utilities for asset availability
 * - Organizes assets by category for better maintainability
 *
 * **Design Consistency Guidelines:**
 * - All asset constants should use `const` assertions with `as const`
 * - Asset IDs must be properly typed string literals (rbxassetid://[number])
 * - Use placeholder ID "rbxassetid://0" for unimplemented assets with TODO comments
 * - Group related assets into logical categories (Melee, Magic, UI, etc.)
 * - Provide type unions for each asset category (e.g., MeleeAnimationKey)
 * - Include validation functions to check asset availability
 *
 * **File Creation Guidelines:**
 * - Name files descriptively: `[category]-assets.ts` (e.g., `animation-assets.ts`)
 * - Export both the constant object and its type definitions
 * - Include helper functions for asset validation and retrieval
 * - Add comprehensive TS-Doc headers with @file, @module, @description
 * - Follow the established pattern: Constants → Types → Helper Functions
 * - Use proper import organization: external packages, shared modules, local imports
 *
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 * @lastUpdated 2025-07-24 by Trembus - Added comprehensive documentation
 */

export * from "./animation-assets";
export * from "./image-assets";
export * from "./sound-assets";
