/**
 * @file src/shared/dtos/ResourceDTO.ts
 * @module ResourceDTO
 * @layer Shared/DTOs
 * @description Data Transfer Object for player resources (health, mana, stamina)
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Initial DTO implementation for resource system
 */

/**
 * Data Transfer Object for player resource state
 * Represents a snapshot of all player resources at a point in time
 */
export interface ResourceDTO {
	/** Current health points */
	health: number;
	/** Maximum health points */
	maxHealth: number;
	/** Current mana points for ability casting */
	mana: number;
	/** Maximum mana points */
	maxMana: number;
	/** Current stamina for physical actions */
	stamina: number;
	/** Maximum stamina points */
	maxStamina: number;
	/** Timestamp when this DTO was created (for freshness validation) */
	timestamp?: number;
}

/**
 * Resource change notification DTO
 * Used when specific resources change to notify clients
 */
export interface ResourceChangeDTO {
	/** Type of resource that changed */
	resourceType: "health" | "mana" | "stamina";
	/** Previous value */
	previousValue: number;
	/** New value */
	newValue: number;
	/** Amount of change (positive or negative) */
	change: number;
	/** Source of the change (ability, damage, regen, etc.) */
	source?: string;
	/** Timestamp of the change */
	timestamp: number;
}

/**
 * Health-specific change notification DTO
 * Used for health changes that need special handling (damage effects, etc.)
 */
export interface HealthChangeDTO {
	/** Previous health value */
	previousHealth: number;
	/** New health value */
	newHealth: number;
	/** Amount of change (negative for damage, positive for healing) */
	change: number;
	/** Source of the health change */
	source?: string;
	/** Type of health change for UI effects */
	changeType: "damage" | "healing" | "regeneration" | "drain" | "environmental" | "ability";
	/** Timestamp of the change */
	timestamp: number;
}

/**
 * Utility type for partial resource updates
 * Used when only some resources need to be updated
 */
export type PartialResourceDTO = Partial<Omit<ResourceDTO, "timestamp">> & {
	timestamp: number;
};
