/**
 * @file src/client/states/PlayerResourceSlice.ts
 * @module PlayerResourceSlice
 * @layer Client/States
 * @description DTO-based resource state slice for managing player resources
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Initial DTO-based resource slice implementation
 */

import type { ResourceDTO, ResourceChangeDTO, HealthChangeDTO } from "shared/dtos/ResourceDTO";
import { ResourceDTORemotes } from "shared/network/resource-dto-remotes";

/**
 * PlayerResourceSlice manages a player's resources via server fetch and real-time updates.
 * - fetch() retrieves the current ResourceDTO from the server
 * - _onUpdate is invoked when the server fires "ResourcesUpdated" to push changes
 * - Provides reactive change notifications for UI components
 */
export class PlayerResourceSlice {
	/** Latest resource values */
	public Resources: ResourceDTO;

	/** Last health change notification for UI effects */
	public LastHealthChange?: HealthChangeDTO;

	/** Last resource change notification for UI effects */
	public LastResourceChange?: ResourceChangeDTO;

	private updateConnection: RBXScriptConnection;
	private healthChangeConnection: RBXScriptConnection;
	private resourceChangeConnection: RBXScriptConnection;

	constructor() {
		// Initialize with default DTO
		this.Resources = {
			health: 100,
			maxHealth: 100,
			mana: 50,
			maxMana: 50,
			stamina: 100,
			maxStamina: 100,
			timestamp: tick(),
		};

		// Listen for server-pushed resource updates
		const updateEvent = ResourceDTORemotes.Client.Get("ResourcesUpdated");
		this.updateConnection = updateEvent.Connect((dto: ResourceDTO) => {
			this._onUpdate(dto);
		});

		// Listen for health change notifications
		const healthChangeEvent = ResourceDTORemotes.Client.Get("HealthChanged");
		this.healthChangeConnection = healthChangeEvent.Connect((dto: HealthChangeDTO) => {
			this._onHealthChange(dto);
		});

		// Listen for resource change notifications
		const resourceChangeEvent = ResourceDTORemotes.Client.Get("ResourceChanged");
		this.resourceChangeConnection = resourceChangeEvent.Connect((dto: ResourceChangeDTO) => {
			this._onResourceChange(dto);
		});
	}

	/**
	 * Fetch resources from the server via RemoteFunction.
	 * @returns The fetched ResourceDTO
	 */
	public async fetch(): Promise<ResourceDTO> {
		const fetchFunc = ResourceDTORemotes.Client.Get("FetchResources");
		const dto = await fetchFunc.CallServerAsync();
		this._onUpdate(dto);
		return dto;
	}

	/**
	 * Request a resource modification from the server
	 * @param resourceType Type of resource to modify
	 * @param amount Amount to change (positive or negative)
	 * @returns Whether the modification was successful
	 */
	public async modifyResource(resourceType: "health" | "mana" | "stamina", amount: number): Promise<boolean> {
		const modifyFunc = ResourceDTORemotes.Client.Get("ModifyResource");
		return await modifyFunc.CallServerAsync(resourceType, amount);
	}

	/**
	 * Get current health percentage (0-1)
	 */
	public getHealthPercentage(): number {
		return this.Resources.maxHealth > 0 ? this.Resources.health / this.Resources.maxHealth : 0;
	}

	/**
	 * Get current mana percentage (0-1)
	 */
	public getManaPercentage(): number {
		return this.Resources.maxMana > 0 ? this.Resources.mana / this.Resources.maxMana : 0;
	}

	/**
	 * Get current stamina percentage (0-1)
	 */
	public getStaminaPercentage(): number {
		return this.Resources.maxStamina > 0 ? this.Resources.stamina / this.Resources.maxStamina : 0;
	}

	/**
	 * Check if player has enough resources for an action
	 * @param manaCost Mana cost required
	 * @param staminaCost Stamina cost required
	 * @returns Whether player has enough resources
	 */
	public hasEnoughResources(manaCost: number, staminaCost: number = 0): boolean {
		return this.Resources.mana >= manaCost && this.Resources.stamina >= staminaCost;
	}

	/**
	 * Check if player has enough of a specific resource
	 * @param resourceType Type of resource to check
	 * @param amount Amount required
	 * @returns Whether player has enough of the resource
	 */
	public hasEnoughResource(resourceType: "health" | "mana" | "stamina", amount: number): boolean {
		const currentValue = this.Resources[resourceType];
		return currentValue >= amount;
	}

	/**
	 * Internal handler for applying resource updates.
	 * @param resourceDTO New resource values
	 */
	protected _onUpdate(resourceDTO: ResourceDTO): void {
		this.Resources = resourceDTO;
	}

	/**
	 * Internal handler for health change notifications.
	 * @param healthChangeDTO Health change notification
	 */
	protected _onHealthChange(healthChangeDTO: HealthChangeDTO): void {
		this.LastHealthChange = healthChangeDTO;

		// Update resource DTO with new health value
		this.Resources = {
			...this.Resources,
			health: healthChangeDTO.newHealth,
			timestamp: healthChangeDTO.timestamp,
		};
	}

	/**
	 * Internal handler for resource change notifications.
	 * @param resourceChangeDTO Resource change notification
	 */
	protected _onResourceChange(resourceChangeDTO: ResourceChangeDTO): void {
		this.LastResourceChange = resourceChangeDTO;

		// Update resource DTO with new value
		this.Resources = {
			...this.Resources,
			[resourceChangeDTO.resourceType]: resourceChangeDTO.newValue,
			timestamp: resourceChangeDTO.timestamp,
		};
	}

	/**
	 * Disconnects all update listeners.
	 */
	public destroy(): void {
		this.updateConnection.Disconnect();
		this.healthChangeConnection.Disconnect();
		this.resourceChangeConnection.Disconnect();
	}
}

/**
 * Example usage:
 *
 * const resourceSlice = new PlayerResourceSlice();
 * await resourceSlice.fetch();                    // load initial resources
 * print(resourceSlice.Resources.health);          // access current health
 *
 * // Check resources before using ability
 * if (resourceSlice.hasEnoughResources(25, 10)) {
 *     // Use ability that costs 25 mana and 10 stamina
 * }
 *
 * // ResourcesUpdated, HealthChanged, ResourceChanged events will auto-apply
 *
 * // Cleanup when done
 * resourceSlice.destroy();
 */
