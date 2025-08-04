import { ResourceKey } from "shared/keys/resource-keys";
import { ResourceMeta } from "shared/meta/resources-meta";

export const ResourcesCatalog: Record<ResourceKey, ResourceMeta> = {
	Health: {
		displayName: "Health",
		description: "The health of the player.",
		icon: "rbxassetid://123456",
		color: Color3.fromRGB(220, 50, 50),
	},
	Mana: {
		displayName: "Mana",
		description: "The mana of the player.",
		icon: "rbxassetid://123457",
		color: Color3.fromRGB(50, 50, 220),
	},
	Stamina: {
		displayName: "Stamina",
		description: "The stamina of the player.",
		icon: "rbxassetid://123458",
		color: Color3.fromRGB(220, 220, 50),
	},
	Experience: {
		displayName: "Experience",
		description: "The experience points of the player.",
		icon: "rbxassetid://123459",
		color: Color3.fromRGB(50, 220, 50),
	},
} satisfies Record<ResourceKey, ResourceMeta>;
