/**
 * @file src/shared/network/resource-dto-remotes.ts
 * @module ResourceDTORemotes
 * @layer Shared/Network
 * @description DTO-based network definitions for resource management systems
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Initial DTO-based remote implementation
 */

import { Definitions } from "@rbxts/net";
import { ResourceDTO, ResourceChangeDTO, HealthChangeDTO } from "shared/dtos/ResourceDTO";

/**
 * DTO-based resource management remote events and functions
 */
export const ResourceDTORemotes = Definitions.Create({
	// Resource State Management
	/** Server pushes complete resource state to clients */
	ResourcesUpdated: Definitions.ServerToClientEvent<[ResourceDTO]>(),

	/** Server pushes resource changes to clients */
	ResourceChanged: Definitions.ServerToClientEvent<[ResourceChangeDTO]>(),

	/** Server pushes health-specific changes to clients */
	HealthChanged: Definitions.ServerToClientEvent<[HealthChangeDTO]>(),

	// Resource Fetching
	/** Client requests current resource state */
	FetchResources: Definitions.ServerAsyncFunction<() => ResourceDTO>(),

	// Resource Modification (for abilities, admin commands, etc.)
	/** Modify a specific resource by amount */
	ModifyResource:
		Definitions.ServerAsyncFunction<(resourceType: "health" | "mana" | "stamina", amount: number) => boolean>(),

	// Utility/Debug
	/** Request suicide for testing purposes */
	RequestSuicide: Definitions.ServerToClientEvent<[]>(),
});
