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
	Kick_01: "rbxassetid://kick_01_animation_id",
	Kick_02: "rbxassetid://kick_02_animation_id",
};
const ReactionAnimations = {
	TakeDamage: "rbxassetid://16158676664",
	Dodge: "rbxassetid://15487656295",
	BigDodge: "rbxassetid://15547518905",
	Taunt: "rbxassetid://98363948502311",
};
const MagicAnimations = {
	Cast_Projectile: "rbxassetid://cast_projectile_animation_id",
	Cast_Summon: "rbxassetid://cast_summon_animation_id",
	Cast_AOE_From_Ground: "rbxassetid://cast_aoe_from_ground_animation_id",
	Cast_AOE_From_Above: "rbxassetid://cast_aoe_from_above_animation_id",
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
	switch (key) {
		case "Punch_01":
		case "Punch_02":
		case "Kick_01":
		case "Kick_02":
			return AnimationConstants.Melee[key];
		case "TakeDamage":
		case "Dodge":
		case "BigDodge":
		case "Taunt":
			return AnimationConstants.Reaction[key];
		case "Cast_Projectile":
		case "Cast_Summon":
		case "Cast_AOE_From_Ground":
		case "Cast_AOE_From_Above":
			return AnimationConstants.Magic[key];
		default:
			return undefined;
	}
}
