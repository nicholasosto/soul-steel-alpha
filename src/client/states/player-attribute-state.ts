/**
 * @file src/client/states/PlayerAttributeSlice.ts
 * @module PlayerAttributeSlice
 * @layer Client/States
 * @description DTO-based attribute state slice for managing player attributes
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Initial DTO-based attribute slice implementation
 */

import { AttributesDTO, AttributeKey, AttributeRemotes } from "shared";
import { Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";

/**
 * PlayerAttributeSlice manages a player's attributes via server fetch and real-time updates.
 * - fetch() retrieves the current AttributeDTO from the server
 * - _onUpdate is invoked when the server fires "AttributesUpdated" to push changes
 * - Provides reactive change notifications for UI components
 */

export type AttributesState = {
	[key in AttributeKey]: Value<number>;
};

export class PlayerAttributeSlice {
	/** Latest attribute values */
	public AttributesState: AttributesState = {
		vitality: Value(1),
		strength: Value(1),
		agility: Value(1),
		intellect: Value(1),
		luck: Value(1),
	};

	private updateConnection: RBXScriptConnection;

	constructor() {
		// Listen for server-pushed attribute updates
		const updateEvent = AttributeRemotes.Client.Get("AttributesUpdated");
		this.updateConnection = updateEvent.Connect((dto: AttributesDTO) => {
			print("Received attribute update from server:", dto);
			this._onUpdate(dto);
		});
	}

	/**
	 * Fetch attributes from the server via RemoteFunction.
	 * @returns The fetched AttributeDTO
	 */
	public async fetch(): Promise<AttributesDTO> {
		const fetchFunc = AttributeRemotes.Client.Get("FetchAttributes");
		const dto = await fetchFunc.CallServerAsync();
		this._onUpdate(dto);
		return dto;
	}

	/**
	 * Internal handler for applying attribute updates.
	 * @param attributeDTO New attribute values
	 */
	protected _onUpdate(attributeDTO: AttributesDTO): void {
		this._dtoToAttributesState(attributeDTO);
	}

	/**
	 * Internal handler for attribute change notifications.
	 * @param attributesDTO Attribute change notification
	 */
	protected _dtoToAttributesState(attributesDTO: AttributesDTO): void {
		for (const [key, value] of pairs(attributesDTO)) {
			if (this.AttributesState[key as AttributeKey]) {
				this.AttributesState[key as AttributeKey].set(value);
			} else {
				warn(`Unknown attribute key: ${key}`);
			}
		}
		print("Updated attributes state:", this.AttributesState);
	}

	/**
	 * Disconnects all update listeners.
	 */
	public destroy(): void {
		this.updateConnection.Disconnect();
	}
}
