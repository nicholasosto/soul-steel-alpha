/**
 * @file src/client/controllers/ClientController.ts
 * @module ClientController
 * @layer Client/Controllers
 * @description Main client controller that coordinates all other controllers
 *
 * @responsibility Central coordination ONLY - no direct game logic
 * @responsibilities
 * - Initialize and manage controller lifecycle
 * - Route input actions to appropriate controllers
 * - Provide access to sub-controllers
 * - System integration and cleanup
 *
 * @anti_patterns
 * - DO NOT add game logic (abilities, movement, zones)
 * - DO NOT handle UI rendering or state management
 * - DO NOT make direct network calls
 * - DO NOT duplicate functionality from sub-controllers
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-07 - Added architectural documentation and constraints
 */

import { InputController, InputAction } from "./InputController";
import { MovementController } from "./MovementController";
import { AbilityController } from "./AbilityController";
import { ZoneController } from "./ZoneController";
import { TargetingController } from "./TargetingController";

/**
 * ClientController is the main coordinator for all client-side logic.
 * It connects input actions to appropriate game systems.
 */
export class ClientController {
	private static instance: ClientController | undefined;
	private inputController: InputController;
	private movementController: MovementController;
	private abilityController: AbilityController;
	private zoneController: ZoneController;
	private targetingController: TargetingController;

	private constructor() {
		// Initialize all controllers
		this.inputController = InputController.getInstance();
		this.movementController = MovementController.getInstance();
		this.abilityController = AbilityController.getInstance();
		this.zoneController = ZoneController.getInstance();
		this.targetingController = TargetingController.getInstance();

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
				this.abilityController.activateAbility(action.abilityKey);
				break;

			case "EFFECT_TRIGGER":
				this.abilityController.triggerEffect(action.effectKey);
				break;

			case "MOUSE_LEFT_CLICK": {
				// Try lock current hover target; still let abilities listen if needed
				this.targetingController.tryLockHoverTarget();
				this.abilityController.handleMouseClick("left");
				break;
			}

			case "MOUSE_RIGHT_CLICK": {
				this.targetingController.clearTarget("manual");
				this.abilityController.handleMouseClick("right");
				break;
			}

			case "DEBUG_KEY_PRESS":
				this.abilityController.handleDebugKey(action.keyName);
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

	public getAbilityController(): AbilityController {
		return this.abilityController;
	}

	public getZoneController(): ZoneController {
		return this.zoneController;
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
		this.abilityController.destroy();
		this.zoneController.destroy();
	}
}
