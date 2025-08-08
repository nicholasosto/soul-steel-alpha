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
// Simple per-character animation group tagging for cancel/blend control
const AnimationGroups: Map<Model, Map<string, string>> = new Map();

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
	// Clear any group tags
	if (AnimationGroups.has(character)) {
		AnimationGroups.delete(character);
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

function getAnimator(character: Model, timeoutSec = 3): Animator | undefined {
	// Try to find humanoid with a short wait loop to avoid spawn race conditions
	let humanoid = character.FindFirstChildOfClass("Humanoid");
	if (!humanoid) {
		const deadline = tick() + timeoutSec;
		while (!humanoid && tick() < deadline) {
			task.wait(0.05);
			humanoid = character.FindFirstChildOfClass("Humanoid");
		}
	}
	if (!humanoid) {
		warn(`Humanoid not found in character ${character.Name}`);
		return undefined;
	}
	// Try to find animator with a short wait loop as well
	let animator = humanoid.FindFirstChildOfClass("Animator");
	if (!animator) {
		const deadline = tick() + timeoutSec;
		while (!animator && tick() < deadline) {
			task.wait(0.05);
			animator = humanoid.FindFirstChildOfClass("Animator");
		}
	}
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
	// Skip if already loaded
	const existing = AnimationTracks.get(character)?.get(key);
	if (existing) return existing;

	const track = loadAnimationTrack(character, key);
	if (!track) return undefined;

	if (!AnimationTracks.has(character)) {
		AnimationTracks.set(character, new Map());
	}
	AnimationTracks.get(character)!.set(key, track);

	return track;
}

export function LoadCharacterAnimations(character: Model, keys: AnimationKey[]): void {
	if (!AnimationTracks.has(character)) {
		AnimationTracks.set(character, new Map());
	}

	// De-duplicate keys to avoid extra work
	const seen = new Set<AnimationKey>();
	for (const key of keys) {
		if (seen.has(key)) continue;
		seen.add(key);

		// Skip reload if already present
		if (AnimationTracks.get(character)?.has(key)) {
			continue;
		}

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
 * Options to control how an animation plays
 */
export interface PlayOptions {
	/** Desired duration in seconds to fit the animation into (adjusts speed). Ignored if speed is provided. */
	duration?: number;
	/** Blend-in time in seconds. */
	fadeTime?: number;
	/** Play weight (0..1). */
	weight?: number;
	/** Explicit speed override (1 = normal speed). */
	speed?: number;
	/** If true and the track is already playing, stop and restart it. */
	forceRestart?: boolean;
	/** Tag this track with a group name for future cancellation. */
	group?: string;
	/** Cancel any currently playing tracks tagged with this group before playing. */
	cancelGroup?: string;
}

/**
 * Plays an animation on a character
 * - Backwards compatible: passing a number as the 3rd arg keeps prior duration behavior
 * @param character The character to play the animation on
 * @param key The animation key to play
 * @param options Either a duration number (legacy) or PlayOptions
 * @returns True if the animation was played successfully
 */
export function PlayAnimation(character: Model, key: AnimationKey, options?: number | PlayOptions): boolean {
	const track = AnimationTracks.get(character)?.get(key) as AnimationTrack;
	if (!track) {
		warn(`Animation track for ${key} not found on character ${character.Name}`);
		return false;
	}

	// Parse options
	let fadeTime: number | undefined;
	let weight: number | undefined;
	let speed: number | undefined;
	let duration: number | undefined;
	let forceRestart = false;
	let group: string | undefined;
	let cancelGroup: string | undefined;

	if (typeOf(options) === "number") {
		duration = options as number;
	} else if (options !== undefined) {
		const o = options as PlayOptions;
		fadeTime = o.fadeTime;
		weight = o.weight;
		speed = o.speed;
		duration = o.duration;
		forceRestart = o.forceRestart === true;
		group = o.group;
		cancelGroup = o.cancelGroup;
	} else {
		// Maintain legacy behavior: default duration = 1 when no options provided
		duration = 1;
	}

	// Cancel any group requested before playing
	if (cancelGroup !== undefined) {
		const groups = AnimationGroups.get(character);
		if (groups) {
			for (const [k, g] of groups) {
				if (g === cancelGroup) {
					const t = AnimationTracks.get(character)?.get(k);
					if (t && t.IsPlaying) {
						t.Stop(fadeTime ?? 0.1);
					}
				}
			}
		}
	}

	if (track.IsPlaying) {
		if (forceRestart) {
			track.Stop(fadeTime ?? 0);
		} else {
			warn(`Animation ${key} is already playing on character ${character.Name}`);
			return false;
		}
	}

	try {
		// Compute speed: prefer explicit speed, else compute from duration (if provided)
		let finalSpeed: number | undefined = speed;
		if (finalSpeed === undefined && duration !== undefined) {
			const length = track.Length;
			if (length > 0) finalSpeed = length / duration;
		}

		track.Play(fadeTime ?? 0.1, weight ?? 1);
		if (finalSpeed !== undefined && finalSpeed !== 1) {
			track.AdjustSpeed(finalSpeed);
		}

		// Tag group if provided
		if (group !== undefined) {
			if (!AnimationGroups.has(character)) AnimationGroups.set(character, new Map());
			AnimationGroups.get(character)!.set(key, group);
		}
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
	options?: number | PlayOptions,
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

	return PlayAnimation(character, animationKey as AnimationKey, options);
}
