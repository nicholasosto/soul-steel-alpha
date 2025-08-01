/**
 * @file src/client/controllers/MovementController.ts
 * @module MovementController
 * @layer Client/Controllers
 * @description Handles player movement logic including running and jumping
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Extracted from input.client.ts for better separation of concerns
 */

import Fusion, { Observer, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { ForceCatalog } from "shared/catalogs";
import { SSEntity } from "shared/types";

const LocalPlayer = Players.LocalPlayer;

/**
 * MovementController handles player movement state and mechanics
 */
export class MovementController {
	private static instance: MovementController | undefined;
	private runningState = Value(false);

	private constructor() {
		// Set up reactive observer for running state
		Observer(this.runningState).onChange(() => {
			this.updateWalkSpeed();
		});
	}

	/**
	 * Gets the singleton instance of the MovementController
	 */
	public static getInstance(): MovementController {
		if (!this.instance) {
			this.instance = new MovementController();
		}
		return this.instance;
	}

	/**
	 * Start running
	 */
	public startRunning(): void {
		this.runningState.set(true);
	}

	/**
	 * Stop running
	 */
	public stopRunning(): void {
		this.runningState.set(false);
	}

	/**
	 * Handle jump request with double-jump mechanics
	 */
	public jump(): void {
		const character = LocalPlayer.Character as SSEntity;
		if (!character) {
			return;
		}

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		const currentHumanoidState = humanoid?.GetState();
		if (currentHumanoidState === undefined) {
			return;
		}

		// Check if player is in air (double jump mechanics)
		if (
			currentHumanoidState === Enum.HumanoidStateType.Jumping ||
			currentHumanoidState === Enum.HumanoidStateType.FallingDown ||
			currentHumanoidState === Enum.HumanoidStateType.Freefall
		) {
			const negativeHeight = humanoid?.GetMoveVelocity().Y;
			const force = ForceCatalog["JumpForce"].RunForce(character.HumanoidRootPart);

			if (!force || negativeHeight === undefined) {
				return;
			}

			// Reset vertical velocity to prevent double jump exploit
			force.Force.add(new Vector3(0, -1 * negativeHeight, 0));

			// Clean up force after duration
			task.delay(ForceCatalog["JumpForce"].duration, () => {
				force.Destroy();
			});
		}
	}

	/**
	 * Get current running state
	 */
	public isRunning(): boolean {
		return this.runningState.get();
	}

	/**
	 * Update walk speed based on running state
	 */
	private updateWalkSpeed(): void {
		const humanoid = LocalPlayer.Character?.FindFirstChildOfClass("Humanoid");
		if (!humanoid) return;

		if (this.runningState.get()) {
			humanoid.WalkSpeed = 24; // Increased speed when running
		} else {
			humanoid.WalkSpeed = 16; // Default speed when not running
		}
	}

	/**
	 * Cleanup method
	 */
	public destroy(): void {
		// Note: Fusion observers are automatically cleaned up
		// when their parent scope is destroyed
	}
}
