/**
 * @file src/server/services/attribute-service.ts
 * @module AttributeService
 * @layer Server/Services
 * @description Server-side attribute management with persistent data integration
 */

import { Players } from "@rbxts/services";
import { AttributesDTO } from "shared/dtos/AttributesDTO";
import { AttributeKey } from "shared/keys/attribute-keys";
import { AttributeRemotes } from "shared/network/attribute-remotes";
import { DataServiceInstance } from "server/server-services/data-service";

//const SendUpdate = AttributeRemotes.Server.Get("AttributesUpdated");
const DEFAULT_ATTRIBUTES: AttributesDTO = {
	agility: 0,
	strength: 0,
	intellect: 0,
	luck: 0,
	vitality: 0,
};

export class AttributeService {
	private static instance?: AttributeService;

	// Runtime cache - loaded from persistent data
	private playerAttributes = new Map<Player, AttributesDTO>();
	private dataService = DataServiceInstance;

	// Connections
	private updateConnection?: RBXScriptConnection;

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
			const attributes = this.playerAttributes.get(player);
			return attributes ? attributes : DEFAULT_ATTRIBUTES;
		});

		// Handle attribute modification requests
		AttributeRemotes.Server.Get("ModifyAttribute").SetCallback(
			(player: Player, attributeKey: AttributeKey, amount: number) => {
				const attributes = this.playerAttributes.get(player);
				if (attributes === undefined) {
					warn(`Player ${player.Name} has no attributes loaded.`);
					return false; // No attributes found for player
				}

				// Modify the attribute
				attributes[attributeKey] += amount;
				const newValue = attributes[attributeKey];

				// Ensure attributes do not go below zero
				if (attributes[attributeKey] < 0) {
					attributes[attributeKey] = 0;
				}

				// Update the player's attributes in persistent data
				const profile = this.dataService.GetProfile(player);
				if (profile === undefined) {
					warn(`No profile found for player ${player.Name}. Cannot update attributes.`);
					return false; // No profile found
				}
				print(
					`Updating attribute ${attributeKey} for player ${player.Name} from ${profile.Data.Attributes[attributeKey]} to ${attributes[attributeKey]}`,
				);
				profile.Data.Attributes[attributeKey] = attributes[attributeKey];

				// Notify clients of the updated attributes
				AttributeRemotes.Server.Get("AttributesUpdated").SendToPlayer(player, attributes);

				return true;
			},
		);
	}
}
export const AttributeServiceInstance = AttributeService.GetInstance();

warn("AttributeService initialized and ready to manage player attributes.");
