/**
 * @file        src/shared/helpers/audio-helpers.ts
 * @summary     Audio helper functions for the game.
 * @module      AudioHelpers
 * @layer       shared/helpers
 * @description Provides utility functions for handling audio assets in the game.
 * @author       Trembus
 * @license      MIT
 * @since        0.1.0
 * @lastUpdated  2025-06-10 by Trembus
 */

import { SoundConstants, SoundKey, ValidationSound } from "shared/asset-ids";

const AudioCache: Map<ValidationSound, Sound> = new Map();
/**
 * Plays a sound based on the provided sound key.
 * @param soundKey The key of the sound to play.
 * @param volume The volume of the sound (default is 1).
 */

function addSound(soundKey: ValidationSound): void {
	const soundId = SoundConstants.Validation[soundKey];
	if (!soundId) {
		warn(`Sound ${soundKey} does not exist in SoundConstants`);
		return;
	}
	const sound = new Instance("Sound");
	sound.SoundId = soundId;
	sound.Name = soundKey;

	if (!AudioCache.has(soundKey)) {
		AudioCache.set(soundKey, sound);
	} else {
		warn(`Sound ${soundKey} already exists in cache.`);
	}
}
addSound("CastFail");
addSound("CastSuccess");

export function playSound(soundKey: ValidationSound): void {
	const sound = AudioCache.get(soundKey);
	if (sound) {
		sound.Play();
	} else {
		warn(`Sound ${soundKey} is not loaded in cache.`);
	}
}
