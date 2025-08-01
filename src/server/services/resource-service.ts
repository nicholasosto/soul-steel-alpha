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

import { Players, RunService } from "@rbxts/services";
import { SSEntity } from "shared/types";
import {
	PlayerResources,
	HealthChangeEvent,
	ResourceChangeEvent,
	DamageInfo,
	HealingInfo,
	CombatStats,
	StatusEffect,
	ResourceType,
} from "shared/types/ResourceTypes";
import { ResourceRemotes } from "shared/network/resource-remotes";
import { isSSEntity } from "shared/helpers";

/**
 * Resource Service - Manages health, mana, stamina, and combat for all entities
 */
export class ResourceService {
	private static instance?: ResourceService;

	// Entity resource tracking
	private entityResources = new Map<SSEntity, PlayerResources>();
	private entityStats = new Map<SSEntity, CombatStats>();
	private statusEffects = new Map<SSEntity, Map<string, StatusEffect>>();
	private humanoidConnections = new Map<SSEntity, RBXScriptConnection[]>();

	// Default values
	private readonly DEFAULT_MAX_HEALTH = 100;
	private readonly DEFAULT_MAX_MANA = 50;
	private readonly DEFAULT_MAX_STAMINA = 100;

	private readonly DEFAULT_STATS: CombatStats = {
		attackPower: 10,
		defense: 5,
		criticalChance: 0.05,
		criticalMultiplier: 1.5,
		healthRegen: 1,
		manaRegen: 2,
		staminaRegen: 5,
	};

	private constructor() {
		this.initializeConnections();
		this.startRegeneration();
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
			player.CharacterAdded.Connect((character) => {
				this.initializeEntityHealth(character as SSEntity);
			});
		});

		// Handle player leaving
		Players.PlayerRemoving.Connect((player) => {
			if (player.Character) {
				this.cleanupEntity(player.Character as SSEntity);
			}
		});

		// Network handlers
		ResourceRemotes.Server.Get("DealDamage").SetCallback((player, target, damageInfo) => {
			return this.dealDamage(target, damageInfo);
		});

		ResourceRemotes.Server.Get("ApplyHealing").SetCallback((player, target, healingInfo) => {
			return this.applyHealing(target, healingInfo);
		});

		ResourceRemotes.Server.Get("GetPlayerResources").SetCallback((player, playerId) => {
			const userId = tonumber(playerId);
			if (userId === undefined) return undefined;

			const targetPlayer = Players.GetPlayerByUserId(userId);
			if (targetPlayer && targetPlayer.Character) {
				return this.getEntityResources(targetPlayer.Character as SSEntity);
			}
			return undefined;
		});

		ResourceRemotes.Server.Get("ModifyResource").SetCallback((player, target, resourceType, amount) => {
			return this.modifyResource(target, resourceType, amount);
		});

		ResourceRemotes.Server.Get("GetStatusEffects").SetCallback((player, target) => {
			const effects = this.statusEffects.get(target);
			if (!effects) return [];

			const result: StatusEffect[] = [];
			effects.forEach((effect) => result.push(effect));
			return result;
		});

		ResourceRemotes.Server.Get("RequestSuicide").Connect((player) => {
			if (player.Character !== undefined) {
				this.dealDamage(player.Character as SSEntity, {
					baseDamage: 999999,
					damageType: "pure",
					canCrit: false,
					sourceId: "suicide",
				});
			}
		});
	}

	/**
	 * Initialize health system for a new entity
	 */
	public initializeEntityHealth(entity: SSEntity): void {
		if (!isSSEntity(entity)) {
			warn(`Cannot initialize health for invalid entity: ${entity}`);
			return;
		}

		// Set up default resources
		const resources: PlayerResources = {
			health: this.DEFAULT_MAX_HEALTH,
			maxHealth: this.DEFAULT_MAX_HEALTH,
			mana: this.DEFAULT_MAX_MANA,
			maxMana: this.DEFAULT_MAX_MANA,
			stamina: this.DEFAULT_MAX_STAMINA,
			maxStamina: this.DEFAULT_MAX_STAMINA,
		};

		// Set up default combat stats
		const stats: CombatStats = { ...this.DEFAULT_STATS };

		this.entityResources.set(entity, resources);
		this.entityStats.set(entity, stats);
		this.statusEffects.set(entity, new Map());

		// Sync with Roblox Humanoid and establish bidirectional connection
		if (entity.Humanoid) {
			entity.Humanoid.MaxHealth = resources.maxHealth;
			entity.Humanoid.Health = resources.health;

			// Connect Humanoid health changes back to resource system
			const humanoidHealthConnection = entity.Humanoid.HealthChanged.Connect((health) => {
				this.syncFromHumanoidHealth(entity, health);
			});

			// Connect Humanoid death to resource system
			const humanoidDiedConnection = entity.Humanoid.Died.Connect(() => {
				this.handleHumanoidDeath(entity);
			});

			// Store connections for cleanup
			if (!this.humanoidConnections.has(entity)) {
				this.humanoidConnections.set(entity, []);
			}
			this.humanoidConnections.get(entity)!.push(humanoidHealthConnection, humanoidDiedConnection);
		}

		print(`Resource system initialized for entity: ${entity.Name}`);
	}

	/**
	 * Calculate final damage with all modifiers applied
	 */
	private calculateFinalDamage(
		baseDamage: number,
		stats: CombatStats,
		canCrit: boolean,
		multipliers?: number[],
	): number {
		let finalDamage = baseDamage;

		// Apply defense reduction
		const damageReduction = stats.defense / (stats.defense + 100);
		finalDamage *= 1 - damageReduction;

		// Apply critical hit
		if (canCrit && math.random() < stats.criticalChance) {
			finalDamage *= stats.criticalMultiplier;
		}

		// Apply multipliers
		if (multipliers) {
			for (const multiplier of multipliers) {
				finalDamage *= multiplier;
			}
		}

		return math.max(1, math.floor(finalDamage));
	}

	/**
	 * Calculate final healing amount with buffs and limits
	 */
	private calculateFinalHealing(baseHealing: number, stats: CombatStats, multipliers?: number[]): number {
		let finalHealing = baseHealing;

		// Apply multipliers
		if (multipliers) {
			for (const multiplier of multipliers) {
				finalHealing *= multiplier;
			}
		}

		return math.max(1, math.floor(finalHealing));
	}

	/**
	 * Broadcast health change to all clients
	 */
	private broadcastHealthChange(
		entity: SSEntity,
		previousHealth: number,
		newHealth: number,
		change: number,
		source?: string,
		changeType: "damage" | "healing" = "damage",
	): void {
		const healthEvent: HealthChangeEvent = {
			entity,
			previousHealth,
			newHealth,
			change,
			source,
			changeType,
		};

		ResourceRemotes.Server.Get("HealthChanged").SendToAllPlayers(healthEvent);
	}

	/**
	 * Clean up entity data when they leave
	 */
	private cleanupEntity(entity: SSEntity): void {
		// Disconnect humanoid connections
		const connections = this.humanoidConnections.get(entity);
		if (connections) {
			for (const connection of connections) {
				connection.Disconnect();
			}
			this.humanoidConnections.delete(entity);
		}

		this.entityResources.delete(entity);
		this.entityStats.delete(entity);
		this.statusEffects.delete(entity);
	}

	/**
	 * Sync resource system from humanoid health changes (external damage/healing)
	 */
	private syncFromHumanoidHealth(entity: SSEntity, newHumanoidHealth: number): void {
		const resources = this.entityResources.get(entity);
		if (!resources) return;

		const previousHealth = resources.health;
		const clampedHealth = math.max(0, math.min(resources.maxHealth, newHumanoidHealth));

		// Only update if there's a significant change to avoid infinite loops
		if (math.abs(resources.health - clampedHealth) > 0.1) {
			resources.health = clampedHealth;

			// Broadcast the health change
			const change = clampedHealth - previousHealth;
			this.broadcastHealthChange(
				entity,
				previousHealth,
				clampedHealth,
				change,
				"external",
				change > 0 ? "healing" : "damage",
			);

			// Check for death
			if (clampedHealth <= 0) {
				this.handleEntityDeath(entity);
			}
		}
	}

	/**
	 * Handle humanoid death event
	 */
	private handleHumanoidDeath(entity: SSEntity): void {
		const resources = this.entityResources.get(entity);
		if (resources) {
			resources.health = 0;
			this.handleEntityDeath(entity);
		}
	}

	/**
	 * Deal damage to an entity
	 */
	public dealDamage(target: SSEntity, damageInfo: DamageInfo): boolean {
		if (!isSSEntity(target)) {
			warn("Invalid target for damage");
			return false;
		}

		const resources = this.entityResources.get(target);
		const stats = this.entityStats.get(target);

		if (!resources || !stats) {
			warn(`No health data for entity: ${target.Name}`);
			return false;
		}

		// Calculate final damage using helper
		const finalDamage = this.calculateFinalDamage(
			damageInfo.baseDamage,
			stats,
			damageInfo.canCrit,
			damageInfo.multipliers,
		);

		// Apply damage
		const previousHealth = resources.health;
		resources.health = math.max(0, resources.health - finalDamage);

		// Sync with Humanoid
		if (target.Humanoid) {
			target.Humanoid.Health = resources.health;
		}

		// Broadcast health change
		this.broadcastHealthChange(
			target,
			previousHealth,
			resources.health,
			-finalDamage,
			damageInfo.sourceId,
			"damage",
		);

		// Check for death
		if (resources.health <= 0) {
			this.handleEntityDeath(target, damageInfo.source);
		}

		return true;
	}

	/**
	 * Apply healing to an entity
	 */
	public applyHealing(target: SSEntity, healingInfo: HealingInfo): boolean {
		if (!isSSEntity(target)) {
			warn("Invalid target for healing");
			return false;
		}

		const resources = this.entityResources.get(target);
		const stats = this.entityStats.get(target);

		if (!resources || !stats) {
			warn(`No health data for entity: ${target.Name}`);
			return false;
		}

		// Don't heal dead entities
		if (resources.health <= 0) {
			return false;
		}

		// Calculate final healing using helper
		const finalHealing = this.calculateFinalHealing(healingInfo.baseHealing, stats, healingInfo.multipliers);

		// Apply healing (don't exceed max health)
		const previousHealth = resources.health;
		resources.health = math.min(resources.maxHealth, resources.health + finalHealing);

		// Sync with Humanoid
		if (target.Humanoid) {
			target.Humanoid.Health = resources.health;
		}

		// Broadcast health change
		this.broadcastHealthChange(
			target,
			previousHealth,
			resources.health,
			finalHealing,
			healingInfo.sourceId,
			"healing",
		);

		return true;
	}

	/**
	 * Modify a specific resource (health, mana, stamina)
	 */
	public modifyResource(target: SSEntity, resourceType: ResourceType, amount: number): boolean {
		if (!isSSEntity(target)) {
			return false;
		}

		const resources = this.entityResources.get(target);
		if (!resources) {
			return false;
		}

		const previousValue = resources[resourceType];
		let maxValue: number;

		// Get max value based on resource type
		switch (resourceType) {
			case "health":
				maxValue = resources.maxHealth;
				break;
			case "mana":
				maxValue = resources.maxMana;
				break;
			case "stamina":
				maxValue = resources.maxStamina;
				break;
		}

		// Apply change with bounds checking
		resources[resourceType] = math.max(0, math.min(maxValue, previousValue + amount));

		// Sync health with Humanoid
		if (resourceType === "health" && target.Humanoid) {
			target.Humanoid.Health = resources.health;

			// Check for death
			if (resources.health <= 0) {
				this.handleEntityDeath(target);
			}
		}

		// Create resource change event
		const resourceEvent: ResourceChangeEvent = {
			entity: target,
			resourceType,
			previousValue,
			newValue: resources[resourceType],
			change: amount,
		};

		// Broadcast to clients
		ResourceRemotes.Server.Get("ResourceChanged").SendToAllPlayers(resourceEvent);

		return true;
	}

	/**
	 * Get entity resources
	 */
	public getEntityResources(entity: SSEntity): PlayerResources | undefined {
		return this.entityResources.get(entity);
	}

	/**
	 * Get entity combat stats
	 */
	public getEntityStats(entity: SSEntity): CombatStats | undefined {
		return this.entityStats.get(entity);
	}

	/**
	 * Handle entity death
	 */
	private handleEntityDeath(victim: SSEntity, killer?: SSEntity): void {
		print(`Entity died: ${victim.Name}`);

		// Clear status effects
		this.statusEffects.set(victim, new Map());

		// Broadcast death event
		ResourceRemotes.Server.Get("EntityDied").SendToAllPlayers(victim, killer);

		// Handle respawn for players
		const player = Players.GetPlayerFromCharacter(victim);
		if (player) {
			task.wait(3); // Respawn delay
			player.LoadCharacter();
		}
	}

	/**
	 * Start regeneration loop for all entities
	 */
	private startRegeneration(): void {
		RunService.Heartbeat.Connect((deltaTime: number) => {
			for (const [entity, resources] of this.entityResources) {
				const stats = this.entityStats.get(entity);
				if (!stats || resources.health <= 0) continue;

				// Health regeneration
				if (resources.health < resources.maxHealth && stats.healthRegen > 0) {
					const healthRegen = stats.healthRegen * deltaTime;
					this.modifyResource(entity, "health", healthRegen);
				}

				// Mana regeneration
				if (resources.mana < resources.maxMana && stats.manaRegen > 0) {
					const manaRegen = stats.manaRegen * deltaTime;
					this.modifyResource(entity, "mana", manaRegen);
				}

				// Stamina regeneration
				if (resources.stamina < resources.maxStamina && stats.staminaRegen > 0) {
					const staminaRegen = stats.staminaRegen * deltaTime;
					this.modifyResource(entity, "stamina", staminaRegen);
				}
			}
		});
	}
}

// Export singleton instance
export const ResourceServiceInstance = ResourceService.GetInstance();
