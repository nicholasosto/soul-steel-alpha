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
import { DataRemotes } from "shared/network/data-remotes";
import { DataServiceInstance } from "./data-service";
import { SignalServiceInstance } from "./signal-service";
import { ServiceRegistryInstance } from "./service-registry";
import { IResourcePlayerOperations } from "./service-interfaces";

/**
 * Resource Service - Manages health, mana, stamina, and combat for all entities
 */

const SendResourceUpdate = ResourceRemotes.Server.Get("ResourcesUpdated");
const PlayerDataUpdated = DataRemotes.Server.Get("PLAYER_DATA_UPDATED");
export class ResourceService {
	private static instance?: ResourceService;

	// Entity resource tracking
	private entityResources = new Map<Player, ResourceDTO>();
	private signalConnections: RBXScriptConnection[] = [];

	private constructor() {
		this.initializeConnections();
	}

	public static getInstance(): ResourceService {
		if (!ResourceService.instance) {
			ResourceService.instance = new ResourceService();
		}
		return ResourceService.instance;
	}

	/**
	 * Initialize network connections and signal listeners
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
		});

		// Handle player leaving
		Players.PlayerRemoving.Connect((player) => {
			this.entityResources.delete(player);
		});

		// Listen to Humanoid health changes through signals
		const healthChangeConnection = SignalServiceInstance.connect("HumanoidHealthChanged", (data) => {
			const { player, newHealth } = data as {
				player: Player;
				character: Model;
				newHealth: number;
				maxHealth: number;
			};
			print(`ResourceService: Health changed for ${player.Name} to ${newHealth} (via signal)`);
			this.SetResourceValue(player, "health", newHealth);
		});

		// Listen to damage requests through signals

		const damageRequestConnection = SignalServiceInstance.connect("HealthDamageRequested", (data) => {
			const { player, amount, source } = data as { player: Player; amount: number; source?: string };
			print(`ResourceService: Damage requested for ${player.Name}: ${amount} from ${source ?? "unknown"}`);
			// Apply at Humanoid (source of truth), HumanoidMonitor will reflect to Resource DTO
			const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
			if (humanoid !== undefined) {
				humanoid.TakeDamage(math.max(0, amount));
			} else {
				// Fallback to DTO to avoid dropping the event
				this.ModifyResource(player, "health", -amount);
			}
		});

		// Listen to heal requests through signals
		const healRequestConnection = SignalServiceInstance.connect("HealthHealRequested", (data) => {
			const { player, amount, source } = data as { player: Player; amount: number; source?: string };
			print(`ResourceService: Heal requested for ${player.Name}: ${amount} from ${source ?? "unknown"}`);
			const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
			if (humanoid !== undefined) {
				const newValue = math.min(humanoid.Health + amount, humanoid.MaxHealth);
				humanoid.Health = newValue;
			} else {
				this.ModifyResource(player, "health", amount);
			}
		});

		// Listen to mana consumption through signals
		const manaConsumedConnection = SignalServiceInstance.connect("ManaConsumed", (data) => {
			const { player, amount, source } = data as { player: Player; amount: number; source?: string };
			print(`ResourceService: Mana consumed for ${player.Name}: ${amount} from ${source ?? "unknown"}`);
			this.ModifyResource(player, "mana", -amount);
		});

		// Listen to mana restoration through signals
		const manaRestoredConnection = SignalServiceInstance.connect("ManaRestored", (data) => {
			const { player, amount, source } = data as { player: Player; amount: number; source?: string };
			print(`ResourceService: Mana restored for ${player.Name}: ${amount} from ${source ?? "unknown"}`);
			this.ModifyResource(player, "mana", amount);
		});

		// Store connections for potential cleanup
		if (healthChangeConnection) this.signalConnections.push(healthChangeConnection);
		if (damageRequestConnection) this.signalConnections.push(damageRequestConnection);
		if (healRequestConnection) this.signalConnections.push(healRequestConnection);
		if (manaConsumedConnection) this.signalConnections.push(manaConsumedConnection);
		if (manaRestoredConnection) this.signalConnections.push(manaRestoredConnection);

		ResourceRemotes.Server.Get("FetchResources").SetCallback((player) => {
			const resources = this.entityResources.get(player) ?? makeDefaultResourceDTO();
			return resources;
		});

		// Register player-centric resource operations with the service registry
		const ops: IResourcePlayerOperations = {
			modifyResource: (player, resourceType, amount) => this.ModifyResource(player, resourceType, amount),
			getResourceValue: (player, resourceType) => {
				const dto = this.entityResources.get(player);
				if (!dto) return 0;
				if (resourceType === "health") return dto.Health.current;
				if (resourceType === "mana") return dto.Mana.current;
				return dto.Stamina.current;
			},
			setResourceValue: (player, resourceType, value) => this.SetResourceValue(player, resourceType, value),
		};
		ServiceRegistryInstance.registerService<IResourcePlayerOperations>("ResourcePlayerOperations", ops);
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

	/**
	 * Set a resource to a specific value (used for direct synchronization with Humanoid)
	 */
	public SetResourceValue(player: Player, resourceType: "health" | "mana" | "stamina", value: number): boolean {
		const resources = this.entityResources.get(player);
		if (!resources) {
			warn(`ResourceService: No resources found for player ${player.Name}`);
			return false;
		}

		// Get the specific resource and set the value directly
		if (resourceType === "health") {
			const resource = resources.Health;
			const oldValue = resource.current;
			resource.current = math.max(0, math.min(value, resource.max));

			// Emit signal for the change
			SignalServiceInstance.emit("ResourceChanged", {
				player,
				resourceType: "health",
				oldValue,
				newValue: resource.current,
			});
		} else if (resourceType === "mana") {
			const resource = resources.Mana;
			const oldValue = resource.current;
			resource.current = math.max(0, math.min(value, resource.max));

			// Emit signal for the change
			SignalServiceInstance.emit("ResourceChanged", {
				player,
				resourceType: "mana",
				oldValue,
				newValue: resource.current,
			});
		} else if (resourceType === "stamina") {
			const resource = resources.Stamina;
			const oldValue = resource.current;
			resource.current = math.max(0, math.min(value, resource.max));

			// Emit signal for the change
			SignalServiceInstance.emit("ResourceChanged", {
				player,
				resourceType: "stamina",
				oldValue,
				newValue: resource.current,
			});
		} else {
			warn(`ResourceService: Invalid resource type ${resourceType}`);
			return false;
		}

		// Log the change for debugging
		const currentResource =
			resourceType === "health" ? resources.Health : resourceType === "mana" ? resources.Mana : resources.Stamina;
		print(
			`ResourceService: ${player.Name} ${resourceType} set to ${currentResource.current}/${currentResource.max}`,
		);

		// Send update to client
		SendResourceUpdate.SendToPlayer(player, resources);
		return true;
	}

	/**
	 * Award experience to a player, handle level-ups, and notify the client
	 */
	public AwardExperience(player: Player, amount: number): void {
		if (amount <= 0) return;
		const dto = this.entityResources.get(player);
		if (!dto) return;
		const profile = DataServiceInstance.GetProfile(player);
		if (!profile) return;

		// Experience resource exists in DTO
		const exp = dto.Experience;
		let newCurrent = exp.current + amount;
		let max = exp.max;
		let levelsGained = 0;

		// Basic leveling: rollover and increase cap
		while (newCurrent >= max) {
			newCurrent -= max;
			levelsGained += 1;
			max = math.floor(max * 1.2 + 5);
		}

		// Apply to DTO
		exp.current = newCurrent;
		exp.max = max;

		// Notify client about resource change first
		SendResourceUpdate.SendToPlayer(player, dto);

		// If leveled up, persist and emit player data update with full payload
		if (levelsGained > 0) {
			profile.Data.Level = (profile.Data.Level ?? 1) + levelsGained;
			PlayerDataUpdated.SendToPlayer(player, profile.Data);
		}
	}
}

// Export singleton instance
export const ResourceServiceInstance = ResourceService.getInstance();
