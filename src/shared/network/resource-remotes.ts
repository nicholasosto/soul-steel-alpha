/**
 * @file src/shared/network/resource-remotes.ts
 * @module ResourceRemotes
 * @layer Shared/Network
 * @description Network definitions for resource management and combat systems
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-04 - Renamed from health-remotes to resource-remotes for clarity
 */

import { Definitions } from "@rbxts/net";
import { ResourceDTO } from "shared/catalogs/resources-catalog";

/**
 * DTO-based resource management remote events and functions
 */
export const ResourceRemotes = Definitions.Create({
	// Resource State Management
	/** Server pushes complete resource state to clients */
	ResourcesUpdated: Definitions.ServerToClientEvent<[ResourceDTO]>(),

	// Resource Fetching
	/** Client requests current resource state */
	FetchResources: Definitions.ServerAsyncFunction<() => ResourceDTO>(),

	// Resource Modification (for abilities, admin commands, etc.)
	/** Modify a specific resource by amount */
	ModifyResource:
		Definitions.ServerAsyncFunction<(resourceType: "health" | "mana" | "stamina", amount: number) => boolean>(),
});
