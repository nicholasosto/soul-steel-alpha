/**
 * @file src/client/controllers/AbilityController.ts
 * @module AbilityController
 * @layer Client/Controllers
 * @description Unified ability controller that handles activation, cooldowns, and effects
 *
 * @responsibility Ability system management ONLY
 * @responsibilities
 * - Ability activation via network calls
 * - Cooldown tracking and management
 * - Effect triggering
 * - UI integration with reactive progress values
 * - Mouse-based ability targeting (future)
 *
 * @anti_patterns
 * - DO NOT handle input mapping (use InputController)
 * - DO NOT handle movement logic (use MovementController)
 * - DO NOT handle zone interactions (use ZoneController)
 * - DO NOT duplicate network setup from other controllers
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-07 - Consolidated from GameActionController and ClientAbilityManager
 */

import { AbilityKey, ABILITY_KEYS } from "shared";
import { VFXKey } from "shared/packages";
import { AbilityCatalog } from "shared/catalogs";
import { CooldownTimer } from "shared/packages";
import { AbilityRemotes, EffectRemotes } from "shared/network";
import { Value } from "@rbxts/fusion";

/**
 * AbilityController handles all ability-related functionality:
 * - Ability activation via network calls
 * - Cooldown tracking and management
 * - Effect triggering
 * - UI integration with reactive progress values
 */
export class AbilityController {
	private static instance: AbilityController | undefined;

	/** Network remotes */
	private abilityRemote = AbilityRemotes.Client.Get("ABILITY_ACTIVATE");
	private effectRemote = EffectRemotes.Client.Get("RUN_EVENT");

	/** Map of ability keys to their cooldown timers */
	private cooldownTimers: Map<AbilityKey, CooldownTimer> = new Map();

	/** Map of ability keys to their reactive progress values for UI binding */
	private cooldownProgress: Map<AbilityKey, Value<number>> = new Map();

	private constructor() {
		// Initialize progress values for all abilities
		for (const abilityKey of ABILITY_KEYS) {
			this.cooldownProgress.set(abilityKey, Value(0));
		}
	}

	/**
	 * Gets the singleton instance of the AbilityController
	 */
	public static getInstance(): AbilityController {
		if (!this.instance) {
			this.instance = new AbilityController();
		}
		return this.instance;
	}

	/**
	 * Activate an ability with cooldown checking
	 */
	public async activateAbility(abilityKey: AbilityKey): Promise<boolean> {
		// Check if ability is on cooldown
		if (this.isOnCooldown(abilityKey)) {
			const remaining = this.getRemainingCooldown(abilityKey);
			warn(`Ability ${abilityKey} is on cooldown for ${remaining} more seconds`);
			return false;
		}

		try {
			const success = await this.abilityRemote.CallServerAsync(abilityKey);

			// If server confirms activation, start cooldown
			if (success) {
				this.startCooldown(abilityKey);
			}

			return success;
		} catch (error) {
			warn(`Failed to activate ability ${abilityKey}: ${error}`);
			return false;
		}
	}

	/**
	 * Trigger an effect
	 */
	public async triggerEffect(effectKey: VFXKey): Promise<void> {
		try {
			await this.effectRemote.CallServerAsync(effectKey);
		} catch (error) {
			warn(`Failed to trigger effect ${effectKey}: ${error}`);
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
		const updateProgress = () => {
			progressValue.set(timer.Progress.get());
		};

		// Start periodic updates
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

		print(`Started cooldown for ${abilityKey} (${abilityMeta.cooldown}s)`);
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
	 * Handle mouse clicks for ability targeting
	 */
	public handleMouseClick(button: "left" | "right"): void {
		// TODO: Implement mouse-based ability targeting
		print(`${button} mouse button clicked - ability targeting`);
	}

	/**
	 * Handle debug key presses for ability testing
	 */
	public handleDebugKey(keyName: string): void {
		print(`Debug key pressed: ${keyName}`);
		// TODO: Add debug functionality for ability testing
	}

	/**
	 * Cleanup all timers and resources
	 */
	public destroy(): void {
		for (const [abilityKey, timer] of this.cooldownTimers) {
			timer.destroy();
			this.cooldownProgress.get(abilityKey)?.set(0);
		}
		this.cooldownTimers.clear();
		print("AbilityController destroyed");
	}
}
