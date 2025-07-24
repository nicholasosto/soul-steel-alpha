import { AbilityKey } from "shared/keys";
import { SSEntity } from "shared/types";

/**
 * @fileoverview Ability metadata definitions for the Soul Steel Alpha game system.
 *
 * This module defines the core interface for ability metadata, which contains all the
 * configuration data needed to define game abilities including their properties,
 * resource costs, and lifecycle callbacks.
 *
 * The optional callback methods in this interface will be implemented in a separate
 * ability catalog file and will utilize the game's effect system for handling
 * ability execution logic.
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

/**
 * Represents the complete metadata configuration for a game ability.
 *
 * This interface defines all the properties and callbacks needed to configure
 * an ability in the Soul Steel Alpha game system. The metadata includes basic
 * properties like cooldowns and costs, as well as optional lifecycle callbacks
 * that will be implemented through the effect system.
 *
 * @interface AbilityMeta
 * @example
 * ```typescript
 * const fireballMeta: AbilityMeta = {
 *   abilityKey: "FIREBALL",
 *   cooldown: 5,
 *   duration: 2,
 *   cost: 20,
 *   displayName: "Fireball",
 *   description: "Launches a blazing fireball at the target",
 *   icon: "rbxassetid://123456789",
 *   OnStartSuccess: (caster, target) => {
 *     // Effect system will handle the fireball creation
 *   }
 * };
 * ```
 */
export interface AbilityMeta {
	/** The unique identifier for this ability, used for registration and activation */
	abilityKey: AbilityKey;

	/** Cooldown time in seconds before the ability can be used again */
	cooldown: number; // Cooldown in seconds

	/** Duration in seconds that the ability effect lasts */
	duration: number; // Duration in seconds

	/** Resource cost required to activate the ability (e.g., mana, energy, stamina) */
	cost: number; // Resource cost, e.g., mana or energy

	/** User-friendly display name shown in the UI */
	displayName: string;

	/** Detailed description of the ability's effects and usage */
	description: string;

	/** Roblox asset ID for the ability's icon image */
	icon: string;

	/**
	 * Optional callback executed when the ability starts successfully.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity that activated the ability
	 * @param target - Optional target entity for the ability
	 */
	OnStartSuccess?: (entity: SSEntity, target?: SSEntity) => void;

	/**
	 * Optional callback executed when the ability fails to start.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity that attempted to activate the ability
	 */
	OnStartFailure?: (entity: SSEntity) => void;

	/**
	 * Optional callback executed when the ability is interrupted before completion.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity whose ability was interrupted
	 */
	OnInterrupt?: (entity: SSEntity) => void;

	/**
	 * Optional callback executed continuously while the ability is being held/charged.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity holding the ability
	 * @param holdTime - Time in seconds the ability has been held
	 */
	OnHold?: (entity: SSEntity, holdTime: number, target?: SSEntity) => void;

	/**
	 * Optional callback executed when the ability effect ends naturally.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity whose ability ended
	 */
	OnEnd?: (entity: SSEntity) => void;
}
