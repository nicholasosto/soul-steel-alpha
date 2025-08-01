/**
 * @file src/client/controllers/GameActionController.ts
 * @module GameActionController
 * @layer Client/Controllers
 * @description Handles game actions like abilities and effects
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Extracted from input.client.ts for better separation of concerns
 */

import { AbilityKey } from "shared/keys";
import { VFXKey } from "shared/packages";
import { AbilityRemotes, EffectRemotes } from "shared/network";

/**
 * GameActionController handles game actions triggered by user input
 */
export class GameActionController {
	private static instance: GameActionController | undefined;
	private abilityRemote = AbilityRemotes.Client.Get("ABILITY_ACTIVATE");
	private effectRemote = EffectRemotes.Client.Get("RUN_EVENT");

	private constructor() {
		// Private constructor for singleton
	}

	/**
	 * Gets the singleton instance of the GameActionController
	 */
	public static getInstance(): GameActionController {
		if (!this.instance) {
			this.instance = new GameActionController();
		}
		return this.instance;
	}

	/**
	 * Activate an ability
	 */
	public async activateAbility(abilityKey: AbilityKey): Promise<boolean> {
		try {
			const success = await this.abilityRemote.CallServerAsync(abilityKey);
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
	 * Handle mouse clicks (can be extended for different actions)
	 */
	public handleMouseClick(button: "left" | "right"): void {
		print(`${button} mouse button clicked`);
		// TODO: Add actual mouse click handling logic
	}

	/**
	 * Handle debug key presses
	 */
	public handleDebugKey(keyName: string): void {
		print(`Key pressed: ${keyName}`);
		// TODO: Add debug functionality if needed
	}
}
