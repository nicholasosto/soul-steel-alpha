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
import { getAnimationId, getAllAnimationIds, AnimationKey, AnimationIdMap } from "shared/asset-ids/animation-assets";

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

function createAnimation(key: string): Animation | undefined {
	const animationId = getAnimationId(key);
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

/**
 * Loads all available animations for a character on spawn
 * This includes all emotes, ability animations, and combat animations
 * @param character The character to load animations for
 */
export function LoadAllCharacterAnimations(character: Model): void {
	const animationKeys: AnimationKey[] = [];

	// Get all animation keys from the map
	for (const [key] of AnimationIdMap) {
		animationKeys.push(key as AnimationKey);
	}

	LoadCharacterAnimations(character, animationKeys);
	print(`Loaded ${animationKeys.size()} animations for character ${character.Name}`);
}

/**
 * Helper function to find animation key by ID
 * @param animationId The animation ID to find the key for
 * @returns The animation key or undefined if not found
 */
function findAnimationKeyById(animationId: string): string | undefined {
	for (const [key, id] of AnimationIdMap) {
		if (id === animationId) {
			return key;
		}
	}
	return undefined;
}

/**
 * Plays an animation on a character
 * @param character The character to play the animation on
 * @param key The animation key to play
 * @returns True if the animation was played successfully
 */
export function PlayAnimation(character: Model, key: AnimationKey, duration: number = 1): boolean {
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
		const length = track.Length;
		const speed = length / duration; // Adjust speed based on desired duration
		track.Play();
		track.AdjustSpeed(speed);
		warn(`Playing animation ${key} on character ${character.Name}`);
		return true;
	} catch (error) {
		warn(`Failed to play animation ${key} on character ${character.Name}: ${error}`);
		return false;
	}
}

/**
 * Plays a random animation from a set of animation IDs
 * @param character The character to play the animation on
 * @param animationSet Array of animation IDs to choose from
 * @returns True if an animation was played successfully
 */
export function PlayRandomAnimationFromSet(
	character: Model,
	animationSet: readonly string[],
	duration: number = 1,
): boolean {
	if (animationSet.size() === 0) {
		warn(`No animations in set for character ${character.Name}`);
		return false;
	}

	// Get a random animation from the set
	const randomIndex = math.random(0, animationSet.size() - 1);
	const selectedAnimationId = animationSet[randomIndex];

	// Find the key for this animation ID
	const animationKey = findAnimationKeyById(selectedAnimationId);
	if (animationKey === undefined) {
		warn(`Could not find animation key for ID ${selectedAnimationId}`);
		return false;
	}

	return PlayAnimation(character, animationKey as AnimationKey);
}
