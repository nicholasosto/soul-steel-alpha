/**
 * @fileoverview Ability Service for the Soul Steel Alpha game system.
 *
 * This service manages the server-side logic for ability system including:
 * - Entity ability registration and management
 * - Client-server communication for ability activation
 * - Ability validation (permissions, cooldowns, resources)
 * - Player cleanup when they leave the game
 *
 * The service follows a singleton pattern and integrates with the game's
 * remote system for secure client-server ability communication.
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Players } from "@rbxts/services";
import { SIGNAL_KEYS } from "shared/keys";
import { CooldownTimer } from "shared/packages";
import { AbilityRemotes } from "shared/network";
import { SSEntity } from "shared/types/ss-entity";
import { MessageLibrary } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { DataServiceInstance } from "./data-service";
import { MessageServiceInstance } from "./message-service";
// import { ResourceServiceInstance } from "./resource-service"; // Avoid direct coupling
import { SignalServiceInstance } from "./signal-service";
import { ServiceRegistryInstance } from "./service-registry";

/**
 * Server-side ability management service.
 *
 * This singleton service handles all server-side ability operations including
 * entity registration, client communication, and ability validation. It maintains
 * a mapping of entities to their available abilities and ensures secure ability
 * activation through proper validation.
 *
 * @class AbilityService
 * @example
 * ```typescript
 * // Register abilities for an entity
 * const service = AbilityService.Start();
 * service.RegisterModel(playerCharacter, ["FIREBALL", "HEAL"]);
 *
 * // Service automatically handles client requests and validation
 * ```
 */

class AbilityService {
	/** Singleton instance of the AbilityService */
	private static instance: AbilityService | undefined;
	private dataService = DataServiceInstance;

	/** Map storing registered abilities for each entity */
	private characterAbilityMap: Map<SSEntity, AbilityKey[]> = new Map();

	/** Map storing cooldown timers per-entity per-ability (instance-keyed to avoid name collisions across respawns) */
	private abilityCooldowns: Map<SSEntity, Map<AbilityKey, CooldownTimer>> = new Map();

	/** Optional debug toggle for verbose cooldown logs */
	private readonly DEBUG = false;

	/** Simple per-player rate limit tracker for ability activation */
	private lastAbilityRequestAt = new Map<Player, number>();
	private ABILITY_REQUEST_WINDOW_SEC = 0.15; // allow ~6 per second

	/**
	 * Gets or creates the singleton instance of AbilityService.
	 * Initializes the service on first call.
	 *
	 * @returns The singleton AbilityService instance
	 * @static
	 */
	public static getInstance(): AbilityService {
		if (AbilityService.instance === undefined) {
			AbilityService.instance = new AbilityService();
		}
		return AbilityService.instance;
	}

	/**
	 * Private constructor for singleton pattern.
	 * Initializes remote handlers and cleanup systems.
	 *
	 * @private
	 */
	private constructor() {
		// Initialize the service
		this.initializeRemotes();
		this.initializeCleanup();
	}

	/**
	 * Public method to activate an ability from other services (like CombatService)
	 * This allows other services to trigger abilities while maintaining proper validation
	 */
	public ActivateAbilityForCombat(player: Player, abilityKey: AbilityKey): boolean {
		return this.handleAbilityStart(player, abilityKey);
	}

	/**
	 * Initializes remote event handlers for client-server communication.
	 * Sets up the START_ABILITY remote to handle ability activation requests.
	 *
	 * @private
	 */
	private initializeRemotes(): void {
		try {
			AbilityRemotes.Server.Get(SIGNAL_KEYS.ABILITY_ACTIVATE).SetCallback((player, abilityKey) => {
				// Rate limit guard
				const now = tick();
				const last = this.lastAbilityRequestAt.get(player);
				if (last !== undefined && now - last < this.ABILITY_REQUEST_WINDOW_SEC) {
					if (this.DEBUG)
						warn(
							`RATE-LIMIT: ${player.Name} ability ${abilityKey} blocked (${string.format(
								"%.3f",
								now - last,
							)}s < window ${this.ABILITY_REQUEST_WINDOW_SEC}s)`,
						);
					return false;
				}
				const ok = this.handleAbilityStart(player, abilityKey);
				if (ok) this.lastAbilityRequestAt.set(player, now);
				return ok;
			});
		} catch (error) {
			warn(`Failed to initialize ability remotes: ${error}`);
		}
	}

	/**
	 * Sets up automatic cleanup when players and their characters leave the game.
	 * Ensures that entity ability mappings are properly cleaned up to prevent memory leaks.
	 *
	 * @private
	 */
	private initializeCleanup(): void {
		// Cleanup cooldowns when characters are removed (respawn or leave)
		const connectForPlayer = (player: Player) => {
			player.CharacterRemoving.Connect((character) => {
				if (isSSEntity(character)) {
					this.unregisterModel(character);
				}
			});
		};

		// For new players
		Players.PlayerAdded.Connect(connectForPlayer);
		// For players already in-game when the service initializes
		for (const p of Players.GetPlayers()) {
			connectForPlayer(p);
		}
	}

	/**
	 * Registers an entity with a set of available abilities.
	 *
	 * @param entity - The SSEntity to register abilities for
	 * @param abilityKeys - Array of ability keys that this entity can use
	 * @returns True if registration was successful, false if entity was already registered
	 * @public
	 *
	 * @example
	 * ```typescript
	 * const success = abilityService.RegisterModel(playerCharacter, ["FIREBALL", "HEAL"]);
	 * if (success) {
	 *   print("Abilities registered successfully");
	 * }
	 * ```
	 */
	public RegisterModel(entity: SSEntity, abilityKeys: AbilityKey[]): boolean {
		if (this.characterAbilityMap.has(entity)) {
			warn(`Entity ${entity.Name} already registered with abilities.`);
			return false;
		}

		this.characterAbilityMap.set(entity, abilityKeys);
		print(`Registered entity ${entity.Name} with abilities: ${abilityKeys.join(", ")}`);
		return true;
	}

	/**
	 * Generates a unique key for entity-ability combination cooldown tracking.
	 * @param entity - The SSEntity
	 * @param abilityKey - The ability key
	 * @returns Unique string key for cooldown mapping
	 * @private
	 */
	// Removed string-based cooldown keys; using instance-keyed nested maps instead

	/**
	 * Checks if an ability is currently on cooldown for a specific entity.
	 * @param entity - The SSEntity to check
	 * @param abilityKey - The ability to check
	 * @returns True if the ability is on cooldown, false if ready to use
	 * @public
	 */
	public isAbilityOnCooldown(entity: SSEntity, abilityKey: AbilityKey): boolean {
		const timers = this.abilityCooldowns.get(entity);
		const timer = timers?.get(abilityKey);
		if (timer === undefined) return false;

		const ready = timer.isReady();
		if (ready) {
			// Stale timer entry, clean it up just in case
			timers!.delete(abilityKey);
			if (this.DEBUG) warn(`COOLDOWN-CLEANUP: ${entity.Name}.${abilityKey} had stale timer; removed.`);
			return false;
		}

		if (this.DEBUG) warn(`COOLDOWN-ACTIVE: ${entity.Name}.${abilityKey}`);
		return true;
	}

	private getTimer(entity: SSEntity, key: AbilityKey): CooldownTimer | undefined {
		return this.abilityCooldowns.get(entity)?.get(key);
	}

	/**
	 * Starts a cooldown timer for a specific entity-ability combination.
	 * @param entity - The SSEntity that used the ability
	 * @param abilityKey - The ability that was used
	 * @private
	 */
	private startAbilityCooldown(entity: SSEntity, abilityKey: AbilityKey): void {
		const abilityMeta = AbilityCatalog[abilityKey];
		const cd = abilityMeta.cooldown;
		if (cd <= 0) {
			if (this.DEBUG) warn(`SKIP-COOLDOWN: ${entity.Name}.${abilityKey} has non-positive duration (${cd}s)`);
			return;
		}

		let perEntity = this.abilityCooldowns.get(entity);
		if (perEntity === undefined) {
			perEntity = new Map<AbilityKey, CooldownTimer>();
			this.abilityCooldowns.set(entity, perEntity);
		}

		// Clean up any existing timer
		const existingTimer = perEntity.get(abilityKey);
		if (existingTimer !== undefined) {
			existingTimer.destroy();
		}

		// Create and start new cooldown timer
		const timer = new CooldownTimer(cd);
		perEntity.set(abilityKey, timer);

		// Auto-cleanup when cooldown completes
		timer.onComplete(() => {
			perEntity!.delete(abilityKey);
			timer.destroy();
			if ((perEntity! as Map<AbilityKey, CooldownTimer>).size() === 0) {
				this.abilityCooldowns.delete(entity);
			}
			if (this.DEBUG) warn(`COOLDOWN-DONE: ${entity.Name}.${abilityKey}`);
		});

		timer.start();
		if (this.DEBUG) warn(`COOLDOWN-START: ${entity.Name}.${abilityKey} for ${cd}s`);
	}

	/**
	 * Unregisters an entity from the ability system.
	 * Removes all ability mappings and cooldown timers for the specified entity.
	 *
	 * @param entity - The SSEntity to unregister
	 * @returns True if entity was found and unregistered, false if entity was not registered
	 * @public
	 */
	public unregisterModel(entity: SSEntity): boolean {
		let didAnything = false;
		// Clean up cooldown timers tracked for this entity
		const perEntity = this.abilityCooldowns.get(entity);
		if (perEntity !== undefined) {
			for (const [, timer] of perEntity) {
				timer.destroy();
			}
			this.abilityCooldowns.delete(entity);
			didAnything = true;
		}

		// Remove from registered abilities map if present
		if (this.characterAbilityMap.has(entity)) {
			this.characterAbilityMap.delete(entity);
			didAnything = true;
		}

		if (didAnything) {
			print(`Unregistered entity ${entity.Name} and cleaned up cooldowns`);
		}
		return didAnything;
	}

	/**
	 * Validates whether a player can activate a specific ability.
	 * Performs comprehensive validation including:
	 * - Valid SSEntity character check
	 * - Ability registration verification
	 * - Permission validation
	 * - Future: Cooldown and resource checks
	 *
	 * @param player - The player requesting to use the ability
	 * @param abilityKey - The ability they want to activate
	 * @returns True if the ability can be activated, false otherwise
	 * @private
	 */
	private validateAbility(player: Player, abilityKey: AbilityKey): boolean {
		// Get player's character
		const character = player.Character as SSEntity;
		const profile = this.dataService.GetProfile(player);
		if (!profile) {
			warn(`Player ${player.Name} does not have a valid profile`);
			return false;
		}
		const hasAbilityDefined = profile.Data.Abilities[abilityKey] !== undefined;
		if (!hasAbilityDefined) {
			warn(`Ability ${abilityKey} is not defined in player profile`, profile.Data.Abilities);
			return false;
		}

		// Check if ability is on cooldown
		if (this.isAbilityOnCooldown(character, abilityKey)) {
			warn(`Ability ${abilityKey} is on cooldown for player ${player.Name}`);
			if (this.DEBUG) {
				const t = this.getTimer(character, abilityKey);
				const progress = t ? t["Progress"].get?.() : undefined;
				warn(`COOLDOWN-DETAIL: ${character.Name}.${abilityKey} progress=${progress}`);
			}
			MessageServiceInstance.SendMessageToPlayer(player, MessageLibrary.AbilityOnCooldown);
			return false;
		}

		// Check resource costs
		const manaCost = AbilityCatalog[abilityKey]?.cost ?? 0;
		const resourceOps = ServiceRegistryInstance.getResourcePlayerOperations();
		const currentMana = resourceOps.getResourceValue(player, "mana");
		if (currentMana < manaCost) {
			warn(`Player ${player.Name} does not have enough mana for ability ${abilityKey}`);
			return false;
		}

		// Add additional validation logic here (cooldowns, resources, etc.)
		return true;
	}

	/**
	 * Handles ability activation requests from clients.
	 * Validates the request and executes the ability if validation passes.
	 * This method is called by the remote event system.
	 *
	 * @param player - The player requesting to start the ability
	 * @param abilityKey - The ability key to activate
	 * @returns True if ability was successfully started, false otherwise
	 * @private
	 */
	private handleAbilityStart(player: Player, abilityKey: AbilityKey): boolean {
		const abilityMeta = AbilityCatalog[abilityKey];
		// Execute ability logic here
		const character = player.Character as SSEntity;
		if (!isSSEntity(character)) {
			warn(`Player ${player.Name} does not have a valid character model`);
			return false;
		}

		try {
			if (!this.validateAbility(player, abilityKey)) {
				warn("ABILITY-VALIDATE-FAILED");
				//abilityMeta.OnStartFailure?.(player.Character as SSEntity);
				// return false;
			}

			// Start cooldown timer
			this.startAbilityCooldown(character, abilityKey);

			// Play Success Effects
			abilityMeta.OnStartSuccess?.(character, undefined);
			abilityMeta.OnHold?.(character, 0, undefined);
			task.spawn(() => {
				// Simulate ability duration
				wait(abilityMeta.duration);
				abilityMeta.OnEnd?.(character);
			});
			// Consume ability cost through signals instead of direct service calls
			SignalServiceInstance.emit("ManaConsumed", {
				player,
				amount: abilityMeta["cost"],
				source: `Ability: ${abilityKey}`,
			});

			// Emit ability activation signal for other services
			SignalServiceInstance.emit("AbilityActivated", {
				player,
				abilityKey,
			});

			return true;
		} catch (err) {
			warn(`,error handling ability start for ${player.Name}: ${err}`);
			return false;
		}
	}
}

/**
 * Singleton instance of the AbilityService.
 * Use this instance for all ability-related operations in the server.
 *
 * @example
 * ```typescript
 * import { AbilityServiceInstance } from "server/services/ability-service";
 *
 * // Register abilities for a character
 * AbilityServiceInstance.RegisterModel(character, ["FIREBALL", "HEAL"]);
 * ```
 */
export const AbilityServiceInstance = AbilityService.getInstance();
