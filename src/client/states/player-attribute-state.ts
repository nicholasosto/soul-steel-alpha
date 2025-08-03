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

import { AttributeDTO, AttributeKey } from "@trembus/rpg-attributes";
import { Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { AttributeRemotes } from "shared";

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
		this.updateConnection = updateEvent.Connect((dto: AttributeDTO) => {
			print("Received attribute update from server:", dto);
			this._onUpdate(dto);
		});
	}

	/**
	 * Fetch attributes from the server via RemoteFunction.
	 * @returns The fetched AttributeDTO
	 */
	public async fetch(): Promise<AttributeDTO> {
		const fetchFunc = AttributeRemotes.Client.Get("FetchAttributes");
		const dto = await fetchFunc.CallServerAsync();
		this._onUpdate(dto);
		return dto;
	}

	/**
	 * Internal handler for applying attribute updates.
	 * @param attributeDTO New attribute values
	 */
	protected _onUpdate(attributeDTO: AttributeDTO): void {
		this._dtoToAttributesState(attributeDTO);
	}

	/**
	 * Internal handler for attribute change notifications.
	 * @param attributeDTO Attribute change notification
	 */
	protected _dtoToAttributesState(attributeDTO: AttributeDTO): void {
		for (const [key, value] of pairs(attributeDTO)) {
			const totalValue = value.baseValue + value.equipmentBonus + value.effectBonus;
			this.AttributesState[key as AttributeKey].set(totalValue);
			print(`Updated ${key} to ${totalValue}`);
		}
	}

	/**
	 * Disconnects all update listeners.
	 */
	public destroy(): void {
		this.updateConnection.Disconnect();
	}
}
