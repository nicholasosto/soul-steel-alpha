/**
 * @author Trembus
 * @description This file contains the effect keys used in the effects system.
 */

export const VFX_KEYS = [
	"CastFailInterupt",
	"CastStart",
	"CastStop",
	"Damage",
	"Heal",
	"Slow",
	"Poisoned",
	"Stunned",
] as const;

export type VFXKey = (typeof VFX_KEYS)[number];
