/**
 * @fileoverview Attribute Catalog - Core character attributes and defaults
 * @module shared/catalogs/attribute-catalog
 * @layer Shared/Catalogs
 * @description
 * Defines base character attributes and default values for persistence/UI.
 */

import { Value } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";

export const ATTRIBUTE_KEYS = ["Strength", "Agility", "Intelligence", "Vitality", "Spirit", "Luck"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export interface AttributeDisplayMeta {
	/** UI label */
	displayName: string;
	/** Short description for tooltips */
	description: string;
	/** Optional icon asset id */
	icon?: string;
	/** Optional: what stats this attribute contributes to, and by how much per point */
	contributes?: Partial<{
		maxHealthPerPoint: number; // e.g., Vitality: 12
		physicalDamagePerPoint: number; // e.g., Strength: 0.6
		mysticalDamagePerPoint: number; // e.g., Intelligence: 0.8
		mentalDamagePerPoint: number; // e.g., Spirit: 0.4
		overallResistancePerPoint: number; // e.g., Spirit: 1
		critChancePerPoint: number; // e.g., Luck: 0.15
		dodgeChancePerPoint: number; // e.g., Agility: 0.1
		manaPerPoint: number; // e.g., Spirit: 8
		cooldownReductionPerPoint: number; // etc.
	}>;
}

export type AttributeDTO = {
	[key in AttributeKey]: number;
};

export type AttributeState = {
	[key in AttributeKey]: Value<number>;
};

export const AttributeCatalog: Record<AttributeKey, AttributeDisplayMeta> = {
	Strength: {
		displayName: "Strength",
		description: "Increases melee damage and carry capacity.",
		icon: ImageConstants.Attributes.Strength,
		contributes: { physicalDamagePerPoint: 0.6, maxHealthPerPoint: 5 },
	},
	Agility: {
		displayName: "Agility",
		description: "Improves movement speed and dodge chance.",
		icon: ImageConstants.Attributes.Agility,
		contributes: { maxHealthPerPoint: 5, physicalDamagePerPoint: 0.6, dodgeChancePerPoint: 0.1 },
	},
	Intelligence: {
		displayName: "Intelligence",
		description: "Boosts ability power and resource efficiency.",
		icon: ImageConstants.Attributes.Intellect,
	},
	Vitality: {
		displayName: "Vitality",
		description: "Raises maximum health and resistances.",
		icon: ImageConstants.Attributes.Vitality,
		contributes: { maxHealthPerPoint: 12, physicalDamagePerPoint: 0.4 },
	},
	Spirit: {
		displayName: "Spirit",
		description: "Improves mana, stamina, or energy regeneration.",
		icon: ImageConstants.Attributes.Intellect,
		contributes: { manaPerPoint: 8, cooldownReductionPerPoint: 0.1, overallResistancePerPoint: 1 },
	},
	Luck: {
		displayName: "Luck",
		description: "Slightly increases crit rate and drop chances.",
		icon: ImageConstants.Attributes.Luck,
		contributes: { critChancePerPoint: 0.15, overallResistancePerPoint: 0.5, dodgeChancePerPoint: 0.05 },
	},
} as const satisfies Record<AttributeKey, AttributeDisplayMeta>;

/** Create a default AttributeDTO with all attributes set to 0 */
export function makeDefaultAttributeDTO(): AttributeDTO {
	const dto: AttributeDTO = {} as AttributeDTO;
	for (const key of ATTRIBUTE_KEYS) dto[key] = 5;
	return dto;
}

export function makeAttributeStateFromDTO(dto: AttributeDTO): AttributeState {
	const state: AttributeState = {} as AttributeState;
	for (const key of ATTRIBUTE_KEYS) {
		state[key] = Value(dto[key]);
	}
	return state;
}

export function makeDefaultAttributeState(): AttributeState {
	const state: AttributeState = {} as AttributeState;
	for (const key of ATTRIBUTE_KEYS) {
		state[key] = Value(5);
	}
	return state;
}
