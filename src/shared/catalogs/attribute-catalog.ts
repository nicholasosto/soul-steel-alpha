/**
 * @fileoverview Attribute Catalog - Core character attributes and defaults
 * @module shared/catalogs/attribute-catalog
 * @layer Shared/Catalogs
 * @description
 * Defines base character attributes and default values for persistence/UI.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Persistence shape stored in ProfileService (only what we own long-term)
 */
export interface AttributePersistentData {
	base: Record<AttributeKey, number>;
	unspentPoints: number;
	version: number;
}

/** Sum of attribute points per key after all runtime layers */
export type AttributeTotals = Record<AttributeKey, number>;

/** Keys of per-point contribution fields */
export type ContributionKey = keyof AttributeContributions;

import { Computed, Value } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";

// ============================================================================
// CORE ATTRIBUTE DEFINITIONS
// ============================================================================

export const ATTRIBUTE_KEYS = ["Strength", "Agility", "Intelligence", "Vitality", "Spirit", "Luck"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Defines how each attribute point contributes to various character stats
 */
interface AttributeContributions {
	maxHealthPerPoint: number; // e.g., Vitality: 12
	manaPerPoint: number; // e.g., Spirit: 8
	staminaPerPoint: number; // e.g., Agility: 10
	physicalDamagePerPoint: number; // e.g., Strength: 0.6
	mysticalDamagePerPoint: number; // e.g., Intelligence: 0.8
	mentalDamagePerPoint: number; // e.g., Spirit: 0.4
	overallResistancePerPoint: number; // e.g., Spirit: 1
	critChancePerPoint: number; // e.g., Luck: 0.15
	dodgeChancePerPoint: number; // e.g., Agility: 0.1
	cooldownReductionPerPoint: number; // etc.
}

/**
 * Raw attribute values for data persistence and network transfer
 */
interface AttributeValues {
	base: number;
	equipment?: number;
	statusEffects?: number;
	temporary?: number; // e.g. potion buffs
}

/**
 * Reactive state values using Fusion for real-time UI updates
 */
interface AttributeStateValue {
	base: Value<number>;
	equipment?: Value<number>;
	statusEffects?: Value<number>;
	temporary?: Value<number>; // e.g. potion buffs
	total: Computed<number>;
}

/**
 * Display metadata for UI components (tooltips, icons, descriptions)
 */
export interface AttributeDisplayMeta {
	/** UI label */
	displayName: string;
	/** Short description for tooltips */
	description: string;
	/** Optional icon asset id */
	icon?: string;
	contributions?: Partial<AttributeContributions>;
}

/**
 * Data transfer object for network communication and persistence
 */
export type AttributeDTO = {
	[key in AttributeKey]: AttributeValues;
};

/**
 * Reactive state object for client-side UI and real-time updates
 */
export type AttributeState = {
	[key in AttributeKey]: AttributeStateValue;
};

// ============================================================================
// ATTRIBUTE CATALOG
// ============================================================================

/**
 * Main catalog defining all character attributes with their display metadata
 * and mechanical contributions to character stats. This file also defines
 * a persistence shape (AttributePersistentData), runtime DTO, and helpers
 * to resolve totals and convert to/from disk.
 */
export const AttributeCatalog: Record<AttributeKey, AttributeDisplayMeta> = {
	Strength: {
		displayName: "Strength",
		description: "Increases melee damage and carry capacity.",
		icon: ImageConstants.Attributes.Strength,
		contributions: {
			maxHealthPerPoint: 12,
			physicalDamagePerPoint: 0.6,
		},
	},
	Agility: {
		displayName: "Agility",
		description: "Improves movement speed and dodge chance.",
		icon: ImageConstants.Attributes.Agility,
		contributions: {
			dodgeChancePerPoint: 0.1,
		},
	},
	Intelligence: {
		displayName: "Intelligence",
		description: "Boosts ability power and resource efficiency.",
		icon: ImageConstants.Attributes.Intellect,
		contributions: {
			mysticalDamagePerPoint: 0.8,
			manaPerPoint: 8,
		},
	},
	Vitality: {
		displayName: "Vitality",
		description: "Raises maximum health and resistances.",
		icon: ImageConstants.Attributes.Vitality,
		contributions: {
			maxHealthPerPoint: 12,
			overallResistancePerPoint: 0.3,
		},
	},
	Spirit: {
		displayName: "Spirit",
		description: "Improves mana, stamina, or energy regeneration.",
		icon: ImageConstants.Attributes.Intellect,
		contributions: {
			manaPerPoint: 8,
			cooldownReductionPerPoint: 0.1,
			overallResistancePerPoint: 1,
		},
	},
	Luck: {
		displayName: "Luck",
		description: "Slightly increases crit rate and drop chances.",
		icon: ImageConstants.Attributes.Luck,
		contributions: {
			critChancePerPoint: 0.15,
			dodgeChancePerPoint: 0.05,
			overallResistancePerPoint: 0.5,
		},
	},
} as const satisfies Record<AttributeKey, AttributeDisplayMeta>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Create a default AttributeDTO with all attributes set to 0 */
export function makeDefaultAttributeDTO(): AttributeDTO {
	const dto: AttributeDTO = {} as AttributeDTO;
	for (const key of ATTRIBUTE_KEYS) {
		// Important: create a fresh object per key to avoid shared references
		dto[key] = { base: 0 };
	}
	return dto;
}

/**
 * Creates reactive Fusion state from AttributeDTO for client-side use
 * @param dto - Attribute data transfer object
 * @returns Reactive state with computed totals
 */
/* HELPER: Makes an Attribute state from a DTO - Used in player state -------------======- */
export function makeAttributeStateFromDTO(dto: AttributeDTO): AttributeState {
	const state: AttributeState = {} as AttributeState;

	for (const key of ATTRIBUTE_KEYS) {
		const baseVal = Value(dto[key].base);
		const equipmentVal = Value(dto[key].equipment ?? 0);
		const statusEffectsVal = Value(dto[key].statusEffects ?? 0);
		const temporaryVal = Value(dto[key].temporary ?? 0);
		const totalVal = Computed(() => {
			return baseVal.get() + equipmentVal.get() + statusEffectsVal.get() + temporaryVal.get();
		});
		state[key] = {
			base: baseVal,
			equipment: equipmentVal,
			statusEffects: statusEffectsVal,
			temporary: temporaryVal,
			total: totalVal,
		};
	}
	return state;
}

/**
 * Creates a default AttributeState with all values set to 0
 * @returns Default reactive attribute state
 */
/* DEFAULT: Attributes State -------------======- */
export function makeDefaultAttributeState(): AttributeState {
	const state: AttributeState = {} as AttributeState;
	const defaultDTO = makeDefaultAttributeDTO();
	return makeAttributeStateFromDTO(defaultDTO);
}

/** Default on-disk/persisted structure */
export function makeDefaultPersistent(): AttributePersistentData {
	const base = {} as Record<AttributeKey, number>;
	for (const key of ATTRIBUTE_KEYS) base[key] = 0;
	return { base, unspentPoints: 0, version: 1 };
}

/** Build a runtime DTO from persisted data (no transient bonuses) */
export function dtoFromPersistent(p: AttributePersistentData): AttributeDTO {
	const dto = {} as AttributeDTO;
	for (const key of ATTRIBUTE_KEYS) dto[key] = { base: p.base[key] ?? 0 };
	return dto;
}

/** Strip runtime-only layers back to what should be saved */
export function persistentFromDTO(dto: AttributeDTO, prev?: AttributePersistentData): AttributePersistentData {
	const base = {} as Record<AttributeKey, number>;
	for (const key of ATTRIBUTE_KEYS) base[key] = dto[key].base ?? 0;
	return { base, unspentPoints: prev?.unspentPoints ?? 0, version: prev?.version ?? 1 };
}

/** Resolve total points per attribute key (base + bonuses) */
export function resolveTotals(dto: AttributeDTO): AttributeTotals {
	const totals = {} as AttributeTotals;
	for (const key of ATTRIBUTE_KEYS) {
		const v = dto[key];
		totals[key] = (v.base ?? 0) + (v.equipment ?? 0) + (v.statusEffects ?? 0) + (v.temporary ?? 0);
	}
	return totals;
}

/**
 * Generic contribution aggregator. Sums (perPoint * totalPoints) across attributes.
 */
export function computeAttributeContributionSum(attributesDTO: AttributeDTO, contribution: ContributionKey): number {
	let sum = 0;
	for (const key of ATTRIBUTE_KEYS) {
		const perPoint = AttributeCatalog[key].contributions?.[contribution] ?? 0;
		if (perPoint === 0) continue;
		const v = attributesDTO[key];
		const totalPoints = (v.base ?? 0) + (v.equipment ?? 0) + (v.statusEffects ?? 0) + (v.temporary ?? 0);
		sum += perPoint * totalPoints;
	}
	return sum;
}

export const computeAttributeHealthBonus = (dto: AttributeDTO) =>
	computeAttributeContributionSum(dto, "maxHealthPerPoint");

export const computeAttributeManaBonus = (dto: AttributeDTO) => computeAttributeContributionSum(dto, "manaPerPoint");

export const computeAttributeStaminaBonus = (dto: AttributeDTO) =>
	computeAttributeContributionSum(dto, "staminaPerPoint");
