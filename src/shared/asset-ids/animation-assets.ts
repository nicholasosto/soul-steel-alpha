/// <reference types="@rbxts/types" />

/**
 * @file        animations.ts
 * @module      AnimationConstants
 * @summary     Animation asset constants for the game.
 * @layer       Shared/asset-ids
 * @description List of animation asset IDs used in the game.
 * @author       Trembus
 * @license      MIT
 * @since        0.1.0
 * @lastUpdated  2025-06-10 by Trembus
 */

// Melee Animation Sets
const MeleeAnimations = {
	Punch_01: "rbxassetid://16157509842",
	Punch_02: "rbxassetid://16157364563",
	Kick_01: "rbxassetid://16157497624",
	Kick_02: "rbxassetid://16157516671",
} as const;

// Combat/Reaction Animation Sets
const CombatAnimations = {
	TakeDamage: "rbxassetid://16158676664",
	Dodge: "rbxassetid://15487656295",
	BigDodge: "rbxassetid://15547518905",
} as const;

// Magic/Ability Animation Sets
const MagicAnimations = {
	Cast_Projectile: "rbxassetid://72830464857270", // Name - Cast Fast
	Cast_Summon: "rbxassetid://140479956568725",
	Cast_AOE_From_Ground: "rbxassetid://16157497624",
	Cast_AOE_From_Above: "rbxassetid://140479956568725",
} as const;

// Emote Animation Sets
const EmoteAnimations = {
	Taunt: "rbxassetid://140479956568725",
} as const;

// Animation Sets - grouped by category for easy loading
export const AnimationSets = {
	// Ability Animation Sets
	MeleeAnimationSet: [
		MeleeAnimations.Punch_01,
		MeleeAnimations.Punch_02,
		MeleeAnimations.Kick_01,
		MeleeAnimations.Kick_02,
	],
	IceRainAnimationSet: [MagicAnimations.Cast_Projectile, MagicAnimations.Cast_AOE_From_Ground],
	EarthquakeAnimationSet: [MagicAnimations.Cast_Summon],
	SoulDrainAnimationSet: [MagicAnimations.Cast_Summon],

	// Combat Animation Sets
	CombatAnimationSet: [CombatAnimations.TakeDamage, CombatAnimations.Dodge, CombatAnimations.BigDodge],

	// Emote Animation Sets
	EmoteAnimationSet: [EmoteAnimations.Taunt],
} as const;

// All animations for easy access
export const AnimationConstants = {
	Melee: MeleeAnimations,
	Combat: CombatAnimations,
	Magic: MagicAnimations,
	Emote: EmoteAnimations,
} as const;

// Create a map for easy lookup by animation ID
export const AnimationIdMap = new Map<string, string>([
	// Melee animations
	["Punch_01", MeleeAnimations.Punch_01],
	["Punch_02", MeleeAnimations.Punch_02],
	["Kick_01", MeleeAnimations.Kick_01],
	["Kick_02", MeleeAnimations.Kick_02],

	// Combat animations
	["TakeDamage", CombatAnimations.TakeDamage],
	["Dodge", CombatAnimations.Dodge],
	["BigDodge", CombatAnimations.BigDodge],

	// Magic animations
	["Cast_Projectile", MagicAnimations.Cast_Projectile],
	["Cast_Summon", MagicAnimations.Cast_Summon],
	["Cast_AOE_From_Ground", MagicAnimations.Cast_AOE_From_Ground],
	["Cast_AOE_From_Above", MagicAnimations.Cast_AOE_From_Above],

	// Emote animations
	["Taunt", EmoteAnimations.Taunt],
]);

// Get all animation IDs for preloading
export function getAllAnimationIds(): string[] {
	const allIds: string[] = [];

	// Add melee animations
	for (const [, id] of pairs(MeleeAnimations)) {
		allIds.push(id);
	}

	// Add combat animations
	for (const [, id] of pairs(CombatAnimations)) {
		allIds.push(id);
	}

	// Add magic animations
	for (const [, id] of pairs(MagicAnimations)) {
		allIds.push(id);
	}

	// Add emote animations
	for (const [, id] of pairs(EmoteAnimations)) {
		allIds.push(id);
	}

	return allIds;
}

// Helper function to get animation ID by key
export function getAnimationId(key: string): string | undefined {
	return AnimationIdMap.get(key);
}

// Type definitions
export type MeleeAnimationKey = keyof typeof MeleeAnimations;
export type CombatAnimationKey = keyof typeof CombatAnimations;
export type MagicAnimationKey = keyof typeof MagicAnimations;
export type EmoteAnimationKey = keyof typeof EmoteAnimations;
export type AnimationKey = MeleeAnimationKey | CombatAnimationKey | MagicAnimationKey | EmoteAnimationKey;
export type AnimationSetKey = keyof typeof AnimationSets;
