/**
 * @file src/server/collection-items/index.ts
 * @module CollectionItems
 * @layer Server/CollectionItems
 * @description Central export point for all collection items
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Created modular collection item architecture
 */

// Base classes and interfaces
export * from "./base-collection-item";

// Active collection items
export * from "./lava-part";
export * from "./experience-orb";

// Future collection items (disabled by default)
export * from "./healing-crystal";

// Registry of all collection items for easy management
import { LavaPartInstance } from "./lava-part";
import { ExperienceOrbInstance } from "./experience-orb";
import { HealingCrystalInstance } from "./healing-crystal";
import { ICollectionItem } from "./base-collection-item";

/**
 * Registry of all available collection items
 * Add new collection items here to automatically include them in the system
 */
export const COLLECTION_ITEMS_REGISTRY: ICollectionItem[] = [
	LavaPartInstance,
	ExperienceOrbInstance,
	HealingCrystalInstance, // Disabled by default via config
];

/**
 * Get only the enabled collection items
 */
export function getEnabledCollectionItems(): ICollectionItem[] {
	return COLLECTION_ITEMS_REGISTRY.filter((item) => item.config.enabled !== false);
}

/**
 * Get collection item by tag name
 */
export function getCollectionItemByTag(tag: string): ICollectionItem | undefined {
	return COLLECTION_ITEMS_REGISTRY.find((item) => item.config.tag === tag);
}

/**
 * Get collection item by name
 */
export function getCollectionItemByName(name: string): ICollectionItem | undefined {
	return COLLECTION_ITEMS_REGISTRY.find((item) => item.config.name === name);
}
