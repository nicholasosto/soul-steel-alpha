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

import type { ResourceDTO } from "shared/dtos";
import { ResourceDTORemotes } from "shared/network/resource-dto-remotes";
import { Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
/**
 * PlayerResourceSlice manages a player's resources via server fetch and real-time updates.
 * - fetch() retrieves the current ResourceDTO from the server
 * - _onUpdate is invoked when the server fires "ResourcesUpdated" to push changes
 * - Provides reactive change notifications for UI components
 */

export type ResourcesState = {
	Health: {
		current: Value<number>;
		max: Value<number>;
	};
	Mana: {
		current: Value<number>;
		max: Value<number>;
	};
	Stamina: {
		current: Value<number>;
		max: Value<number>;
	};
};
export class PlayerResourceSlice {
	/** Latest resource values */
	public ResourcesState = {
		Health: {
			current: Value(1),
			max: Value(5),
		},
		Mana: {
			current: Value(1),
			max: Value(5),
		},
		Stamina: {
			current: Value(100),
			max: Value(100),
		},
	};

	private updateConnection: RBXScriptConnection;
	private humanoidHealthChanged?: RBXScriptConnection;
	private characterCreatedConnection?: RBXScriptConnection;

	constructor() {
		// Listen for server-pushed resource updates
		const updateEvent = ResourceDTORemotes.Client.Get("ResourcesUpdated");
		this.updateConnection = updateEvent.Connect((dto: ResourceDTO) => {
			print("Received resource update from server:", dto);
			this._onUpdate(dto);
		});
		// Character creation handling
		this.characterCreatedConnection?.Disconnect(); // Disconnect previous connection if exists
		this.characterCreatedConnection = Players.LocalPlayer.CharacterAdded.Connect((character) => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			if (humanoid === undefined) {
				warn("Humanoid not found in character, cannot track health changes");
				return;
			}
			this.ResourcesState.Health.current.set(humanoid.Health);
			this.ResourcesState.Health.max.set(humanoid.MaxHealth);
			this.humanoidHealthChanged?.Disconnect(); // Disconnect previous connection if exists
			this.humanoidHealthChanged = humanoid.HealthChanged.Connect((newHealth: number) => {
				this.ResourcesState.Health.current.set(newHealth);
			});
		});
	}

	/**
	 * Fetch resources from the server via RemoteFunction.
	 * @returns The fetched ResourceDTO
	 */
	public async fetch(): Promise<ResourceDTO> {
		warn("Fetching resources from server...");
		const fetchFunc = ResourceDTORemotes.Client.Get("FetchResources");
		const dto = await fetchFunc.CallServerAsync();
		this._onUpdate(dto);
		warn("Fetched resources:", dto);
		return dto;
	}

	/**
	 * Internal handler for applying resource updates.
	 * @param resourceDTO New resource values
	 */
	protected _onUpdate(resourceDTO: ResourceDTO): void {
		warn("Applying resource update:", resourceDTO);
		this._dtoToResourcesState(resourceDTO);
	}

	/**
	 * Internal handler for resource change notifications.
	 * @param resourcesDTO Resource change notification
	 */
	protected _dtoToResourcesState(resourcesDTO: ResourceDTO): void {
		this.ResourcesState.Health.current.set(resourcesDTO.health);
		this.ResourcesState.Health.max.set(resourcesDTO.maxHealth);
		this.ResourcesState.Mana.current.set(resourcesDTO.mana);
		this.ResourcesState.Mana.max.set(resourcesDTO.maxMana);
		this.ResourcesState.Stamina.current.set(resourcesDTO.stamina);
		this.ResourcesState.Stamina.max.set(resourcesDTO.maxStamina);
	}

	/**
	 * Disconnects all update listeners.
	 */
	public destroy(): void {
		this.updateConnection.Disconnect();
	}
}
