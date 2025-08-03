/**
 * @file src/server/services/attribute-service.ts
 * @module AttributeService
 * @layer Server/Services
 * @description Server-side attribute management with persistent data integration
 */

import * as RPGAttributes from "@trembus/rpg-attributes";
import { AttributeRemotes } from "shared/network/attribute-remotes";
import { DataServiceInstance } from "server/server-services/data-service";
type AttributeDTO = RPGAttributes.AttributeDTO;
type AttributeKey = RPGAttributes.AttributeKey;

export class AttributeService {
	private static instance?: AttributeService;

	// Runtime cache - loaded from persistent data
	private playerAttributes = new Map<Player, AttributeDTO>();
	private dataService = DataServiceInstance;

	private constructor() {
		this.initializeConnections();
	}

	public static GetInstance(): AttributeService {
		if (AttributeService.instance === undefined) {
			AttributeService.instance = new AttributeService();
		}
		return AttributeService.instance;
	}
	private initializeConnections() {
		// Listen for player added events to initialize attributes

		// Attribute updates from client
		AttributeRemotes.Server.Get("FetchAttributes").SetCallback((player) => {
			return this.handleAttributeFetch(player);
		});

		// Handle attribute modification requests
		AttributeRemotes.Server.Get("ModifyAttribute").SetCallback(
			(player: Player, attributeKey: AttributeKey, amount: number) => {
				return this.handleModifyAttribute(player, attributeKey, amount);
			},
		);
	}

	private handleModifyAttribute(player: Player, attributeKey: AttributeKey, amount: number): boolean {
		const currentAttributes = this.playerAttributes.get(player);
		if (!currentAttributes) {
			return false; // No attributes found for player
		}
		const attribute = currentAttributes[attributeKey];
		if (!attribute) {
			return false; // Invalid attribute key
		}
		// Modify the attribute value
		attribute.baseValue += amount;
		// Update the player's attributes in the cache
		this.playerAttributes.set(player, currentAttributes);
		// Return the updated attributes
		return true;
	}

	private makeDefaultAttributes(): AttributeDTO {
		return {
			vitality: RPGAttributes.createAttributeValues({
				baseValue: 100,
				effectBonus: 0,
				equipmentBonus: 0,
			}),
			strength: RPGAttributes.createAttributeValues({
				baseValue: 50,
				effectBonus: 0,
				equipmentBonus: 0,
			}),
			agility: RPGAttributes.createAttributeValues({
				baseValue: 30,
				effectBonus: 0,
				equipmentBonus: 0,
			}),
			intellect: RPGAttributes.createAttributeValues({
				baseValue: 20,
				effectBonus: 0,
				equipmentBonus: 0,
			}),
			luck: RPGAttributes.createAttributeValues({
				baseValue: 10,
				effectBonus: 0,
				equipmentBonus: 0,
			}),
		};
	}
	private handleAttributeFetch(player: Player): AttributeDTO {
		return this.playerAttributes.get(player) || this.makeDefaultAttributes();
	}
}
export const AttributeServiceInstance = AttributeService.GetInstance();

warn("AttributeService initialized and ready to manage player attributes.");
