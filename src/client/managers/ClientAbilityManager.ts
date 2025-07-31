/**
 * @file Client-side Ability Manager
 * @description Manages ability cooldowns and UI integration on the client side
 */

import { AbilityKey, ABILITY_KEYS } from "shared/keys";
import { AbilityCatalog } from "shared/catalogs";
import { CooldownTimer } from "shared/packages";
import { Value } from "@rbxts/fusion";

/**
 * Client-side ability manager that handles cooldown tracking and UI integration.
 * Works with AbilityButton components to provide real-time cooldown feedback.
 */
export class ClientAbilityManager {
	private static instance: ClientAbilityManager | undefined;

	/** Map of ability keys to their cooldown timers */
	private cooldownTimers: Map<AbilityKey, CooldownTimer> = new Map();

	/** Map of ability keys to their reactive progress values for UI binding */
	private cooldownProgress: Map<AbilityKey, Value<number>> = new Map();

	/**
	 * Gets the singleton instance of the ClientAbilityManager
	 */
	public static getInstance(): ClientAbilityManager {
		if (!this.instance) {
			this.instance = new ClientAbilityManager();
		}
		return this.instance;
	}

	private constructor() {
		// Initialize progress values for all abilities
		for (const abilityKey of ABILITY_KEYS) {
			this.cooldownProgress.set(abilityKey, Value(0));
		}
	}

	/**
	 * Gets the reactive cooldown progress value for an ability.
	 * Use this to bind to AbilityButton components.
	 *
	 * @param abilityKey - The ability to get progress for
	 * @returns Fusion Value<number> where 0 = ready, 1 = full cooldown
	 */
	public getCooldownProgress(abilityKey: AbilityKey): Value<number> {
		return this.cooldownProgress.get(abilityKey) ?? Value(0);
	}

	/**
	 * Checks if an ability is currently on cooldown
	 *
	 * @param abilityKey - The ability to check
	 * @returns True if on cooldown, false if ready
	 */
	public isOnCooldown(abilityKey: AbilityKey): boolean {
		const timer = this.cooldownTimers.get(abilityKey);
		return timer !== undefined && !timer.isReady();
	}

	/**
	 * Starts a cooldown for an ability (typically called after server confirms usage)
	 *
	 * @param abilityKey - The ability that was used
	 */
	public startCooldown(abilityKey: AbilityKey): void {
		const abilityMeta = AbilityCatalog[abilityKey];
		if (!abilityMeta) {
			warn(`Unknown ability: ${abilityKey}`);
			return;
		}

		// Clean up existing timer if any
		const existingTimer = this.cooldownTimers.get(abilityKey);
		if (existingTimer) {
			existingTimer.destroy();
		}

		// Create new timer
		const timer = new CooldownTimer(abilityMeta.cooldown);
		const progressValue = this.cooldownProgress.get(abilityKey)!;

		// Update UI progress whenever timer progress changes
		// We'll use a simple polling approach since Fusion Values don't have onChange
		const updateProgress = () => {
			progressValue.set(timer.Progress.get());
		};

		// Start periodic updates (could be optimized with RunService)
		const updateTask = task.spawn(() => {
			while (!timer.isReady()) {
				updateProgress();
				task.wait(0.1); // Update 10 times per second
			}
			progressValue.set(0); // Ensure it's set to 0 when done
		});

		// Cleanup when done
		timer.onComplete(() => {
			task.cancel(updateTask);
			progressValue.set(0);
			this.cooldownTimers.delete(abilityKey);
			timer.destroy();
		});

		// Store timer and start
		this.cooldownTimers.set(abilityKey, timer);
		timer.start();

		print(`Started client cooldown for ${abilityKey} (${abilityMeta.cooldown}s)`);
	}

	/**
	 * Cancels a cooldown for an ability
	 *
	 * @param abilityKey - The ability to cancel cooldown for
	 */
	public cancelCooldown(abilityKey: AbilityKey): void {
		const timer = this.cooldownTimers.get(abilityKey);
		if (timer) {
			timer.destroy();
			this.cooldownTimers.delete(abilityKey);
			this.cooldownProgress.get(abilityKey)?.set(0);
			print(`Cancelled cooldown for ${abilityKey}`);
		}
	}

	/**
	 * Gets remaining cooldown time in seconds
	 *
	 * @param abilityKey - The ability to check
	 * @returns Remaining time in seconds, 0 if ready
	 */
	public getRemainingCooldown(abilityKey: AbilityKey): number {
		const timer = this.cooldownTimers.get(abilityKey);
		if (!timer) return 0;

		const abilityMeta = AbilityCatalog[abilityKey];
		const progress = timer.Progress.get();
		return math.ceil(abilityMeta.cooldown * progress);
	}

	/**
	 * Cleanup all timers - call when player is leaving or resetting
	 */
	public cleanup(): void {
		for (const [abilityKey, timer] of this.cooldownTimers) {
			timer.destroy();
			this.cooldownProgress.get(abilityKey)?.set(0);
		}
		this.cooldownTimers.clear();
		print("Cleaned up all ability cooldowns");
	}
}

// Export singleton instance for easy access
export const ClientAbilityManagerInstance = ClientAbilityManager.getInstance();
