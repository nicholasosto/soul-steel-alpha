/**
 * @file src/shared/types/combat-flow-types.ts
 * @module CombatFlowTypes
 * @layer Shared/Types
 * @description Enhanced combat flow types for damage container system and reward tracking
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.1.0
 * @lastUpdated 2025-08-01 - Enhanced combat damage flow implementation
 */

import { SSEntity } from "./SSEntity";
import { DamageInfo, DamageType } from "./ResourceTypes";
import { AbilityKey } from "shared/catalogs";

/**
 * Unique identifier for damage containers
 */
export type DamageContainerId = string;

/**
 * Combat session identifier for tracking related combat events
 */
export type CombatSessionId = string;

/**
 * Processing status of a damage container
 */
export type DamageContainerStatus = "pending" | "applied" | "blocked" | "failed" | "expired";

/**
 * Enhanced damage container that tracks damage from creation to application
 */
export interface DamageContainer {
	/** Unique identifier for this damage container */
	id: DamageContainerId;

	/** Timestamp when container was created */
	timestamp: number;

	/** Combat session this damage belongs to */
	sessionId: CombatSessionId;

	// Source Information
	/** Entity that initiated the damage */
	source: SSEntity;

	/** Ability that caused the damage (if applicable) */
	sourceAbility?: AbilityKey;

	/** Weapon used for the attack (if applicable) */
	weaponId?: string;

	// Target Information
	/** Primary target of the damage */
	primaryTarget: SSEntity;

	/** Additional targets for AOE abilities */
	secondaryTargets?: SSEntity[];

	// Damage Data
	/** Base damage before modifiers */
	baseDamage: number;

	/** Type of damage for resistance calculations */
	damageType: DamageType;

	/** Whether this damage can critically hit */
	canCrit: boolean;

	/** Damage multipliers to apply */
	multipliers: number[];

	/** Status effects to apply on hit */
	statusEffects?: StatusEffectApplication[];

	// Processing State
	/** Current processing status */
	status: DamageContainerStatus;

	/** Final damage amounts applied to each target */
	appliedDamage?: Map<SSEntity, number>;

	/** Targets that were critically hit */
	criticalHits?: SSEntity[];

	/** Targets that blocked/resisted the damage */
	blockedTargets?: SSEntity[];

	// Combat Context
	/** Combo step if part of a combo chain */
	comboStep?: number;

	/** Total combo multiplier */
	comboMultiplier?: number;

	/** Whether this was a counter-attack */
	isCounterAttack?: boolean;

	/** Environmental factors affecting damage */
	environmentalModifiers?: EnvironmentalModifier[];
}

/**
 * Status effect to apply when damage container is processed
 */
export interface StatusEffectApplication {
	/** Effect identifier */
	effectId: string;

	/** Duration in seconds */
	duration: number;

	/** Chance to apply (0-1) */
	applicationChance: number;

	/** Whether effect stacks with existing effects */
	canStack: boolean;
}

/**
 * Environmental factors that can modify damage
 */
export interface EnvironmentalModifier {
	/** Type of environmental factor */
	type: "weather" | "terrain" | "lighting" | "zone_effect";

	/** Damage multiplier */
	multiplier: number;

	/** Description for combat log */
	description: string;
}

/**
 * Result of applying a damage container
 */
export interface DamageApplicationResult {
	/** Container that was processed */
	containerId: DamageContainerId;

	/** Whether application was successful */
	success: boolean;

	/** Reason for failure (if applicable) */
	failureReason?: string;

	/** Results for each target */
	targetResults: Map<SSEntity, TargetDamageResult>;

	/** Total damage dealt across all targets */
	totalDamageDealt: number;

	/** Experience points earned */
	experienceEarned: number;

	/** Special achievements triggered */
	achievementsTriggered?: string[];

	/** Combat metrics for analytics */
	metrics: CombatMetrics;
}

/**
 * Damage result for a single target
 */
export interface TargetDamageResult {
	/** Target entity */
	target: SSEntity;

	/** Final damage dealt */
	damageDealt: number;

	/** Whether the hit was critical */
	wasCritical: boolean;

	/** Whether damage was blocked/resisted */
	wasBlocked: boolean;

	/** Percentage of damage blocked */
	blockPercentage: number;

	/** Status effects applied */
	statusEffectsApplied: string[];

	/** Whether target died from this damage */
	targetKilled: boolean;
}

/**
 * Combat metrics for performance tracking and rewards
 */
export interface CombatMetrics {
	/** Accuracy rating (0-1) */
	accuracy: number;

	/** Critical hit rate (0-1) */
	criticalRate: number;

	/** Average damage per hit */
	averageDamage: number;

	/** Damage per second rating */
	dps: number;

	/** Combo efficiency (0-1) */
	comboEfficiency: number;

	/** Overkill damage (damage beyond what was needed) */
	overkillDamage: number;

	/** Number of targets hit */
	targetsHit: number;

	/** Combat duration in seconds */
	combatDuration: number;
}

/**
 * Context information for damage containers
 */
export interface CombatContext {
	/** Combat session ID */
	sessionId: CombatSessionId;

	/** Current combo information */
	comboInfo?: {
		comboId: string;
		currentStep: number;
		totalSteps: number;
		multiplier: number;
	};

	/** Environmental conditions */
	environment?: {
		weather: string;
		terrain: string;
		lighting: "day" | "night" | "dim";
		temperature: number;
	};

	/** PvP or PvE context */
	combatType: "pvp" | "pve" | "training";

	/** Difficulty modifier for PvE */
	difficultyMultiplier?: number;
}

/**
 * Reward data calculated from combat performance
 */
export interface RewardData {
	/** Base experience points */
	baseExperience: number;

	/** Bonus experience from performance */
	bonusExperience: number;

	/** Total experience earned */
	totalExperience: number;

	/** Currency rewards */
	currency: {
		gold: number;
		souls: number;
		tokens: number;
	};

	/** Items earned */
	items: ItemReward[];

	/** Achievement progress */
	achievementProgress: AchievementProgress[];

	/** Reputation changes */
	reputation: ReputationChange[];
}

/**
 * Item reward from combat
 */
export interface ItemReward {
	/** Item identifier */
	itemId: string;

	/** Quantity earned */
	quantity: number;

	/** Quality/rarity of the item */
	quality: "common" | "uncommon" | "rare" | "epic" | "legendary";

	/** Drop chance that was overcome */
	dropChance: number;
}

/**
 * Achievement progress update
 */
export interface AchievementProgress {
	/** Achievement identifier */
	achievementId: string;

	/** Progress before this combat */
	previousProgress: number;

	/** Progress after this combat */
	currentProgress: number;

	/** Whether achievement was completed */
	completed: boolean;
}

/**
 * Reputation change with a faction or group
 */
export interface ReputationChange {
	/** Faction identifier */
	factionId: string;

	/** Reputation change amount */
	change: number;

	/** New total reputation */
	newTotal: number;

	/** Reason for the change */
	reason: string;
}

/**
 * Combat analytics data for balancing and insights
 */
export interface CombatAnalyticsData {
	/** Session identifier */
	sessionId: CombatSessionId;

	/** Participants in the combat */
	participants: SSEntity[];

	/** Start and end timestamps */
	startTime: number;
	endTime: number;

	/** All damage containers processed */
	damageContainers: DamageContainer[];

	/** Final results and metrics */
	results: DamageApplicationResult[];

	/** Overall session metrics */
	sessionMetrics: SessionMetrics;
}

/**
 * Session-level combat metrics
 */
export interface SessionMetrics {
	/** Total damage dealt by all participants */
	totalDamage: number;

	/** Number of attacks attempted */
	attacksAttempted: number;

	/** Number of successful hits */
	successfulHits: number;

	/** Overall accuracy */
	overallAccuracy: number;

	/** Average time between attacks */
	averageAttackInterval: number;

	/** Most damaging attack */
	highestDamage: number;

	/** Most effective ability */
	mostEffectiveAbility?: AbilityKey;

	/** Winner of the session (if applicable) */
	winner?: SSEntity;
}
