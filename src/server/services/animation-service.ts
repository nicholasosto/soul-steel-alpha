/**
 * @fileoverview Animation Service for the Soul Steel Alpha game system.
 *
 * This service manages the server-side logic for animation system including:
 * - Entity animation registration and loading on character spawn
 * - Automatic animation loading for existing and new SSEntity rigs
 * - Animation track management and cleanup
 * - Player cleanup when they leave the game
 *
 * The service follows a singleton pattern and integrates with the game's
 * animation helper system for consistent animation management.
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Players } from "@rbxts/services";
import { AnimationKey } from "shared/asset-ids";
import { SSEntity } from "shared/types/ss-entity";
import { isSSEntity, validateSSEntity } from "shared/helpers/type-guards";
import {
	LoadAllCharacterAnimations,
	LoadCharacterAnimations,
	cleanupCharacterAnimations,
} from "shared/helpers/animation-helpers";

/**
 * Server-side animation management service.
 *
 * This singleton service handles all server-side animation operations including
 * entity registration, automatic animation loading, and animation track management.
 * It maintains a mapping of entities to their loaded animations and ensures proper
 * cleanup when characters are removed.
 *
 * @class AnimationService
 * @example
 * ```typescript
 * // Configure default animations for all characters
 * const service = AnimationService.Start();
 * service.SetDefaultAnimations(["Punch_01", "Punch_02", "Dodge"]);
 *
 * // Register custom animations for a specific entity
 * service.RegisterModelAnimations(playerCharacter, ["Cast_Projectile", "Cast_Summon"]);
 * ```
 */
class AnimationService {
	/** Singleton instance of the AnimationService */
	private static instance: AnimationService | undefined;

	/** Map storing registered custom animations for each entity */
	private entityAnimationMap: Map<SSEntity, AnimationKey[]> = new Map();

	/** Default animations loaded for all new SSEntity characters */
	private defaultAnimations: AnimationKey[] = ["Punch_01", "Punch_02", "TakeDamage", "Dodge"];

	/**
	 * Gets or creates the singleton instance of AnimationService.
	 * Initializes the service on first call.
	 *
	 * @returns The singleton AnimationService instance
	 * @static
	 */
	public static Start(): AnimationService {
		if (AnimationService.instance === undefined) {
			AnimationService.instance = new AnimationService();
		}
		return AnimationService.instance;
	}

	/**
	 * Private constructor for singleton pattern.
	 * Initializes character event handlers and cleanup systems.
	 *
	 * @private
	 */
	private constructor() {
		// Initialize the service
		this.initializeCharacterHandlers();
		this.initializeCleanup();
		this.loadAnimationsForExistingCharacters();
	}

	/**
	 * Initializes character event handlers for automatic animation loading.
	 * Sets up CharacterAdded events to load animations when new characters spawn.
	 *
	 * @private
	 */
	private initializeCharacterHandlers(): void {
		try {
			Players.PlayerAdded.Connect((player) => {
				player.CharacterAdded.Connect((characterModel) => {
					print(`Character added for player ${player.Name}: ${characterModel.Name}`);
					this.handleCharacterAdded(characterModel, player);
				});
			});
			print("Animation service character handlers initialized");
		} catch (error) {
			warn(`Failed to initialize character handlers: ${error}`);
		}
	}

	/**
	 * Sets up automatic cleanup when players and their characters leave the game.
	 * Ensures that entity animation mappings are properly cleaned up to prevent memory leaks.
	 *
	 * @private
	 */
	private initializeCleanup(): void {
		// Cleanup when players leave
		Players.PlayerRemoving.Connect((player) => {
			player.CharacterRemoving.Connect((character) => {
				if (isSSEntity(character)) {
					this.unregisterModel(character);
					// Animation tracks are cleaned up by the animation-helpers module
					cleanupCharacterAnimations(character);
				}
			});
		});
		print("Animation service cleanup handlers initialized");
	}

	/**
	 * Loads animations for any existing characters that are already in the game.
	 * This ensures animations are loaded even for characters that spawned before the service started.
	 *
	 * @private
	 */
	private loadAnimationsForExistingCharacters(): void {
		try {
			const players = Players.GetPlayers();
			for (const player of players) {
				const character = player.Character;
				if (character) {
					this.handleCharacterAdded(character, player);
				}
			}
			print(`Loaded animations for ${players.size()} existing players`);
		} catch (error) {
			warn(`Failed to load animations for existing characters: ${error}`);
		}
	}

	/**
	 * Handles character addition events.
	 * Validates the character as an SSEntity and loads all available animations.
	 *
	 * @param characterModel - The character model that was added
	 * @param player - The player who owns the character
	 * @private
	 */
	private handleCharacterAdded(characterModel: Model, player: Player): void {
		const ssEntity = validateSSEntity(characterModel, player.Name);
		if (!ssEntity) {
			warn(`Character model for player ${player.Name} is not a valid SSEntity, skipping animation loading`);
			return;
		}

		// Load all animations (emotes, ability animations, and combat animations)
		LoadAllCharacterAnimations(ssEntity);

		print(`Loaded all animations for player ${player.Name}'s character ${ssEntity.Name}`);
	}

	/**
	 * Loads the default animation set for an SSEntity.
	 *
	 * @param entity - The SSEntity to load default animations for
	 * @private
	 */
	private loadDefaultAnimations(entity: SSEntity): void {
		if (this.defaultAnimations.size() > 0) {
			LoadCharacterAnimations(entity, this.defaultAnimations);
			print(`Loaded ${this.defaultAnimations.size()} default animations for entity ${entity.Name}`);
		}
	}

	/**
	 * Loads a specific set of animations for an SSEntity.
	 *
	 * @param entity - The SSEntity to load animations for
	 * @param animationKeys - Array of animation keys to load
	 * @private
	 */
	private loadAnimationsForEntity(entity: SSEntity, animationKeys: AnimationKey[]): void {
		if (animationKeys.size() > 0) {
			LoadCharacterAnimations(entity, animationKeys);
			print(
				`Loaded ${animationKeys.size()} custom animations for entity ${entity.Name}: ${animationKeys.join(", ")}`,
			);
		}
	}

	/**
	 * Sets the default animations that will be loaded for all new SSEntity characters.
	 *
	 * @param animationKeys - Array of animation keys to use as defaults
	 * @returns True if default animations were set successfully
	 * @public
	 *
	 * @example
	 * ```typescript
	 * const success = animationService.SetDefaultAnimations(["Punch_01", "Dodge", "TakeDamage"]);
	 * if (success) {
	 *   print("Default animations updated");
	 * }
	 * ```
	 */
	public SetDefaultAnimations(animationKeys: AnimationKey[]): boolean {
		try {
			this.defaultAnimations = animationKeys;
			print(`Default animations set: ${animationKeys.join(", ")}`);
			return true;
		} catch (error) {
			warn(`Failed to set default animations: ${error}`);
			return false;
		}
	}

	/**
	 * Gets the current default animations.
	 *
	 * @returns Array of default animation keys
	 * @public
	 */
	public GetDefaultAnimations(): AnimationKey[] {
		return [...this.defaultAnimations];
	}

	/**
	 * Registers custom animations for a specific entity.
	 * These animations will be loaded in addition to the default animations.
	 * If the entity is already spawned, animations will be loaded immediately.
	 *
	 * @param entity - The SSEntity to register custom animations for
	 * @param animationKeys - Array of animation keys to load for this entity
	 * @returns True if registration was successful, false if entity was already registered
	 * @public
	 *
	 * @example
	 * ```typescript
	 * const success = animationService.RegisterModelAnimations(mageCharacter, ["Cast_Projectile", "Cast_Summon"]);
	 * if (success) {
	 *   print("Custom animations registered successfully");
	 * }
	 * ```
	 */
	public RegisterModelAnimations(entity: SSEntity, animationKeys: AnimationKey[]): boolean {
		if (this.entityAnimationMap.has(entity)) {
			warn(`Entity ${entity.Name} already has custom animations registered.`);
			return false;
		}

		this.entityAnimationMap.set(entity, animationKeys);

		// If the entity is already spawned, load the animations immediately
		if (entity.Parent) {
			this.loadAnimationsForEntity(entity, animationKeys);
		}

		print(`Registered custom animations for entity ${entity.Name}: ${animationKeys.join(", ")}`);
		return true;
	}

	/**
	 * Updates the custom animations for an existing entity.
	 * This will replace any previously registered custom animations.
	 *
	 * @param entity - The SSEntity to update animations for
	 * @param animationKeys - New array of animation keys to load for this entity
	 * @returns True if update was successful, false if entity was not registered
	 * @public
	 */
	public UpdateModelAnimations(entity: SSEntity, animationKeys: AnimationKey[]): boolean {
		if (!this.entityAnimationMap.has(entity)) {
			warn(
				`Entity ${entity.Name} does not have custom animations registered. Use RegisterModelAnimations instead.`,
			);
			return false;
		}

		this.entityAnimationMap.set(entity, animationKeys);

		// If the entity is already spawned, load the new animations
		if (entity.Parent) {
			this.loadAnimationsForEntity(entity, animationKeys);
		}

		print(`Updated custom animations for entity ${entity.Name}: ${animationKeys.join(", ")}`);
		return true;
	}

	/**
	 * Unregisters custom animations from an entity.
	 * This will not affect already loaded animation tracks, only future loading.
	 *
	 * @param entity - The SSEntity to unregister custom animations from
	 * @returns True if entity was found and unregistered, false if entity was not registered
	 * @public
	 */
	public unregisterModel(entity: SSEntity): boolean {
		if (this.entityAnimationMap.has(entity)) {
			this.entityAnimationMap.delete(entity);
			print(`Unregistered custom animations for entity ${entity.Name}`);
			return true;
		}
		return false;
	}

	/**
	 * Gets the custom animations registered for a specific entity.
	 *
	 * @param entity - The SSEntity to get animations for
	 * @returns Array of animation keys registered for this entity, or undefined if none
	 * @public
	 */
	public GetModelAnimations(entity: SSEntity): AnimationKey[] | undefined {
		const customAnimations = this.entityAnimationMap.get(entity);
		return customAnimations ? [...customAnimations] : undefined;
	}

	/**
	 * Gets all animations (default + custom) that would be loaded for an entity.
	 *
	 * @param entity - The SSEntity to get all animations for
	 * @returns Array of all animation keys that would be loaded for this entity
	 * @public
	 */
	public GetAllAnimationsForEntity(entity: SSEntity): AnimationKey[] {
		const customAnimations = this.entityAnimationMap.get(entity) || [];
		return [...this.defaultAnimations, ...customAnimations];
	}

	/**
	 * Forces animation loading for a specific entity.
	 * Useful for manually triggering animation loading if needed.
	 *
	 * @param entity - The SSEntity to load animations for
	 * @returns True if animations were loaded successfully
	 * @public
	 */
	public LoadAnimationsForEntity(entity: SSEntity): boolean {
		if (!isSSEntity(entity)) {
			warn(`Provided entity is not a valid SSEntity`);
			return false;
		}

		try {
			// Load default animations
			this.loadDefaultAnimations(entity);

			// Load custom animations if any
			const customAnimations = this.entityAnimationMap.get(entity);
			if (customAnimations) {
				this.loadAnimationsForEntity(entity, customAnimations);
			}

			return true;
		} catch (error) {
			warn(`Failed to load animations for entity ${entity.Name}: ${error}`);
			return false;
		}
	}
}

/**
 * Singleton instance of the AnimationService.
 * Use this instance for all animation-related operations in the server.
 *
 * @example
 * ```typescript
 * import { AnimationServiceInstance } from "server/services/animation-service";
 *
 * // Set default animations for all characters
 * AnimationServiceInstance.SetDefaultAnimations(["Punch_01", "Dodge", "TakeDamage"]);
 *
 * // Register custom animations for a specific character
 * AnimationServiceInstance.RegisterModelAnimations(mageCharacter, ["Cast_Projectile"]);
 * ```
 */
export const AnimationServiceInstance = AnimationService.Start();
