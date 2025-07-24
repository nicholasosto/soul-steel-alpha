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

const MeleeAnimations = {
	Punch_01: "rbxassetid://16157509842",
	Punch_02: "rbxassetid://16157364563",
	// TODO: Replace with actual asset IDs when available
	Kick_01: "rbxassetid://0", // Placeholder - needs real asset ID
	Kick_02: "rbxassetid://0", // Placeholder - needs real asset ID
};
const ReactionAnimations = {
	TakeDamage: "rbxassetid://16158676664",
	Dodge: "rbxassetid://15487656295",
	BigDodge: "rbxassetid://15547518905",
	// TODO: Replace with actual asset ID when available
	Taunt: "rbxassetid://0", // Placeholder - needs real asset ID
};
const MagicAnimations = {
	// TODO: Replace with actual asset IDs when available
	Cast_Projectile: "rbxassetid://0", // Placeholder - needs real asset ID
	Cast_Summon: "rbxassetid://0", // Placeholder - needs real asset ID
	Cast_AOE_From_Ground: "rbxassetid://0", // Placeholder - needs real asset ID
	Cast_AOE_From_Above: "rbxassetid://0", // Placeholder - needs real asset ID
};

export const AnimationConstants = {
	Melee: MeleeAnimations,
	Reaction: ReactionAnimations,
	Magic: MagicAnimations,
} as const;
export type MeleeAnimationKey = keyof typeof MeleeAnimations;
export type ReactionAnimationKey = keyof typeof ReactionAnimations;
export type MagicAnimationKey = keyof typeof MagicAnimations;
export type AnimationKey = MeleeAnimationKey | ReactionAnimationKey | MagicAnimationKey;

export function getAnimationID(key: AnimationKey): string | undefined {
	// Find the animation in the appropriate category
	if (key in AnimationConstants.Melee) {
		const id = AnimationConstants.Melee[key as MeleeAnimationKey];
		return id !== "rbxassetid://0" ? id : undefined;
	}
	if (key in AnimationConstants.Reaction) {
		const id = AnimationConstants.Reaction[key as ReactionAnimationKey];
		return id !== "rbxassetid://0" ? id : undefined;
	}
	if (key in AnimationConstants.Magic) {
		const id = AnimationConstants.Magic[key as MagicAnimationKey];
		return id !== "rbxassetid://0" ? id : undefined;
	}
	return undefined;
}
