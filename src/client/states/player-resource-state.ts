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

import {
	makeDefaultResourceState,
	ResourceStateMap,
	ResourceDTO,
	makeDefaultResourceStateFromDTO,
	ResourceRemotes,
} from "shared/catalogs/resources-catalog";

import { Players } from "@rbxts/services";
import { Value } from "@rbxts/fusion";
/**
 * PlayerResourceSlice manages a player's resources via server fetch and real-time updates.
 * - fetch() retrieves the current ResourceDTO from the server
 * - _onUpdate is invoked when the server fires "ResourcesUpdated" to push changes
 * - Provides reactive change notifications for UI components
 */

export class PlayerResourceSlice {
	/** Latest resource values */
	public PlayerResources: ResourceStateMap = makeDefaultResourceState();
	public ReadyState: Value<"NO_DATA" | "LOADING" | "READY_PlayerData" | "READY_DefaultData"> = Value("NO_DATA"); // Initial state before data is fetched

	private updateConnection: RBXScriptConnection;
	private humanoidHealthChanged?: RBXScriptConnection;
	private characterCreatedConnection?: RBXScriptConnection;

	constructor() {
		// Listen for server-pushed resource updates
		const updateEvent = ResourceRemotes.Client.Get("ResourcesUpdated");
		this.updateConnection = updateEvent.Connect((dto: ResourceDTO) => {
			print("Received resource update from server:", dto);
			this._onUpdate(dto);
		});
		task.spawn(() => {
			// ResourceRemotes.Client.Get("FetchResources")
			// 	.CallServerAsync()
			// 	.andThen((dto: ResourceDTO) => {
			// 		print("Fetched initial resources from server:", dto);
					
			// 		this._onUpdate(dto);
			// 		this.ReadyState.set("READY_PlayerData");
			// 	})
			// 	.catch((err) => {
			// 		warn("Failed to fetch resources from server:", err);
			// 		this.ReadyState.set("READY_DefaultData");
			// 	});
		});
		// Character creation handling
		this.characterCreatedConnection?.Disconnect(); // Disconnect previous connection if exists
		this.characterCreatedConnection = Players.LocalPlayer.CharacterAdded.Connect((character) => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid;
			if (humanoid === undefined) {
				warn("Humanoid not found in character, cannot track health changes");
				return;
			}
			this.PlayerResources.Health.current.set(humanoid.Health);
			this.PlayerResources.Health.max.set(humanoid.MaxHealth);
			this.humanoidHealthChanged?.Disconnect(); // Disconnect previous connection if exists
			this.humanoidHealthChanged = humanoid.HealthChanged.Connect((newHealth: number) => {
				this.PlayerResources.Health.current.set(newHealth);
			});
		});
	}

	/**
	 * Internal handler for applying resource updates.
	 * @param resourceDTO New resource values
	 */
	protected _onUpdate(resourceDTO: ResourceDTO): void {
		this.PlayerResources = makeDefaultResourceStateFromDTO(resourceDTO);
	}
	/**
	 * Disconnects all update listeners.
	 */
	public destroy(): void {
		this.updateConnection.Disconnect();
	}
}
