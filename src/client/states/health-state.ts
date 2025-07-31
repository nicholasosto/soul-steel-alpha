/**
 * @file src/client/states/health-state.ts
 * @module HealthState
 * @layer Client/States
 * @description Client-side health state management using Fusion reactive programming
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-07-31 - Initial health system implementation
 */

import Fusion, { Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { PlayerResources, HealthChangeEvent, ResourceChangeEvent } from "shared/types/health-types";
import { HealthRemotes } from "shared/network/health-remotes";

/**
 * Client-side health state manager using Fusion reactive values
 */
export class HealthState {
	private static instance?: HealthState;

	// Reactive state values
	public readonly playerResources = Value<PlayerResources>({
		health: 100,
		maxHealth: 100,
		mana: 50,
		maxMana: 50,
		stamina: 100,
		maxStamina: 100,
	});

	// Health change notifications for UI effects
	public readonly lastHealthChange = Value<HealthChangeEvent | undefined>(undefined);
	public readonly lastResourceChange = Value<ResourceChangeEvent | undefined>(undefined);

	// Connection tracking
	private connections: RBXScriptConnection[] = [];

	private constructor() {
		this.initializeConnections();
		this.requestInitialData();
	}

	public static GetInstance(): HealthState {
		if (!HealthState.instance) {
			HealthState.instance = new HealthState();
		}
		return HealthState.instance;
	}

	/**
	 * Initialize network connections for health events
	 */
	private initializeConnections(): void {
		const player = Players.LocalPlayer;

		// Listen for health changes
		const healthChangedConnection = HealthRemotes.Client.Get("HealthChanged").Connect((healthEvent) => {
			// Only update if it's our character
			if (healthEvent.entity === player.Character) {
				this.updateResourcesFromHealthEvent(healthEvent);
				this.lastHealthChange.set(healthEvent);
			}
		});

		// Listen for resource changes
		const resourceChangedConnection = HealthRemotes.Client.Get("ResourceChanged").Connect((resourceEvent) => {
			// Only update if it's our character
			if (resourceEvent.entity === player.Character) {
				this.updateResourcesFromResourceEvent(resourceEvent);
				this.lastResourceChange.set(resourceEvent);
			}
		});

		// Listen for character respawn
		const characterAddedConnection = player.CharacterAdded.Connect(() => {
			// Reset to defaults and request fresh data
			this.resetToDefaults();
			task.wait(1); // Wait for server to initialize
			this.requestInitialData();
		});

		this.connections.push(healthChangedConnection, resourceChangedConnection, characterAddedConnection);
	}

	/**
	 * Request initial health data from server
	 */
	private async requestInitialData(): Promise<void> {
		const player = Players.LocalPlayer;

		try {
			const resources = await HealthRemotes.Client.Get("GetPlayerResources").CallServerAsync(
				tostring(player.UserId),
			);
			if (resources) {
				this.playerResources.set(resources);
			}
		} catch (error) {
			warn("Failed to get initial health data:", error);
		}
	}

	/**
	 * Update resources based on health change event
	 */
	private updateResourcesFromHealthEvent(event: HealthChangeEvent): void {
		const currentResources = this.playerResources.get();

		// Create updated resources
		const updatedResources: PlayerResources = {
			...currentResources,
			health: event.newHealth,
		};

		this.playerResources.set(updatedResources);
	}

	/**
	 * Update resources based on resource change event
	 */
	private updateResourcesFromResourceEvent(event: ResourceChangeEvent): void {
		const currentResources = this.playerResources.get();

		// Create updated resources
		const updatedResources: PlayerResources = {
			...currentResources,
			[event.resourceType]: event.newValue,
		};

		this.playerResources.set(updatedResources);
	}

	/**
	 * Reset resources to default values (used on respawn)
	 */
	private resetToDefaults(): void {
		this.playerResources.set({
			health: 100,
			maxHealth: 100,
			mana: 50,
			maxMana: 50,
			stamina: 100,
			maxStamina: 100,
		});

		this.lastHealthChange.set(undefined);
		this.lastResourceChange.set(undefined);
	}

	/**
	 * Get current player resources (non-reactive)
	 */
	public getCurrentResources(): PlayerResources {
		return this.playerResources.get();
	}

	/**
	 * Check if player has enough resources for an ability
	 */
	public hasEnoughResources(manaCost: number, staminaCost: number = 0): boolean {
		const resources = this.getCurrentResources();
		return resources.mana >= manaCost && resources.stamina >= staminaCost;
	}

	/**
	 * Get current health percentage (0-1)
	 */
	public getHealthPercentage(): number {
		const resources = this.getCurrentResources();
		return resources.maxHealth > 0 ? resources.health / resources.maxHealth : 0;
	}

	/**
	 * Get current mana percentage (0-1)
	 */
	public getManaPercentage(): number {
		const resources = this.getCurrentResources();
		return resources.maxMana > 0 ? resources.mana / resources.maxMana : 0;
	}

	/**
	 * Get current stamina percentage (0-1)
	 */
	public getStaminaPercentage(): number {
		const resources = this.getCurrentResources();
		return resources.maxStamina > 0 ? resources.stamina / resources.maxStamina : 0;
	}

	/**
	 * Cleanup connections
	 */
	public destroy(): void {
		for (const connection of this.connections) {
			connection.Disconnect();
		}
		this.connections = [];
	}
}

// Export singleton instance
export const HealthStateInstance = HealthState.GetInstance();
