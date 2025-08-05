import { Computed, Value } from "@rbxts/fusion";
import { Definitions } from "@rbxts/net";
import ServerAsyncFunction from "@rbxts/net/out/server/ServerAsyncFunction";
export const RESOURCE_KEYS = ["Health", "Mana", "Stamina", "Experience"] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

/* Resource Meta - UI Display Shape for Resources */
export interface ResourceMeta {
	displayName: string; // User-friendly name for the resource
	description: string; // Detailed description of the resource
	icon: string; // Roblox asset ID for the resource icon
	color: Color3; // Color used for the resource bar
}

/* DTO for Resource Catalog */
export type ResourceDTO = {
	[key in ResourceKey]: {
		current: number; // Current value of the resource
		max: number; // Maximum value of the resource
	};
};

/* Resource State - Current Values for Resources */
export type ResourceState = {
	meta: ResourceMeta; // Metadata for the resource
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
	Experience: {
		displayName: "Experience",
		description: "The experience points of the player.",
		icon: "rbxassetid://123459",
		color: Color3.fromRGB(50, 220, 50),
	},
} satisfies Record<ResourceKey, ResourceMeta>;

export const makeDefaultResourceState = (): ResourceStateMap => {
	const resourceState: ResourceStateMap = {} as ResourceStateMap;
	for (const key of RESOURCE_KEYS) {
		resourceState[key] = {
			meta: ResourcesCatalog[key],
			current: Value(100), // Default current value, can be adjusted per resource
			max: Value(100), // Default max value, can be adjusted per resource
			percentage: Computed(() => resourceState[key].current.get() / resourceState[key].max.get()),
		};
	}
	return resourceState;
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

// Helper: Convert ResourceDTO to ResourceStateMap
export const makeDefaultResourceStateFromDTO = (dto: ResourceDTO): ResourceStateMap => {
	const resourceState: ResourceStateMap = {} as ResourceStateMap;
	for (const key of RESOURCE_KEYS) {
		resourceState[key] = {
			meta: ResourcesCatalog[key],
			current: Value(dto[key].current),
			max: Value(dto[key].max),
			percentage: Computed(() => resourceState[key].current.get() / resourceState[key].max.get()),
		};
	}
	return resourceState;
};

/* -- Remotes -- */
export const ResourceRemotes = Definitions.Create({
	FetchResources: Definitions.ServerAsyncFunction<() => ResourceDTO>(),
	ResourcesUpdated: Definitions.ServerToClientEvent<[ResourceDTO]>(),
});
