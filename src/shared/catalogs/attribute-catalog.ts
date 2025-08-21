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
	},
	Agility: {
		displayName: "Agility",
		description: "Improves movement speed and dodge chance.",
		icon: ImageConstants.Attributes.Agility,
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
	},
	Spirit: {
		displayName: "Spirit",
		description: "Improves mana, stamina, or energy regeneration.",
		icon: ImageConstants.Attributes.Intellect,
	},
	Luck: {
		displayName: "Luck",
		description: "Slightly increases crit rate and drop chances.",
		icon: ImageConstants.Attributes.Luck,
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
