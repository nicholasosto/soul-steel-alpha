/**
 * @file src/client/states/ability-state.ts
 * @module AbilityState
 * @layer Client/State
 * @description Centralized client state for ability UI (cooldown progress, availability)
 *
 * Notes
 * - 0 = ready, >0..1 = cooling down (fractional progress)
 * - This state is the single source of truth for HUD cooldown visuals
 */

import { Value } from "@rbxts/fusion";
import { ABILITY_KEYS, AbilityKey } from "shared";

type CooldownMap = Map<AbilityKey, Value<number>>;

class AbilityState {
	private static instance?: AbilityState;
	private cooldownProgress: CooldownMap = new Map();

	private constructor() {
		// Initialize progress values for all known abilities
		for (const key of ABILITY_KEYS) {
			this.cooldownProgress.set(key, Value(0));
		}
	}

	public static getInstance(): AbilityState {
		if (this.instance === undefined) this.instance = new AbilityState();
		return this.instance;
	}

	/**
	 * Get the reactive cooldown progress Value for an ability
	 * 0 = ready, 1 = full cooldown
	 */
	public getProgressValue(key: AbilityKey): Value<number> {
		const v = this.cooldownProgress.get(key);
		if (v !== undefined) return v;
		const created = Value(0);
		this.cooldownProgress.set(key, created);
		return created;
	}

	/**
	 * Set progress (0..1). Use 0 to indicate ready.
	 */
	public setProgress(key: AbilityKey, progress: number): void {
		const v = this.cooldownProgress.get(key);
		if (v !== undefined) v.set(progress);
	}

	/**
	 * Reset an ability's cooldown (sets progress to 0)
	 */
	public reset(key: AbilityKey): void {
		const v = this.cooldownProgress.get(key);
		if (v !== undefined) v.set(0);
	}
}

export const AbilityStateInstance = AbilityState.getInstance();
export type { AbilityState };
