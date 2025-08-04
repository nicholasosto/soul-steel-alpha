/**
 * @file src/client/controllers/InputController.ts
 * @module InputController
 * @layer Client/Controllers
 * @description Pure input handling controller that maps inputs to actions
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Extracted from input.client.ts for better separation of concerns
 */

import { UserInputService } from "@rbxts/services";
import { AbilityKey } from "shared";
import { VFXKey } from "shared/packages";

export type InputAction =
	| { type: "ABILITY_ACTIVATE"; abilityKey: AbilityKey }
	| { type: "EFFECT_TRIGGER"; effectKey: VFXKey }
	| { type: "MOVEMENT_START_RUNNING" }
	| { type: "MOVEMENT_STOP_RUNNING" }
	| { type: "MOVEMENT_JUMP" }
	| { type: "MOUSE_LEFT_CLICK" }
	| { type: "MOUSE_RIGHT_CLICK" }
	| { type: "DEBUG_KEY_PRESS"; keyName: string };

export type InputActionHandler = (action: InputAction) => void;

/**
 * InputController handles raw input mapping to semantic actions.
 * It doesn't know about game logic - it just translates inputs to action objects.
 */
export class InputController {
	private static instance: InputController | undefined;
	private actionHandlers: Set<InputActionHandler> = new Set();

	private constructor() {
		this.setupInputHandlers();
	}

	/**
	 * Gets the singleton instance of the InputController
	 */
	public static getInstance(): InputController {
		if (!this.instance) {
			this.instance = new InputController();
		}
		return this.instance;
	}

	/**
	 * Subscribe to input actions
	 */
	public onAction(handler: InputActionHandler): void {
		this.actionHandlers.add(handler);
	}

	/**
	 * Unsubscribe from input actions
	 */
	public offAction(handler: InputActionHandler): void {
		this.actionHandlers.delete(handler);
	}

	/**
	 * Emit an action to all handlers
	 */
	private emitAction(action: InputAction): void {
		for (const handler of this.actionHandlers) {
			handler(action);
		}
	}

	/**
	 * Setup input event handlers
	 */
	private setupInputHandlers(): void {
		// Keyboard input began
		UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent) return;

			if (input.UserInputType === Enum.UserInputType.Keyboard) {
				this.handleKeyboardInput(input.KeyCode, true);
			} else if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				this.emitAction({ type: "MOUSE_LEFT_CLICK" });
			} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
				this.emitAction({ type: "MOUSE_RIGHT_CLICK" });
			}
		});

		// Keyboard input ended
		UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
			if (gameProcessedEvent) return;

			if (input.UserInputType === Enum.UserInputType.Keyboard) {
				this.handleKeyboardInput(input.KeyCode, false);
			}
		});

		// Jump request
		UserInputService.JumpRequest.Connect(() => {
			this.emitAction({ type: "MOVEMENT_JUMP" });
		});
	}

	/**
	 * Handle keyboard input with configurable key mappings
	 */
	private handleKeyboardInput(keyCode: Enum.KeyCode, isPressed: boolean): void {
		if (isPressed) {
			// Key press actions
			switch (keyCode) {
				case Enum.KeyCode.LeftShift:
					this.emitAction({ type: "MOVEMENT_START_RUNNING" });
					break;
				case Enum.KeyCode.Q:
					this.emitAction({ type: "ABILITY_ACTIVATE", abilityKey: "Melee" });
					break;
				case Enum.KeyCode.E:
					this.emitAction({ type: "ABILITY_ACTIVATE", abilityKey: "Ice-Rain" });
					break;
				case Enum.KeyCode.R:
					this.emitAction({ type: "ABILITY_ACTIVATE", abilityKey: "Earthquake" });
					break;
				case Enum.KeyCode.KeypadOne:
					this.emitAction({ type: "EFFECT_TRIGGER", effectKey: "Animal_Cast" });
					break;
				case Enum.KeyCode.KeypadTwo:
					this.emitAction({ type: "EFFECT_TRIGGER", effectKey: "Frost_Cast" });
					break;
				case Enum.KeyCode.KeypadThree:
					this.emitAction({ type: "EFFECT_TRIGGER", effectKey: "Shadow_Cast" });
					break;
				case Enum.KeyCode.KeypadFour:
					this.emitAction({ type: "EFFECT_TRIGGER", effectKey: "Void_Cast" });
					break;
				case Enum.KeyCode.KeypadFive:
					this.emitAction({ type: "EFFECT_TRIGGER", effectKey: "Shrine_Cast" });
					break;
				default:
					this.emitAction({ type: "DEBUG_KEY_PRESS", keyName: keyCode.Name });
			}
		} else {
			// Key release actions
			switch (keyCode) {
				case Enum.KeyCode.LeftShift:
					this.emitAction({ type: "MOVEMENT_STOP_RUNNING" });
					break;
			}
		}
	}

	/**
	 * Cleanup method
	 */
	public destroy(): void {
		this.actionHandlers.clear();
		// Note: UserInputService connections are automatically cleaned up
	}
}
