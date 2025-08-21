/**
 * @fileoverview Ability Service for the Soul Steel Alpha game system.
 *
 * This service manages the server-side logic for abilities including:
 * - Server-authoritative ability activation and cooldown management
 * - Client-server communication for ability activation
 * - Ability validation (permissions, cooldowns, resources)
 * - Player cleanup when they leave the game
 *
 * The service follows a singleton pattern and integrates with the game's
 * remote system for secure client-server ability communication.
 *
 * Server Signals (Inter-Service Communication)
 * - ManaConsumed — Emits when abilities consume mana for resource tracking
 * - AbilityActivated — Emits when abilities are successfully activated for analytics
 *
 * Client Events (Network Communication)
 * - ABILITY_ACTIVATE — Handles client ability activation requests with validation
 *
 * Roblox Events (Engine Integration)
 * - Players.PlayerAdded — Initializes ability tracking for new players
 * - Players.GetPlayers() — Initializes ability tracking for existing players
 *
 * Public API
 * - ActivateAbilityForCombat(player: Player, abilityKey: AbilityKey): boolean — Validate and trigger an ability activation (server-authoritative).
 * - IsAbilityOnCooldown(player: Player, abilityKey: AbilityKey): boolean — Query an ability's cooldown state for a player.
 *
 * Example
 * // Check if an ability is on cooldown
 * // const onCd = AbilityServiceInstance.IsAbilityOnCooldown(player, "FIREBALL");
 *
 * Notes
 * - Registry Adapter: Registers IAbilityOperations under key "AbilityOperations" in ServiceRegistry.
 * - Validation: Uses explicit undefined checks; rate-limited remote handler; never wraps ServerAsyncFunction in Promise.
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-21 - Removed debug logs, tightened validation/cleanup, improved docs
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
import { SignalServiceInstance } from "./signal-service";
import { ServiceRegistryInstance } from "./service-registry";
import { IAbilityOperations } from "./service-interfaces";

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
 * import { AbilityServiceInstance } from "server/services/ability-service";
 * AbilityServiceInstance.RegisterModel(playerCharacter, ["FIREBALL", "HEAL"]);
 * // Service automatically handles client requests and validation
 * ```
 */

class AbilityService {
	/** Singleton instance of the AbilityService */
	private static instance: AbilityService | undefined;
	private dataService = DataServiceInstance;

	/** Map storing cooldown timers per-entity per-ability (instance-keyed to avoid name collisions across respawns) */
	private abilityCooldowns: Map<SSEntity, Map<AbilityKey, CooldownTimer>> = new Map();

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
		this.registerRegistryAdapter();
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

		// Clean up per-player trackers on leave
		Players.PlayerRemoving.Connect((player) => {
			this.lastAbilityRequestAt.delete(player);
		});
		// For players already in-game when the service initializes
		for (const p of Players.GetPlayers()) {
			connectForPlayer(p);
		}
	}

	// Registration by entity is no longer required; abilities are sourced from player profiles.

	/**
	 * Checks if an ability is currently on cooldown for a specific entity.
	 * @param entity - The SSEntity to check
	 * @param abilityKey - The ability to check
	 * @returns True if the ability is on cooldown, false if ready to use
	 * @public
	 */
	private isAbilityOnCooldownEntity(entity: SSEntity, abilityKey: AbilityKey): boolean {
		const timers = this.abilityCooldowns.get(entity);
		const timer = timers?.get(abilityKey);
		if (timer === undefined) return false;

		const ready = timer.isReady();
		if (ready) {
			// Stale timer entry, clean it up just in case
			timers!.delete(abilityKey);
			return false;
		}
		return true;
	}

	/** Public cooldown query (player-centric) */
	public IsAbilityOnCooldown(player: Player, abilityKey: AbilityKey): boolean {
		const character = player.Character as SSEntity | undefined;
		if (character === undefined || !isSSEntity(character)) return false;
		return this.isAbilityOnCooldownEntity(character, abilityKey);
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
		// Invariant: validateAbility has been called before starting cooldown, so abilityMeta exists
		const abilityMeta = AbilityCatalog[abilityKey]!;
		const cd = abilityMeta.cooldown;
		if (cd <= 0) {
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
		});

		timer.start();
	}

	/**
	 * Unregisters an entity from the ability system.
	 * Removes all ability mappings and cooldown timers for the specified entity.
	 *
	 * @param entity - The SSEntity to unregister
	 * @returns True if entity was found and unregistered, false if entity was not registered
	 * @private
	 */
	private unregisterModel(entity: SSEntity): boolean {
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

		return didAnything;
	}

	/**
	 * Validates whether a player can activate a specific ability.
	 * Performs comprehensive validation including:
	 * - Valid SSEntity character check
	 * - Ability registration verification
	 * - Permission validation
	 * - Cooldown and resource checks
	 *
	 * @param player - The player requesting to use the ability
	 * @param abilityKey - The ability they want to activate
	 * @returns True if the ability can be activated, false otherwise
	 * @private
	 */
	private validateAbility(player: Player, abilityKey: AbilityKey): boolean {
		// Validate player profile
		const profile = this.dataService.GetProfile(player);
		if (profile === undefined) {
			return false;
		}

		// Validate ability exists in catalog
		const abilityMeta = AbilityCatalog[abilityKey];
		if (abilityMeta === undefined) {
			return false;
		}
		const hasAbilityDefined = profile.Data.Abilities[abilityKey] !== undefined;
		if (!hasAbilityDefined) {
			return false;
		}

		// Check if ability is on cooldown
		const character = player.Character as SSEntity | undefined;
		if (character !== undefined && this.isAbilityOnCooldownEntity(character, abilityKey)) {
			MessageServiceInstance.SendMessageToPlayer(player, MessageLibrary.AbilityOnCooldown);
			return false;
		}

		// Check resource costs
		const manaCost = AbilityCatalog[abilityKey]?.cost ?? 0;
		const resourceOps = ServiceRegistryInstance.getResourcePlayerOperations();
		const currentMana = resourceOps.getResourceValue(player, "mana");
		if (currentMana < manaCost) {
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
		// Execute ability logic here
		const character = player.Character as SSEntity;
		if (!isSSEntity(character)) {
			return false;
		}

		try {
			if (!this.validateAbility(player, abilityKey)) {
				return false;
			}

			// Invariant: validateAbility confirmed ability exists in catalog
			const abilityMeta = AbilityCatalog[abilityKey]!;

			// Start cooldown timer
			this.startAbilityCooldown(character, abilityKey);

			// Play Success Effects
			abilityMeta.OnStartSuccess?.(character, undefined);
			task.spawn(() => {
				// Simulate ability duration
				task.wait(abilityMeta.duration);
				abilityMeta.OnEnd?.(character);
			});
			// Consume ability cost through signals instead of direct service calls
			SignalServiceInstance.emit("ManaConsumed", {
				player,
				amount: abilityMeta.cost ?? 0,
				source: `Ability: ${abilityKey}`,
			});

			// Emit ability activation signal for other services
			SignalServiceInstance.emit("AbilityActivated", {
				player,
				abilityKey,
			});

			return true;
		} catch (err) {
			warn(`Error handling ability start for ${player.Name}: ${err}`);
			return false;
		}
	}

	/** Register IAbilityOperations adapter with the ServiceRegistry */
	private registerRegistryAdapter(): void {
		const ops: IAbilityOperations = {
			canActivateAbility(player, abilityKey) {
				return AbilityService.getInstance().validateAbility(player, abilityKey);
			},
			activateAbility(player, abilityKey) {
				return AbilityService.getInstance().handleAbilityStart(player, abilityKey);
			},
			isAbilityOnCooldown(player, abilityKey) {
				return AbilityService.getInstance().IsAbilityOnCooldown(player, abilityKey);
			},
		};
		ServiceRegistryInstance.registerService<IAbilityOperations>("AbilityOperations", ops);
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
 * // Query cooldown state for an ability
 * const isOnCooldown = AbilityServiceInstance.IsAbilityOnCooldown(player, "FIREBALL");
 * ```
 */
export const AbilityServiceInstance = AbilityService.getInstance();
