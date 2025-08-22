import { Computed, Value } from "@rbxts/fusion";
import { Definitions } from "@rbxts/net";
export const RESOURCE_KEYS = ["Health", "Mana", "Stamina"] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

/* Resource Meta - UI Display Shape for Resources */
export interface ResourceMeta {
	displayName: string; // User-friendly name for the resource
	description: string; // Detailed description of the resource
	icon: string; // Roblox asset ID for the resource icon
	color: Color3; // Color used for the resource bar
}

export type CurrentMax = {
	current: number; // Current value of the resource
	max: number; // Maximum value of the resource
};

/* DTO for Resource Catalog */
export type ResourceDTO = {
	[key in ResourceKey]: CurrentMax;
};

/* Resource State and State Map - Current Values for Resources */
export type ResourceState = {
	current: Value<number>; // Current value of the resource
	max: Value<number>; // Maximum value of the resource
	percentage: Computed<number>; // Percentage of current/max (0-1)
};
export type ResourceStateMap = {
	[Key in ResourceKey]: ResourceState; // Map of resource states by key
};

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
} satisfies Record<ResourceKey, ResourceMeta>;

/**
 * Regeneration configuration for each resource type that supports regen.
 * Values are per-second rates and pause delays in milliseconds.
 */
export type ResourceRegenRule = {
	regenPerSecond: number;
	pauseDelayMs: number; // how long to wait after consumption/damage before resuming regen
};

export const ResourceRegenConfig: Partial<Record<ResourceKey, ResourceRegenRule>> = {
	// Health regen is typically handled by Humanoid in Roblox; set to 0 here unless you choose to manage it yourself.
	Health: { regenPerSecond: 0, pauseDelayMs: 4000 },
	Mana: { regenPerSecond: 5, pauseDelayMs: 2000 },
	Stamina: { regenPerSecond: 10, pauseDelayMs: 1000 },
};

// Helper: make a default ResourceDTO
export const makeDefaultResourceDTO = (): ResourceDTO => {
	const resourceDTO: ResourceDTO = {} as ResourceDTO;
	for (const key of RESOURCE_KEYS) {
		resourceDTO[key] = {
			current: 100, // Default current value, can be adjusted per resource
			max: 100, // Default max value, can be adjusted per resource
		};
	}
	return resourceDTO;
};

// Helper: make resource state
const makeResourceState = (current: number, max: number): ResourceState => {
	const currentValue = Value(current);
	const maxValue = Value(max);
	const percentage = Computed(() => {
		return currentValue.get() / maxValue.get();
	});
	return {
		current: currentValue,
		max: maxValue,
		percentage: percentage,
	};
};

export const makeResourceStateFromDTO = (dto: ResourceDTO): ResourceStateMap => {
	const resourceState: ResourceStateMap = {} as ResourceStateMap;
	for (const key of RESOURCE_KEYS) {
		resourceState[key] = makeResourceState(dto[key].current, dto[key].max);
	}
	return resourceState;
};

export const makeDefaultResourceState = (): ResourceStateMap => {
	return makeResourceStateFromDTO(makeDefaultResourceDTO());
};

export function calculateMaxResourceValue(level: number, attributeValue1: number, attributeValue2: number): number {
	return level * attributeValue1 * 10 + attributeValue2 * 5;
}
