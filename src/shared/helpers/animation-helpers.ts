/// <reference types="@rbxts/types" />
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
import { AnimationConstants, AnimationKey, getAnimationID } from "shared/asset-ids";
export const AnimationTracks: Map<Model, Map<string, AnimationTrack>> = new Map();

function createAnimation(key: AnimationKey): Animation | undefined {
	const animation = new Instance("Animation");
	const animationId = getAnimationID(key);
	if (animationId === undefined) {
		warn(`Animation ID not found for ${key}`);
		return undefined;
	}
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
	const animationKey = animation?.Name as AnimationKey;
	const animator = getAnimator(character) as Animator;
	if (!animationKey || !animation || !animator) return undefined;

	const track = animator?.LoadAnimation(animation);

	return track;
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

export function PlayAnimation(character: Model, key: AnimationKey): void {
	const track = AnimationTracks.get(character)?.get(key) as AnimationTrack;
	if (!track) {
		warn(`Animation track for ${key} not found on character ${character.Name}`);
		return;
	}

	if (track.IsPlaying) {
		warn(`Animation ${key} is already playing on character ${character.Name}`);
		return;
	}

	track.Play();
	warn(`Playing animation ${key} on character ${character.Name}`);
}
