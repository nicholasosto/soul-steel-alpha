/**
 * @file src/client/controllers/InputController.ts
 * @module InputController
 * @layer Client/Controllers
 * @description Pure input handling controller that maps inputs to actions
 *
 * @responsibility Raw input mapping ONLY - no game logic
 * @responsibilities
 * - Map keyboard/mouse inputs to semantic actions
 * - Handle input validation and filtering
 * - Emit actions to registered handlers
 * - Manage configurable key mappings
 *
 * @anti_patterns
 * - DO NOT add game logic (cooldown checks, ability validation)
 * - DO NOT make network calls directly
 * - DO NOT manage game state (health, mana, etc.)
 * - DO NOT handle UI updates or rendering
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-07 - Added architectural documentation and constraints
 */

import { UserInputService } from "@rbxts/services";
import { AbilityKey } from "shared";
import { ControlsRemotes } from "shared/network";
import { makeDefaultHotkeyBindings } from "shared/types/player-data";
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
	// Local key → ability mapping loaded from server, with defaults
	private abilityBindings: Map<string, AbilityKey> = new Map();

	private constructor() {
		this.loadBindingsFromServer();
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
				default: {
					// Ability hotkeys by dynamic binding
					const mapped = this.abilityBindings.get(keyCode.Name);
					if (mapped !== undefined) {
						this.emitAction({ type: "ABILITY_ACTIVATE", abilityKey: mapped });
						break;
					}
					// Example effect triggers kept as-is
					switch (keyCode) {
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
				}
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

	/** Load bindings from server and fall back to defaults */
	private loadBindingsFromServer(): void {
		const defaults = makeDefaultHotkeyBindings();
		for (const [key, ability] of pairs(defaults.abilities)) {
			if (ability !== undefined) this.abilityBindings.set(key, ability);
		}
		const Load = ControlsRemotes.Client.Get("HOTKEY_LOAD");
		Load.CallServerAsync()
			.then((payload) => {
				if (payload === undefined) return;
				// Replace current map with sanitized server payload
				this.abilityBindings.clear();
				for (const [key, ability] of pairs(payload.abilities)) {
					if (ability !== undefined) this.abilityBindings.set(key, ability);
				}
			})
			.catch((err) => warn("HOTKEY_LOAD failed:", err));
	}

	/** Public setter to update a binding locally and push to server */
	public setAbilityBinding(keyName: string, abilityKey: AbilityKey): void {
		this.abilityBindings.set(keyName, abilityKey);
		const Save = ControlsRemotes.Client.Get("HOTKEY_SAVE");
		const payload = { abilities: {} as Record<string, AbilityKey> };
		for (const [k, v] of this.abilityBindings) payload.abilities[k] = v;
		Save.CallServerAsync(payload).catch((err) => warn("HOTKEY_SAVE failed:", err));
	}

	/**
	 * Cleanup method
	 */
	public destroy(): void {
		this.actionHandlers.clear();
		// Note: UserInputService connections are automatically cleaned up
	}
}
