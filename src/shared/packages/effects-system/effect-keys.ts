/**
 * @author Trembus
 * @description This file contains the effect keys used in the effects system.
 */

export const VFX_KEYS = [
	"CastFailInterupt",
	"CastStart",
	"Damage",
	"Heal",
	"Slow",
	"Poisoned",
	"Stunned",
	"Frost_Cast",
	"Animal_Cast",
	"Shrine_Cast",
	"Shadow_Cast",
	"Void_Cast",
	"Shadow_Cast",
] as const;
export type VFXKey = (typeof VFX_KEYS)[number];

export const VFX_CONFIG_OPTIONS = ["Aura", "Hands", "Floor", "Default"] as const;
export type VFXConfigOption = (typeof VFX_CONFIG_OPTIONS)[number];
