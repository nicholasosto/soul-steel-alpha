/**
 * @file src/server/services/resource-service.ts
 * @module ResourceService
 * @layer Server/Services
 * @description Server-side health, combat, and resource management service
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Added comprehensive signal documentation
 *
 * ## Server Signals (Inter-Service Communication)
 * - `HumanoidHealthChanged` - Listens for health changes from Roblox Humanoid
 * - `HealthDamageRequested` - Listens for damage requests from combat/ability systems
 * - `HealthHealRequested` - Listens for healing requests from ability/item systems
 * - `ManaConsumed` - Listens for mana consumption from ability systems
 * - `ManaRestored` - Listens for mana restoration from ability/item systems
 * - `StaminaConsumed` - Listens for stamina consumption from movement/ability systems
 * - `StaminaRestored` - Listens for stamina restoration from ability/item systems
 * - `ResourceChanged` - Emits when any resource value changes for analytics/UI updates
 * - `AttributesChanged` - Emits when any attribute value changes for analytics/UI updates
 *
 * ## Client Events (Network Communication)
 * - `ResourcesUpdated` - Sends resource updates to clients for UI synchronization
 * - `PLAYER_DATA_UPDATED` - Sends player data updates when resources change
 * - `FetchResources` - Handles client requests for current resource values
 *
 * ## Roblox Events (Engine Integration)
 * - `Players.PlayerAdded` - Initializes resource tracking for new players
 * - `Players.PlayerRemoving` - Cleans up resource data for leaving players
 * - `RunService.Heartbeat` - Drives resource regeneration loop every frame
 */

import { Players, RunService } from "@rbxts/services";
import { SSEntity } from "shared/types";
import {
	makeDefaultResourceDTO,
	ResourceDTO,
	ResourceRegenConfig,
	calculateMaxResourceValue,
} from "shared/catalogs/resources-catalog";
import { DataRemotes } from "shared/network/data-remotes";
import { DataServiceInstance } from "./data/data-service";
import { SignalServiceInstance } from "./signal-service";
import { ServiceRegistryInstance } from "./service-registry";
import { IResourcePlayerOperations } from "./service-interfaces";
import { ResourceRemotes } from "shared/network/";
import { SIGNAL_KEYS } from "shared";

/**
 * Resource Service - Manages health, mana, stamina, and combat for all entities
 */

const SendResourceUpdate = ResourceRemotes.Server.Get(SIGNAL_KEYS.RESOURCES_UPDATED);
const FetchResources = ResourceRemotes.Server.Get(SIGNAL_KEYS.FETCH_RESOURCES);
const PlayerDataUpdated = DataRemotes.Server.Get("PLAYER_DATA_UPDATED");
export class ResourceService {
	private static instance?: ResourceService;

	// Entity resource tracking
	private entityResources = new Map<Player, ResourceDTO>();
	private signalConnections: RBXScriptConnection[] = [];
	private lastChangeTimestampMs = new Map<Player, { health?: number; mana?: number; stamina?: number }>();
	private heartbeatConn?: RBXScriptConnection;

	private constructor() {
		this.initializeConnections();
		this.startRegenLoop();
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
			print(`ResourceService: Player profile loaded - ${player.Name}`, profile);
			const resources = makeDefaultResourceDTO();
			this.entityResources.set(player, resources);
			this.lastChangeTimestampMs.set(player, {});

			// Compute initial max values from attributes/level and push; also sync humanoid if present
			this.recomputeMaxesFromProfile(player, true);

			// On character spawn, re-apply humanoid MaxHealth based on computed max
			player.CharacterAdded.Connect(() => this.recomputeMaxesFromProfile(player, true));
		});

		// Handle player leaving
		Players.PlayerRemoving.Connect((player) => {
			this.entityResources.delete(player);
			this.lastChangeTimestampMs.delete(player);
		});

		// Listen to Humanoid health changes through signals
		const healthChangeConnection = SignalServiceInstance.connect("HumanoidHealthChanged", (data) => {
			const { player, newHealth } = data as {
				player: Player;
				character: Model;
				newHealth: number;
				maxHealth: number;
			};
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
			this.markPaused(player, "health");
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
			this.markPaused(player, "mana");
		});

		// Listen to mana restoration through signals
		const manaRestoredConnection = SignalServiceInstance.connect("ManaRestored", (data) => {
			const { player, amount, source } = data as { player: Player; amount: number; source?: string };
			print(`ResourceService: Mana restored for ${player.Name}: ${amount} from ${source ?? "unknown"}`);
			this.ModifyResource(player, "mana", amount);
		});

		// Stamina hooks
		const staminaConsumedConnection = SignalServiceInstance.connect("StaminaConsumed", (data) => {
			const { player, amount } = data as { player: Player; amount: number };
			this.ModifyResource(player, "stamina", -amount);
			this.markPaused(player, "stamina");
		});
		const staminaRestoredConnection = SignalServiceInstance.connect("StaminaRestored", (data) => {
			const { player, amount } = data as { player: Player; amount: number };
			this.ModifyResource(player, "stamina", amount);
		});

		// Store connections for potential cleanup
		if (healthChangeConnection) this.signalConnections.push(healthChangeConnection);
		if (damageRequestConnection) this.signalConnections.push(damageRequestConnection);
		if (healRequestConnection) this.signalConnections.push(healRequestConnection);
		if (manaConsumedConnection) this.signalConnections.push(manaConsumedConnection);
		if (manaRestoredConnection) this.signalConnections.push(manaRestoredConnection);
		if (staminaConsumedConnection) this.signalConnections.push(staminaConsumedConnection);
		if (staminaRestoredConnection) this.signalConnections.push(staminaRestoredConnection);

		// Recompute resource max values whenever attributes are updated
		const attrsUpdatedConn = SignalServiceInstance.connect("AttributesUpdated", (data) => {
			const { player } = data as { player: Player };
			this.recomputeMaxesFromProfile(player, false);
		});
		if (attrsUpdatedConn) this.signalConnections.push(attrsUpdatedConn);

		FetchResources.SetCallback((player) => {
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

	/**
	 * Recompute resource max values from the player's saved attributes and level.
	 * If setToFull is true, set current to new max on update (used on spawn/first load).
	 */
	private recomputeMaxesFromProfile(player: Player, setToFull: boolean): void {
		const dto = this.entityResources.get(player);
		if (dto === undefined) return;

		const profile = DataServiceInstance.GetProfile(player);
		if (profile === undefined) {
			// No profile yet; still ensure client sees current dto
			SendResourceUpdate.SendToPlayer(player, dto);
			return;
		}

		const attrs = profile.Data.Attributes;
		const progression = profile.Data.Progression;
		if (attrs === undefined || progression === undefined) {
			SendResourceUpdate.SendToPlayer(player, dto);
			return;
		}

		const level = progression.Level;
		// Calculate maxima from attributes
		const newHealthMax = calculateMaxResourceValue(level, attrs.Vitality, attrs.Strength);
		const newManaMax = calculateMaxResourceValue(level, attrs.Intelligence, attrs.Spirit);
		const newStaminaMax = calculateMaxResourceValue(level, attrs.Agility, attrs.Vitality);

		let changed = false;
		// Update max values and optionally set current to full
		if (dto.Health.max !== newHealthMax) {
			dto.Health.max = newHealthMax;
			changed = true;
		}
		if (dto.Mana.max !== newManaMax) {
			dto.Mana.max = newManaMax;
			changed = true;
		}
		if (dto.Stamina.max !== newStaminaMax) {
			dto.Stamina.max = newStaminaMax;
			changed = true;
		}

		// Adjust currents
		if (setToFull) {
			if (dto.Health.current !== dto.Health.max) {
				dto.Health.current = dto.Health.max;
				changed = true;
			}
			if (dto.Mana.current !== dto.Mana.max) {
				dto.Mana.current = dto.Mana.max;
				changed = true;
			}
			if (dto.Stamina.current !== dto.Stamina.max) {
				dto.Stamina.current = dto.Stamina.max;
				changed = true;
			}
		} else {
			// Clamp down if new maxima are lower
			const hBefore = dto.Health.current;
			dto.Health.current = math.min(dto.Health.current, dto.Health.max);
			changed = changed || dto.Health.current !== hBefore;

			const mBefore = dto.Mana.current;
			dto.Mana.current = math.min(dto.Mana.current, dto.Mana.max);
			changed = changed || dto.Mana.current !== mBefore;

			const sBefore = dto.Stamina.current;
			dto.Stamina.current = math.min(dto.Stamina.current, dto.Stamina.max);
			changed = changed || dto.Stamina.current !== sBefore;
		}

		// Sync Humanoid health caps to engine if available
		const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
		if (humanoid !== undefined) {
			// Non-null assertion safe: humanoid retrieved and used synchronously without yields
			if (humanoid.MaxHealth !== dto.Health.max) humanoid.MaxHealth = dto.Health.max;
			if (humanoid.Health > humanoid.MaxHealth) humanoid.Health = humanoid.MaxHealth;
		}

		if (changed) {
			SendResourceUpdate.SendToPlayer(player, dto);
		}
	}

	/** Mark a resource as recently changed to pause regen until the configured delay passes */
	private markPaused(player: Player, resource: "health" | "mana" | "stamina") {
		let entry = this.lastChangeTimestampMs.get(player);
		if (entry === undefined) {
			entry = {};
			this.lastChangeTimestampMs.set(player, entry);
		}
		const now = os.clock() * 1000;
		if (resource === "health") entry.health = now;
		else if (resource === "mana") entry.mana = now;
		else entry.stamina = now;
	}

	/** Start heartbeat loop to regenerate resources over time */
	private startRegenLoop() {
		if (this.heartbeatConn) this.heartbeatConn.Disconnect();
		this.heartbeatConn = RunService.Heartbeat.Connect((dt) => {
			for (const [player, dto] of this.entityResources) {
				if (!player.Parent) continue;
				const nowMs = os.clock() * 1000;
				let changed = false;
				// Health (optional)
				const healthRule = ResourceRegenConfig.Health;
				if (healthRule && healthRule.regenPerSecond > 0) {
					const lastChanged = this.lastChangeTimestampMs.get(player)?.health;
					if (lastChanged === undefined || nowMs - lastChanged >= healthRule.pauseDelayMs) {
						const before = dto.Health.current;
						if (before < dto.Health.max) {
							dto.Health.current = math.min(dto.Health.max, before + healthRule.regenPerSecond * dt);
							changed = changed || dto.Health.current !== before;
						}
					}
				}
				// Mana
				const manaRule = ResourceRegenConfig.Mana;
				if (manaRule && manaRule.regenPerSecond > 0) {
					const lastChanged = this.lastChangeTimestampMs.get(player)?.mana;
					if (lastChanged === undefined || nowMs - lastChanged >= manaRule.pauseDelayMs) {
						const before = dto.Mana.current;
						if (before < dto.Mana.max) {
							dto.Mana.current = math.min(dto.Mana.max, before + manaRule.regenPerSecond * dt);
							changed = changed || dto.Mana.current !== before;
						}
					}
				}
				// Stamina
				const staminaRule = ResourceRegenConfig.Stamina;
				if (staminaRule && staminaRule.regenPerSecond > 0) {
					const lastChanged = this.lastChangeTimestampMs.get(player)?.stamina;
					if (lastChanged === undefined || nowMs - lastChanged >= staminaRule.pauseDelayMs) {
						const before = dto.Stamina.current;
						if (before < dto.Stamina.max) {
							dto.Stamina.current = math.min(dto.Stamina.max, before + staminaRule.regenPerSecond * dt);
							changed = changed || dto.Stamina.current !== before;
						}
					}
				}

				if (changed) {
					SendResourceUpdate.SendToPlayer(player, dto);
				}
			}
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
}

// Export singleton instance
export const ResourceServiceInstance = ResourceService.getInstance();
