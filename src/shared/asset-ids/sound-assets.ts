/// <reference types="@rbxts/types" />

/**
 * @file        audio.ts
 * @module      SoundConstants
 * @layer       shared/asset-ids
 * @summary     Sound asset constants for the game.
 * @author       Trembus
 * @license      MIT
 * @since        0.1.0
 * @lastUpdated  2025-06-10 by Trembus
 */

export const SoundConstants = {
	Validation: {
		CastSuccess: "rbxassetid://6874710483",
		CastFail: "rbxassetid://2390695935",
	},
	Combat: {
		Hurt: "rbxassetid://124168040156203",
	},
	RobotTheme: {
		/* Game Audio Assets */
		BackgroundMusic: "rbxassetid://1234567890",
		/* GUI Audio Assets */
		SuccessClick: "rbxassetid://1234567891",
		ErrorClick: "rbxassetid://1234567892",

		/* Combat Audio Assets */
		Damaged: "rbxassetid://1234567893",
		CastSpell: "rbxassetid://1234567894",
		MeleeAttack: "rbxassetid://1234567895",
		Death: "rbxassetid://1234567896",
		LevelUp: "rbxassetid://1234567897",
		Hurt: "rbxassetid://95887429435303",
	},
	FatelessTheme: {
		Hurt: "rbxassetid://124168040156203", // Replace with actual asset ID
	},
	ZombieTheme: {
		BackgroundMusic: "rbxassetid://1234567898", // Replace with actual asset ID
		SuccessClick: "rbxassetid://1234567899",
		ErrorClick: "rbxassetid://1234567900",
		Damaged: "rbxassetid://1234567901",
		CastSpell: "rbxassetid://1234567902",
		MeleeAttack: "rbxassetid://1234567903",
		Death: "rbxassetid://1234567904",
		LevelUp: "rbxassetid://1234567905",
		Hurt: "rbxassetid://149041017",
	},
} as const;

export type SoundKey = keyof typeof SoundConstants;
export type ValidationSound = keyof typeof SoundConstants.Validation;
export type CombatSound = keyof typeof SoundConstants.Combat;
export type RobotThemeSound = keyof typeof SoundConstants.RobotTheme;
export type FatelessThemeSound = keyof typeof SoundConstants.FatelessTheme;
export type ZombieThemeSound = keyof typeof SoundConstants.ZombieTheme;
