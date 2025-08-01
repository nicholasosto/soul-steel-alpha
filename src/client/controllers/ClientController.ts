/**
 * @file src/client/controllers/ClientController.ts
 * @module ClientController
 * @layer Client/Controllers
 * @description Main client controller that coordinates all other controllers
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Created to replace scattered client initialization
 */

import { InputController, InputAction } from "./InputController";
import { MovementController } from "./MovementController";
import { GameActionController } from "./GameActionController";

/**
 * ClientController is the main coordinator for all client-side logic.
 * It connects input actions to appropriate game systems.
 */
export class ClientController {
	private static instance: ClientController | undefined;
	private inputController: InputController;
	private movementController: MovementController;
	private gameActionController: GameActionController;

	private constructor() {
		// Initialize all controllers
		this.inputController = InputController.getInstance();
		this.movementController = MovementController.getInstance();
		this.gameActionController = GameActionController.getInstance();

		// Set up action handling
		this.inputController.onAction((action: InputAction) => {
			this.handleInputAction(action);
		});
	}

	/**
	 * Gets the singleton instance of the ClientController
	 */
	public static getInstance(): ClientController {
		if (!this.instance) {
			this.instance = new ClientController();
		}
		return this.instance;
	}

	/**
	 * Handle input actions and route them to appropriate controllers
	 */
	private handleInputAction(action: InputAction): void {
		switch (action.type) {
			case "MOVEMENT_START_RUNNING":
				this.movementController.startRunning();
				break;

			case "MOVEMENT_STOP_RUNNING":
				this.movementController.stopRunning();
				break;

			case "MOVEMENT_JUMP":
				this.movementController.jump();
				break;

			case "ABILITY_ACTIVATE":
				this.gameActionController.activateAbility(action.abilityKey);
				break;

			case "EFFECT_TRIGGER":
				this.gameActionController.triggerEffect(action.effectKey);
				break;

			case "MOUSE_LEFT_CLICK":
				this.gameActionController.handleMouseClick("left");
				break;

			case "MOUSE_RIGHT_CLICK":
				this.gameActionController.handleMouseClick("right");
				break;

			case "DEBUG_KEY_PRESS":
				this.gameActionController.handleDebugKey(action.keyName);
				break;

			default:
				warn(`Unknown input action: ${action}`);
		}
	}

	/**
	 * Get access to individual controllers if needed
	 */
	public getMovementController(): MovementController {
		return this.movementController;
	}

	public getGameActionController(): GameActionController {
		return this.gameActionController;
	}

	public getInputController(): InputController {
		return this.inputController;
	}

	/**
	 * Initialize the client controller (call this from main.client.ts)
	 */
	public static initialize(): ClientController {
		const controller = ClientController.getInstance();
		print("ClientController initialized");
		return controller;
	}

	/**
	 * Cleanup method
	 */
	public destroy(): void {
		this.inputController.destroy();
		this.movementController.destroy();
		// gameActionController doesn't need cleanup
	}
}
