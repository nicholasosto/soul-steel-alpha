/**
 * @file src/shared/network/resource-remotes.ts
 * @module ResourceRemotes
 * @layer Shared/Network
 * @description Network definitions for resource management and combat systems
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Renamed from health-remotes to resource-remotes for clarity
 */

import { Definitions } from "@rbxts/net";
import {
	HealthChangeEvent,
	ResourceChangeEvent,
	PlayerResources,
	DamageInfo,
	HealingInfo,
	StatusEffect,
} from "shared/types/ResourceTypes";
import { SSEntity } from "shared/types";

/**
 * Resource management and combat related remote events and functions
 */
export const ResourceRemotes = Definitions.Create({
	// Health Changes
	HealthChanged: Definitions.ServerToClientEvent<[HealthChangeEvent]>(),
	ResourceChanged: Definitions.ServerToClientEvent<[ResourceChangeEvent]>(),

	// Damage and Healing
	DealDamage: Definitions.ServerAsyncFunction<(target: SSEntity, damageInfo: DamageInfo) => boolean>(),
	ApplyHealing: Definitions.ServerAsyncFunction<(target: SSEntity, healingInfo: HealingInfo) => boolean>(),

	// Resource Management
	GetPlayerResources: Definitions.ServerAsyncFunction<(playerId: string) => PlayerResources | undefined>(),
	ModifyResource:
		Definitions.ServerAsyncFunction<
			(target: SSEntity, resourceType: "health" | "mana" | "stamina", amount: number) => boolean
		>(),

	// Status Effects
	StatusEffectApplied: Definitions.ServerToClientEvent<[SSEntity, StatusEffect]>(),
	StatusEffectRemoved: Definitions.ServerToClientEvent<[SSEntity, string]>(), // entity, effect id
	GetStatusEffects: Definitions.ServerAsyncFunction<(target: SSEntity) => StatusEffect[]>(),

	// Combat Stats
	EntityDied: Definitions.ServerToClientEvent<[SSEntity, SSEntity | undefined]>(), // victim, killer
	EntityRevived: Definitions.ServerToClientEvent<[SSEntity]>(),

	// Client to Server requests
	RequestSuicide: Definitions.ClientToServerEvent<[]>(), // For debugging/testing
});
