/**
 * @file src/client/client-ui/organisms/panels/CharacterPanelIntegration.ts
 * @module CharacterPanelIntegration
 * @layer Client/UI/Integration
 * @description Example integration of CharacterPanel with keybinds and main UI
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-09 - Created integration example
 */

import { Players, UserInputService } from "@rbxts/services";
import { Value } from "@rbxts/fusion";
import { CharacterPanel } from "./CharacterPanel";

/**
 * Character Panel Integration Manager
 * Handles keybinds and UI state for the character panel
 */
export class CharacterPanelManager {
	private characterPanelVisible = Value(false);
	private characterPanel: Frame;
	private screenGui: ScreenGui;

	constructor() {
		// Create ScreenGui
		this.screenGui = new Instance("ScreenGui");
		this.screenGui.Name = "CharacterPanelUI";
		this.screenGui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
		this.screenGui.ResetOnSpawn = false;
		this.screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

		// Create Character Panel
		this.characterPanel = CharacterPanel({
			visible: this.characterPanelVisible,
			onClose: () => {
				this.hideCharacterPanel();
			},
		});

		// Parent the panel to the ScreenGui
		this.characterPanel.Parent = this.screenGui;

		// Setup keybinds
		this.setupKeybinds();
	}

	/**
	 * Setup keyboard shortcuts for the character panel
	 */
	private setupKeybinds(): void {
		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			// 'C' key to toggle character panel
			if (input.KeyCode === Enum.KeyCode.C) {
				this.toggleCharacterPanel();
			}

			// ESC key to close character panel if open
			if (input.KeyCode === Enum.KeyCode.Escape && this.characterPanelVisible.get()) {
				this.hideCharacterPanel();
			}
		});
	}

	/**
	 * Show the character panel
	 */
	public showCharacterPanel(): void {
		this.characterPanelVisible.set(true);
		print("Character panel opened");
	}

	/**
	 * Hide the character panel
	 */
	public hideCharacterPanel(): void {
		this.characterPanelVisible.set(false);
		print("Character panel closed");
	}

	/**
	 * Toggle the character panel visibility
	 */
	public toggleCharacterPanel(): void {
		const isVisible = this.characterPanelVisible.get();
		this.characterPanelVisible.set(!isVisible);
		print(`Character panel ${!isVisible ? "opened" : "closed"}`);
	}

	/**
	 * Check if the character panel is currently visible
	 */
	public isPanelVisible(): boolean {
		return this.characterPanelVisible.get();
	}

	/**
	 * Cleanup the character panel manager
	 */
	public destroy(): void {
		this.screenGui.Destroy();
	}
}

// Create a singleton instance for easy access
export const CharacterPanelManagerInstance = new CharacterPanelManager();
