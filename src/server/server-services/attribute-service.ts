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

export class AttributeService {
	private static instance?: AttributeService;

	// Runtime cache - loaded from persistent data
	private playerAttributes = new Map<Player, AttributesDTO>();

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
	/**
	 * Initialize the service and set up player connections
	 */
	private initializePlayerAttributes(player: Player): void {
		const attributes = this.loadAttributesFromProfile(player);
		this.playerAttributes.set(player, attributes);

		// Broadcast initial state to client
		//SendUpdate.SendToPlayer(player, attributes);
		print(`Initialized attributes for ${player.Name}:`, attributes);
	}

	private loadAttributesFromProfile(player: Player): AttributesDTO {
		const profile = DataServiceInstance.GetProfile(player);

		if (!profile) {
			warn(`No profile found for ${player.Name}, using defaults`);
			return this.getDefaultAttributes();
		}

		// Map from DataService format to AttributesDTO format
		const profileData = profile.Data;
		return {
			vitality: profileData.Attributes.vitality,
			strength: profileData.Attributes.strength,
			dexterity: profileData.Attributes.agility, // agility -> dexterity
			intelligence: profileData.Attributes.intellect, // intellect -> intelligence
			luck: profileData.Attributes.luck,
		};
	}

	private saveAttributesToProfile(player: Player, attributes: AttributesDTO): void {
		const profile = DataServiceInstance.GetProfile(player);
		if (!profile) {
			warn(`Cannot save attributes for ${player.Name}: no profile loaded`);
			return;
		}

		// Map from AttributesDTO back to DataService format
		profile.Data.Attributes.vitality = attributes.vitality;
		profile.Data.Attributes.strength = attributes.strength;
		profile.Data.Attributes.agility = attributes.dexterity; // dexterity -> agility
		profile.Data.Attributes.intellect = attributes.intelligence; // intelligence -> intellect
		profile.Data.Attributes.luck = attributes.luck;
	}

	private initializeConnections(): void {
		// Handle client fetch requests
		AttributeRemotes.Server.Get("FetchAttributes").SetCallback((player) => {
			return this.getPlayerAttributes(player) || this.getDefaultAttributes();
		});

		// Handle attribute modification
		AttributeRemotes.Server.Get("ModifyAttribute").SetCallback((player, attributeKey, amount) => {
			return this.modifyAttribute(player, attributeKey, amount);
		});

		// Listen for player joins and initialize attributes
		Players.PlayerAdded.Connect((player) => {
			AttributeServiceInstance.initializePlayerAttributes(player);

			// Clean up when player leaves
			player.AncestryChanged.Connect((_, parent) => {
				if (!parent) {
					AttributeServiceInstance.cleanupPlayer(player);
				}
			});
		});
		// Initialize existing players
		Players.GetPlayers().forEach((player) => {
			AttributeServiceInstance.initializePlayerAttributes(player);
		});
	}

	// Public API
	public getPlayerAttributes(player: Player): AttributesDTO | undefined {
		return this.playerAttributes.get(player);
	}

	public modifyAttribute(player: Player, attributeKey: AttributeKey, amount: number): boolean {
		const current = this.playerAttributes.get(player);
		if (!current) {
			warn(`No attributes loaded for player: ${player.Name}`);
			return false;
		}

		// Apply modification with bounds checking
		const newValue = math.max(0, current[attributeKey] + amount);
		current[attributeKey] = newValue;

		// Save to persistent storage
		this.saveAttributesToProfile(player, current);

		// Broadcast update to client
		//SendUpdate.SendToPlayer(player, current);

		print(`Modified ${attributeKey} for ${player.Name}: ${amount} (new value: ${newValue})`);
		return true;
	}

	private getDefaultAttributes(): AttributesDTO {
		return {
			vitality: 10,
			strength: 10,
			dexterity: 10,
			intelligence: 10,
			luck: 10,
		};
	}

	private cleanupPlayer(player: Player): void {
		this.playerAttributes.delete(player);
	}
}
export const AttributeServiceInstance = AttributeService.GetInstance();

warn("AttributeService initialized and ready to manage player attributes.");
