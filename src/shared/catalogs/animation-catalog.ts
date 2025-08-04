/**
 * @file        animation-catalog.ts
 * @module      AnimationCatalog
 * @summary     Animation catalog for organizing animations by category
 * @layer       shared/catalogs
 * @description Provides organized access to animation sets for abilities, emotes, and combat
 * @author      Trembus
 * @license     MIT
 * @since       1.0.0
 * @lastUpdated 2025-07-31 by Trembus - Updated to use new animation system
 */

import { AbilityKey } from "shared/catalogs/ability-catalog";
import { AnimationSets } from "shared/asset-ids/animation-assets";

/**
 * Maps ability keys to their corresponding animation sets
 */
export const AbilityAnimationCatalog: Record<AbilityKey, readonly string[]> = {
	Melee: AnimationSets.MeleeAnimationSet,
	"Ice-Rain": AnimationSets.IceRainAnimationSet,
	Earthquake: AnimationSets.EarthquakeAnimationSet,
	"Soul-Drain": AnimationSets.SoulDrainAnimationSet,
};

/**
 * Animation sets for emotes
 */
export const EmoteAnimationCatalog = {
	Taunt: AnimationSets.EmoteAnimationSet,
} as const;

/**
 * Animation sets for combat actions
 */
export const CombatAnimationCatalog = {
	Combat: AnimationSets.CombatAnimationSet,
} as const;

/**
 * Get animation set for a specific ability
 * @param abilityKey The ability to get animations for
 * @returns Array of animation IDs for the ability
 */
export function getAbilityAnimations(abilityKey: AbilityKey): readonly string[] {
	return AbilityAnimationCatalog[abilityKey];
}

/**
 * Get all available animation sets organized by category
 * @returns Object containing all animation sets
 */
export function getAllAnimationSets() {
	return {
		abilities: AbilityAnimationCatalog,
		emotes: EmoteAnimationCatalog,
		combat: CombatAnimationCatalog,
	} as const;
}
