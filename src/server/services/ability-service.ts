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
import { AbilityKey, SIGNAL_KEYS } from "shared/keys";
import { VFXConfigOption, VFXKey, RunEffect, CooldownTimer } from "shared/packages";
import { AbilityRemotes } from "shared/network";
import { SSEntity } from "shared/types/SSEntity";
import { MessageLibrary } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { AbilityCatalog } from "shared/catalogs";
import { DataServiceInstance } from "./data-service";
import MessageService, { MessageServiceInstance } from "./message-service";
import { ResourceServiceInstance } from "./resource-service";

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

	/** Map storing cooldown timers for each entity's abilities */
	private abilityCooldowns: Map<string, CooldownTimer> = new Map();

	/**
	 * Gets or creates the singleton instance of AbilityService.
	 * Initializes the service on first call.
	 *
	 * @returns The singleton AbilityService instance
	 * @static
	 */
	public static Start(): AbilityService {
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
	 * Initializes remote event handlers for client-server communication.
	 * Sets up the START_ABILITY remote to handle ability activation requests.
	 *
	 * @private
	 */
	private initializeRemotes(): void {
		try {
			AbilityRemotes.Server.Get(SIGNAL_KEYS.ABILITY_ACTIVATE).SetCallback((player, abilityKey) => {
				return this.handleAbilityStart(player, abilityKey);
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
		// Cleanup when players leave
		Players.PlayerRemoving.Connect((player) => {
			player.CharacterRemoving.Connect((character) => {
				if (isSSEntity(character)) {
					this.unregisterModel(character);
				}
			});
		});
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
	private getCooldownKey(entity: SSEntity, abilityKey: AbilityKey): string {
		return `${entity.Name}_${abilityKey}`;
	}

	/**
	 * Checks if an ability is currently on cooldown for a specific entity.
	 * @param entity - The SSEntity to check
	 * @param abilityKey - The ability to check
	 * @returns True if the ability is on cooldown, false if ready to use
	 * @public
	 */
	public isAbilityOnCooldown(entity: SSEntity, abilityKey: AbilityKey): boolean {
		const cooldownKey = this.getCooldownKey(entity, abilityKey);
		const timer = this.abilityCooldowns.get(cooldownKey);
		return timer !== undefined && !timer.isReady();
	}

	/**
	 * Starts a cooldown timer for a specific entity-ability combination.
	 * @param entity - The SSEntity that used the ability
	 * @param abilityKey - The ability that was used
	 * @private
	 */
	private startAbilityCooldown(entity: SSEntity, abilityKey: AbilityKey): void {
		const cooldownKey = this.getCooldownKey(entity, abilityKey);
		const abilityMeta = AbilityCatalog[abilityKey];

		// Clean up any existing timer
		const existingTimer = this.abilityCooldowns.get(cooldownKey);
		if (existingTimer) {
			existingTimer.destroy();
		}

		// Create and start new cooldown timer
		const timer = new CooldownTimer(abilityMeta.cooldown);
		this.abilityCooldowns.set(cooldownKey, timer);

		// Auto-cleanup when cooldown completes
		timer.onComplete(() => {
			this.abilityCooldowns.delete(cooldownKey);
			timer.destroy();
		});

		timer.start();
		print(`Started ${abilityMeta.cooldown}s cooldown for ${abilityKey} on ${entity.Name}`);
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
		if (this.characterAbilityMap.has(entity)) {
			// Clean up all cooldown timers for this entity
			const registeredAbilities = this.characterAbilityMap.get(entity)!;
			for (const abilityKey of registeredAbilities) {
				const cooldownKey = this.getCooldownKey(entity, abilityKey);
				const timer = this.abilityCooldowns.get(cooldownKey);
				if (timer) {
					timer.destroy();
					this.abilityCooldowns.delete(cooldownKey);
				}
			}

			this.characterAbilityMap.delete(entity);
			print(`Unregistered entity ${entity.Name} and cleaned up cooldowns`);
			return true;
		}
		return false;
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
		const character = player.Character;
		const profile = this.dataService.GetProfile(player);
		if (!profile) {
			warn(`Player ${player.Name} does not have a valid profile`);
			return false;
		}
		if (profile.Data.Abilities[abilityKey] === undefined || !profile.Data.Abilities[abilityKey]) {
			warn(`Ability ${abilityKey} is not defined in player profile`);
			return false;
		}
		if (!character || !isSSEntity(character)) {
			warn(`Player ${player.Name} does not have a valid SSEntity character`);
			return false;
		}

		// Check if character has this ability registered
		const registeredAbilities = this.characterAbilityMap.get(character);
		if (!registeredAbilities) {
			warn(`No abilities registered for player ${player.Name}'s character`);
			return false;
		}

		if (!registeredAbilities.includes(abilityKey)) {
			warn(`Ability ${abilityKey} not available for player ${player.Name}`);
			return false;
		}

		// Check if ability is on cooldown
		if (this.isAbilityOnCooldown(character, abilityKey)) {
			warn(`Ability ${abilityKey} is on cooldown for player ${player.Name}`);
			MessageServiceInstance.SendMessageToPlayer(player, MessageLibrary.AbilityOnCooldown);
			return false;
		}

		// Check resource costs
		const manaCost = AbilityCatalog[abilityKey]?.cost ?? 0;
		const currentMana = ResourceServiceInstance.getEntityResources(character as SSEntity)?.mana ?? 0;
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

		try {
			if (!this.validateAbility(player, abilityKey)) {
				abilityMeta.OnStartFailure?.(player.Character as SSEntity);
				return false;
			}

			// Execute ability logic here
			const character = player.Character as SSEntity;

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
			ResourceServiceInstance.modifyResource(character as SSEntity, "mana", -abilityMeta["cost"]);

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
export const AbilityServiceInstance = AbilityService.Start();
