/**
 * @file Effect Helpers
 * @description This file contains helper functions for managing effects in the effects system.
 * @author Trembus
 *
 */

import { EffectCatalog, EffectMeta } from "./effect-catalog";
import { VFXKey } from "./effect-keys";

export function getEffectMeta(key: VFXKey): EffectMeta | undefined {
	return EffectCatalog[key];
}

export function RunEffect(key: VFXKey, characterRig: Model) {
	const effectMeta = getEffectMeta(key);
	if (!effectMeta) return;
	warn(`Running effect: ${effectMeta.displayName} (${key}) on character rig: ${characterRig.Name}`);

	// Logic to run the effect using effectMeta
}
