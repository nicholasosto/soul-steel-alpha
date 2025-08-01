/**
 * @file src/server/services/resource-dto-service.ts
 * @module ResourceDTOService
 * @layer Server/Services
 * @description DTO-based server-side resource management service adapter
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Initial DTO-based resource service implementation
 */

import { Players } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { PlayerResources } from "shared/types/ResourceTypes";
import { ResourceDTO, ResourceChangeDTO, HealthChangeDTO } from "shared/dtos/ResourceDTO";
import { ResourceDTORemotes } from "shared/network/resource-dto-remotes";
import { ResourceServiceInstance } from "./resource-service";

/**
 * DTO-based Resource Service that works with the existing ResourceService
 * Provides DTO-based network interface while using the existing resource logic
 */
export class ResourceDTOService {
	private static instance?: ResourceDTOService;

	private constructor() {
		this.initializeDTOConnections();
	}

	public static GetInstance(): ResourceDTOService {
		if (!ResourceDTOService.instance) {
			ResourceDTOService.instance = new ResourceDTOService();
		}
		return ResourceDTOService.instance;
	}

	/**
	 * Initialize DTO-based network connections
	 */
	private initializeDTOConnections(): void {
		// Handle resource fetching
		ResourceDTORemotes.Server.Get("FetchResources").SetCallback((player) => {
			const character = player.Character as SSEntity;
			if (!character) {
				return this.createDefaultResourceDTO();
			}

			const resources = ResourceServiceInstance.getEntityResources(character);
			if (!resources) {
				return this.createDefaultResourceDTO();
			}

			return this.convertToResourceDTO(resources);
		});

		// Handle resource modification requests
		ResourceDTORemotes.Server.Get("ModifyResource").SetCallback((player, resourceType, amount) => {
			const character = player.Character as SSEntity;
			if (!character) {
				return false;
			}

			return ResourceServiceInstance.modifyResource(character, resourceType, amount);
		});

		// Listen to existing resource service events and convert to DTO notifications
		this.setupEventForwarding();
	}

	/**
	 * Setup event forwarding from existing ResourceService to DTO events
	 */
	private setupEventForwarding(): void {
		// Event forwarding is now handled directly in ResourceService
		// through lazy imports to avoid circular dependencies
		print("ResourceDTOService: Event forwarding integrated with ResourceService");
	}

	/**
	 * Convert PlayerResources to ResourceDTO
	 */
	public convertToResourceDTO(resources: PlayerResources): ResourceDTO {
		return {
			health: resources.health,
			maxHealth: resources.maxHealth,
			mana: resources.mana,
			maxMana: resources.maxMana,
			stamina: resources.stamina,
			maxStamina: resources.maxStamina,
			timestamp: tick(),
		};
	}

	/**
	 * Create default ResourceDTO for initialization
	 */
	private createDefaultResourceDTO(): ResourceDTO {
		return {
			health: 100,
			maxHealth: 100,
			mana: 50,
			maxMana: 50,
			stamina: 100,
			maxStamina: 100,
			timestamp: tick(),
		};
	}

	/**
	 * Broadcast resource update to all clients
	 */
	public broadcastResourceUpdate(entity: SSEntity): void {
		const resources = ResourceServiceInstance.getEntityResources(entity);
		if (!resources) return;

		const dto = this.convertToResourceDTO(resources);

		// Get the player from the entity
		const player = Players.GetPlayerFromCharacter(entity);
		if (player) {
			ResourceDTORemotes.Server.Get("ResourcesUpdated").SendToPlayer(player, dto);
		}
	}

	/**
	 * Broadcast health change to specific player
	 */
	public broadcastHealthChange(
		entity: SSEntity,
		previousHealth: number,
		newHealth: number,
		change: number,
		source?: string,
		changeType: "damage" | "healing" | "regeneration" | "drain" | "environmental" | "ability" = "damage",
	): void {
		const healthChangeDTO: HealthChangeDTO = {
			previousHealth,
			newHealth,
			change,
			source,
			changeType,
			timestamp: tick(),
		};

		const player = Players.GetPlayerFromCharacter(entity);
		if (player) {
			ResourceDTORemotes.Server.Get("HealthChanged").SendToPlayer(player, healthChangeDTO);
		}
	}

	/**
	 * Broadcast resource change to specific player
	 */
	public broadcastResourceChange(
		entity: SSEntity,
		resourceType: "health" | "mana" | "stamina",
		previousValue: number,
		newValue: number,
		change: number,
		source?: string,
	): void {
		const resourceChangeDTO: ResourceChangeDTO = {
			resourceType,
			previousValue,
			newValue,
			change,
			source,
			timestamp: tick(),
		};

		const player = Players.GetPlayerFromCharacter(entity);
		if (player) {
			ResourceDTORemotes.Server.Get("ResourceChanged").SendToPlayer(player, resourceChangeDTO);
		}
	}
}

// Export singleton instance
export const ResourceDTOServiceInstance = ResourceDTOService.GetInstance();
