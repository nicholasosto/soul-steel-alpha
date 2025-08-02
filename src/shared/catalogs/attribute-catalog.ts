import { ImageConstants } from "shared/asset-ids";
import { AttributeKey } from "shared/keys";
import { AttributeMeta } from "shared/meta";

export const AttributeCatalog: Record<AttributeKey, AttributeMeta> = {
	["vitality"]: {
		displayName: "Vitality",
		description: "Increases maximum health points.",
		icon: ImageConstants.Attributes.Vitality,
	},
	["strength"]: {
		displayName: "Strength",
		description: "Increases physical damage dealt.",
		icon: ImageConstants.Attributes.Strength,
	},
	["agility"]: {
		displayName: "Agility",
		description: "Increases accuracy and evasion.",
		icon: ImageConstants.Attributes.Agility,
	},
	["intellect"]: {
		displayName: "Intellect",
		description: "Increases magic damage dealt.",
		icon: ImageConstants.Attributes.Intellect,
	},
	["luck"]: {
		displayName: "Luck",
		description: "Increases chance for critical hits.",
		icon: ImageConstants.Attributes.Luck,
	},
} as const satisfies Record<AttributeKey, AttributeMeta>;

export function getAttributeMeta(key: AttributeKey): AttributeMeta {
	if (!(key in AttributeCatalog)) {
		throw error(`Attribute key "${key}" does not exist in the catalog.`);
	}
	return AttributeCatalog[key];
}
