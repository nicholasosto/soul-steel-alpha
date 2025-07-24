/**
 * @file        animation-helpers.ts
 * @module      AnimationHelpers
 * @summary     Helper functions for animations.
 * @layer       shared/helpers
 * @description Provides utility functions for creating and managing animations.
 * @author       Trembus
 * @license      MIT
 * @since        0.1.0
 * @lastUpdated  2025-07-24 by Trembus
 */
import { Players } from "@rbxts/services";
import { AnimationConstants, AnimationKey, getAnimationID } from "shared/asset-ids";

export const AnimationTracks: Map<Model, Map<string, AnimationTrack>> = new Map();

// Cleanup animation tracks when player leaves
Players.PlayerRemoving.Connect((player) => {
	player.CharacterRemoving.Connect((character) => {
		cleanupCharacterAnimations(character);
	});
});

/**
 * Cleanup all animation tracks for a character to prevent memory leaks
 * @param character The character to cleanup animations for
 */
export function cleanupCharacterAnimations(character: Model): void {
	const characterTracks = AnimationTracks.get(character);
	if (characterTracks) {
		for (const [key, track] of characterTracks) {
			track.Stop();
			track.Destroy();
		}
		AnimationTracks.delete(character);
		warn(`Cleaned up animation tracks for character ${character.Name}`);
	}
}

function createAnimation(key: AnimationKey): Animation | undefined {
	const animationId = getAnimationID(key);
	if (animationId === undefined) {
		warn(`Animation ID not found or invalid for ${key}`);
		return undefined;
	}

	const animation = new Instance("Animation");
	animation.Name = key;
	animation.AnimationId = animationId;
	return animation;
}

function getAnimator(character: Model): Animator | undefined {
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (!humanoid) {
		warn(`Humanoid not found in character ${character.Name}`);
		return undefined;
	}
	const animator = humanoid.FindFirstChildOfClass("Animator");
	if (!animator) {
		warn(`Animator not found in humanoid of character ${character.Name}`);
		return undefined;
	}
	return animator as Animator;
}

function loadAnimationTrack(character: Model, key: AnimationKey): AnimationTrack | undefined {
	const animation = createAnimation(key);
	if (!animation) {
		return undefined;
	}

	const animator = getAnimator(character);
	if (!animator) {
		return undefined;
	}

	try {
		const track = animator.LoadAnimation(animation);
		return track;
	} catch (error) {
		warn(`Failed to load animation track for ${key} on character ${character.Name}: ${error}`);
		return undefined;
	}
}
function registerAnimationTrack(character: Model, key: AnimationKey): AnimationTrack | undefined {
	const track = loadAnimationTrack(character, key);
	if (!track) return undefined;

	if (!AnimationTracks.has(character)) {
		AnimationTracks.set(character, new Map());
	}
	AnimationTracks.get(character)?.set(key, track);

	return track;
}

export function LoadCharacterAnimations(character: Model, keys: AnimationKey[]): void {
	if (!AnimationTracks.has(character)) {
		AnimationTracks.set(character, new Map());
	}

	for (const key of keys) {
		const track = registerAnimationTrack(character, key);
		if (track) {
			warn(`Loaded animation track for ${key} on character ${character.Name}`);
		} else {
			warn(`Failed to load animation track for ${key} on character ${character.Name}`);
		}
	}
}

export function PlayAnimation(character: Model, key: AnimationKey): boolean {
	const track = AnimationTracks.get(character)?.get(key) as AnimationTrack;
	if (!track) {
		warn(`Animation track for ${key} not found on character ${character.Name}`);
		return false;
	}

	if (track.IsPlaying) {
		warn(`Animation ${key} is already playing on character ${character.Name}`);
		return false;
	}

	try {
		track.Play();
		warn(`Playing animation ${key} on character ${character.Name}`);
		return true;
	} catch (error) {
		warn(`Failed to play animation ${key} on character ${character.Name}: ${error}`);
		return false;
	}
}
