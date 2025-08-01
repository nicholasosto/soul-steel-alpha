/**
 * @file src/shared/types/resource-types.ts
 * @module ResourceTypes
 * @layer Shared/Types
 * @description Type definitions for resource management systems (health, mana, stamina, etc.)
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Renamed from health-types to resource-types for clarity
 */

import { SSEntity } from "./SSEntity";

/**
 * Player resource states including health, mana, and stamina
 */
export interface PlayerResources {
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
}

/**
 * Health change event data
 */
export interface HealthChangeEvent {
	/** The entity whose health changed */
	entity: SSEntity;
	/** Previous health value */
	previousHealth: number;
	/** New health value */
	newHealth: number;
	/** Amount of change (positive for healing, negative for damage) */
	change: number;
	/** Source of the health change (ability key, environmental, etc.) */
	source?: string;
	/** Type of health change */
	changeType: HealthChangeType;
}

/**
 * Types of health changes for different effects and UI feedback
 */
export type HealthChangeType = "damage" | "healing" | "regeneration" | "drain" | "environmental" | "ability";

/**
 * Resource change event data (mana, stamina)
 */
export interface ResourceChangeEvent {
	/** The entity whose resource changed */
	entity: SSEntity;
	/** Type of resource that changed */
	resourceType: ResourceType;
	/** Previous resource value */
	previousValue: number;
	/** New resource value */
	newValue: number;
	/** Amount of change */
	change: number;
	/** Source of the resource change */
	source?: string;
}

/**
 * Resource types for different player systems
 */
export type ResourceType = "health" | "mana" | "stamina";

/**
 * Combat stats that affect health calculations
 */
export interface CombatStats {
	/** Base attack power for damage dealing */
	attackPower: number;
	/** Defense rating for damage reduction */
	defense: number;
	/** Critical hit chance (0-1) */
	criticalChance: number;
	/** Critical hit damage multiplier */
	criticalMultiplier: number;
	/** Health regeneration per second */
	healthRegen: number;
	/** Mana regeneration per second */
	manaRegen: number;
	/** Stamina regeneration per second */
	staminaRegen: number;
}

/**
 * Damage calculation parameters
 */
export interface DamageInfo {
	/** Base damage amount */
	baseDamage: number;
	/** Type of damage for resistance calculations */
	damageType: DamageType;
	/** Entity dealing the damage */
	source?: SSEntity;
	/** Ability or source identifier */
	sourceId?: string;
	/** Whether this damage can critically hit */
	canCrit: boolean;
	/** Additional multipliers to apply */
	multipliers?: number[];
}

/**
 * Types of damage for resistance and effect systems
 */
export type DamageType = "physical" | "magical" | "fire" | "ice" | "earth" | "soul" | "pure";

/**
 * Healing calculation parameters
 */
export interface HealingInfo {
	/** Base healing amount */
	baseHealing: number;
	/** Type of healing for bonus calculations */
	healingType: HealingType;
	/** Entity providing the healing */
	source?: SSEntity;
	/** Ability or source identifier */
	sourceId?: string;
	/** Whether this healing can critically heal */
	canCrit: boolean;
	/** Additional multipliers to apply */
	multipliers?: number[];
}

/**
 * Types of healing for bonus calculations
 */
export type HealingType = "direct" | "regeneration" | "lifesteal" | "ability" | "item";

/**
 * Status effect that can modify health/resources over time
 */
export interface StatusEffect {
	/** Unique identifier for this status effect */
	id: string;
	/** Display name of the effect */
	name: string;
	/** Duration in seconds (-1 for permanent) */
	duration: number;
	/** Time remaining in seconds */
	timeRemaining: number;
	/** Effect type for icon and behavior */
	effectType: StatusEffectType;
	/** Health change per tick (if any) */
	healthPerTick?: number;
	/** Mana change per tick (if any) */
	manaPerTick?: number;
	/** Stamina change per tick (if any) */
	staminaPerTick?: number;
	/** Tick interval in seconds */
	tickInterval: number;
	/** Stat modifiers applied while active */
	statModifiers?: Partial<CombatStats>;
	/** Whether this effect can be dispelled */
	canDispel: boolean;
	/** Source entity that applied this effect */
	source?: SSEntity;
}

/**
 * Categories of status effects for organization and dispelling
 */
export type StatusEffectType = "buff" | "debuff" | "dot" | "hot" | "crowd_control" | "enhancement";
