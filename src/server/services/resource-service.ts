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
import { DataServiceInstance } from "./data-service";

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
			print(`ResourceService: Player added - ${player.Name}`);
			const profile = DataServiceInstance.GetProfile(player); // Ensure profile is loaded
			print(`ResourceService: Called DataService for player ${player.Name}`, profile);

			const resources = makeDefaultResourceDTO();
			this.entityResources.set(player, resources);
			SendResourceUpdate.SendToPlayer(player, resources);

			/* Character added connection */
			player.CharacterAdded.Connect((character) => {
				print(`ResourceService: Character added for player ${player.Name}`);
				const humanoid = character.FindFirstChildOfClass("Humanoid");
				if (humanoid) {
					const connections: RBXScriptConnection[] = [];
					connections.push(
						humanoid.HealthChanged.Connect((newHealth) => {
							print(`ResourceService: Health changed for ${player.Name} to ${newHealth}`);
							this.ModifyResource(player, "health", newHealth);
						}),
					);
					this.humanoidConnections.set(character as SSEntity, connections);
				} else {
					warn(`ResourceService: No Humanoid found for character of player ${player.Name}`);
				}
			});
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

		// Get the specific resource and apply change
		if (resourceType === "health") {
			const resource = resources.Health;
			const newValue = resource.current + amount;
			resource.current = math.max(0, math.min(newValue, resource.max));
		} else if (resourceType === "mana") {
			const resource = resources.Mana;
			const newValue = resource.current + amount;
			resource.current = math.max(0, math.min(newValue, resource.max));
		} else if (resourceType === "stamina") {
			const resource = resources.Stamina;
			const newValue = resource.current + amount;
			resource.current = math.max(0, math.min(newValue, resource.max));
		} else {
			warn(`ResourceService: Invalid resource type ${resourceType}`);
			return false;
		}

		// Log the change for debugging
		const currentResource =
			resourceType === "health" ? resources.Health : resourceType === "mana" ? resources.Mana : resources.Stamina;
		print(
			`ResourceService: ${player.Name} ${resourceType} changed by ${amount} to ${currentResource.current}/${currentResource.max}`,
		);

		// Send update to client
		SendResourceUpdate.SendToPlayer(player, resources);
		return true;
	}
}

// Export singleton instance
export const ResourceServiceInstance = ResourceService.GetInstance();
