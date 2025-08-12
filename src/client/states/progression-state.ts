/**
 * @file src/client/states/progression-state.ts
 * @module ProgressionState
 * @layer Client/States
 * @description Client-side progression state management
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Extracted from player-state for better organization
 *
 * ## Purpose
 * Manages player progression data (experience, levels) separately from resources.
 * This aligns with the server-side separation of progression from resource systems.
 *
 * ## Key Features
 * - Reactive progression state using Fusion Values
 * - Computed properties for UI display
 * - Level up notifications and progress tracking
 * - Integration with ProgressionRemotes
 */

import { Computed, Value } from "@rbxts/fusion";
import { PlayerProgression, makeDefaultPlayerProgression } from "shared";
import { ProgressionRemotes } from "shared/network/progression-remotes";

const FetchProgression = ProgressionRemotes.Client.Get("GET_PROGRESSION");
const ProgressionUpdated = ProgressionRemotes.Client.Get("PROGRESSION_UPDATED");
const LevelUp = ProgressionRemotes.Client.Get("LEVEL_UP");

export class ProgressionState {
	private static instance?: ProgressionState;

	// Reactive progression values
	public readonly Level: Value<number>;
	public readonly Experience: Value<number>;
	public readonly NextLevelExperience: Value<number>;

	private constructor() {
		// Initialize with defaults
		const defaults = makeDefaultPlayerProgression();
		this.Level = Value(defaults.Level);
		this.Experience = Value(defaults.Experience);
		this.NextLevelExperience = Value(defaults.NextLevelExperience);

		// Setup event listeners
		this.setupEventListeners();
	}

	public static getInstance(): ProgressionState {
		if (!ProgressionState.instance) {
			ProgressionState.instance = new ProgressionState();
		}
		return ProgressionState.instance;
	}

	private setupEventListeners(): void {
		// Listen for progression updates
		ProgressionUpdated.Connect((progression) => {
			if (progression !== undefined) {
				this.setProgression(progression);
			}
		});

		// Listen for level up events
		LevelUp.Connect((newLevel, progression) => {
			this.setProgression(progression);
			print(`🎉 Level Up! You are now level ${newLevel}!`);
		});
	}

	/**
	 * Initialize progression data from server
	 */
	public async initialize(): Promise<void> {
		try {
			const progression = await FetchProgression.CallServerAsync();
			if (progression) {
				this.setProgression(progression);
				print("Progression state initialized:", progression);
			} else {
				warn("No progression data received from server");
			}
		} catch (error) {
			warn("Failed to fetch progression data:", error);
		}
	}

	/**
	 * Update progression state with new data
	 */
	public setProgression(progression: PlayerProgression): void {
		this.Level.set(progression.Level);
		this.Experience.set(progression.Experience);
		this.NextLevelExperience.set(progression.NextLevelExperience);
	}

	/**
	 * Get current progression as plain object
	 */
	public getProgression(): PlayerProgression {
		return {
			Level: this.Level.get(),
			Experience: this.Experience.get(),
			NextLevelExperience: this.NextLevelExperience.get(),
		};
	}

	// Computed properties for UI
	public getProgressLabel(): Computed<string> {
		return Computed(() => {
			const level = this.Level.get();
			const exp = this.Experience.get();
			const nextLevelExp = this.NextLevelExperience.get();
			return `Level ${level} (${exp}/${nextLevelExp} XP)`;
		});
	}

	public getProgressPercentage(): Computed<number> {
		return Computed(() => {
			const exp = this.Experience.get();
			const nextLevelExp = this.NextLevelExperience.get();
			return nextLevelExp > 0 ? exp / nextLevelExp : 0;
		});
	}

	public getLevelDisplay(): Computed<string> {
		return Computed(() => `Level ${this.Level.get()}`);
	}

	public getExperienceDisplay(): Computed<string> {
		return Computed(() => {
			const exp = this.Experience.get();
			const nextLevelExp = this.NextLevelExperience.get();
			return `${exp}/${nextLevelExp} XP`;
		});
	}
}

// Export singleton instance
export const ProgressionStateInstance = ProgressionState.getInstance();
