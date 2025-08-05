/**
 * @file src/server/services/resource-service.ts
 * @module ResourceService
 * @layer Server/Services
 * @description Server-side health, combat, and resource management service
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-07-31 - Renamed from HealthService to ResourceService
 */

import { Players } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { makeDefaultResourceDTO, ResourceDTO, ResourceRemotes } from "shared/catalogs/resources-catalog";

/**
 * Resource Service - Manages health, mana, stamina, and combat for all entities
 */

const SendResourceUpdate = ResourceRemotes.Server.Get("ResourcesUpdated");
export class ResourceService {
	private static instance?: ResourceService;

	// Entity resource tracking
	private entityResources = new Map<Player, ResourceDTO>();
	private humanoidConnections = new Map<SSEntity, RBXScriptConnection[]>();

	private constructor() {
		this.initializeConnections();
	}

	public static GetInstance(): ResourceService {
		if (!ResourceService.instance) {
			ResourceService.instance = new ResourceService();
		}
		return ResourceService.instance;
	}

	/**
	 * Initialize network connections and player events
	 */
	private initializeConnections(): void {
		// Handle new players
		Players.PlayerAdded.Connect((player) => {
			const resources = makeDefaultResourceDTO();
			this.entityResources.set(player, resources);
			SendResourceUpdate.SendToPlayer(player, resources);
		});

		// Handle player leaving
		Players.PlayerRemoving.Connect((player) => {
			this.entityResources.delete(player);
		});

		ResourceRemotes.Server.Get("FetchResources").SetCallback((player) => {
			const resources = this.entityResources.get(player) ?? makeDefaultResourceDTO();
			return resources;
		});
	}

	public GetResources(player: Player): ResourceDTO | undefined {
		return this.entityResources.get(player);
	}

	public ModifyResource(player: Player, resourceType: "health" | "mana" | "stamina", amount: number): boolean {
		const resources = this.entityResources.get(player);
		if (!resources) {
			warn(`ResourceService: No resources found for player ${player.Name}`);
			return false;
		}

		switch (resourceType) {
			case "health":
				resources.Health.current += amount;
				break;
			case "mana":
				resources.Mana.current += amount;
				break;
			case "stamina":
				resources.Stamina.current += amount;
				break;
			default:
				warn(`ResourceService: Invalid resource type ${resourceType}`);
				return false;
		}

		SendResourceUpdate.SendToPlayer(player, resources);
		return true;
	}
}

// Export singleton instance
export const ResourceServiceInstance = ResourceService.GetInstance();
