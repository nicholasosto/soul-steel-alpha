/**
 * @file src/shared/network/enhanced-combat-remotes.ts
 * @module EnhancedCombatRemotes
 * @layer Shared/Network
 * @description Enhanced network definitions for damage container system and combat analytics
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.1.0
 * @lastUpdated 2025-08-01 - Enhanced combat damage flow implementation
 */

import { Definitions } from "@rbxts/net";
import { SSEntity } from "../types/SSEntity";
import {
	DamageContainer,
	DamageApplicationResult,
	RewardData,
	CombatMetrics,
	CombatAnalyticsData,
	CombatSessionId,
	DamageContainerId,
} from "../types/CombatFlowTypes";

/**
 * Enhanced combat remote events for damage container system
 */
export const EnhancedCombatRemotes = Definitions.Create({
	// Damage Container Lifecycle Events
	DamageContainerCreated: Definitions.ServerToClientEvent<[DamageContainer]>(),
	DamageContainerApplied: Definitions.ServerToClientEvent<[DamageContainer, DamageApplicationResult]>(),
	DamageContainerBlocked: Definitions.ServerToClientEvent<[DamageContainerId, SSEntity, string]>(),
	DamageContainerExpired: Definitions.ServerToClientEvent<[DamageContainerId]>(),

	// Combat Session Management
	CombatSessionStarted: Definitions.ServerToClientEvent<[CombatSessionId, SSEntity[]]>(),
	CombatSessionEnded: Definitions.ServerToClientEvent<[CombatSessionId, CombatAnalyticsData]>(),
	CombatSessionPaused: Definitions.ServerToClientEvent<[CombatSessionId]>(),
	CombatSessionResumed: Definitions.ServerToClientEvent<[CombatSessionId]>(),

	// Reward System Events
	CombatRewardsEarned: Definitions.ServerToClientEvent<[playerId: string, RewardData]>(),
	ExperienceGained: Definitions.ServerToClientEvent<[playerId: string, amount: number, source: string]>(),
	AchievementUnlocked: Definitions.ServerToClientEvent<[playerId: string, achievementId: string]>(),

	// Combat Analytics and Metrics
	CombatMetricsUpdated: Definitions.ServerToClientEvent<[playerId: string, CombatMetrics]>(),
	DamageNumbersDisplay: Definitions.ServerToClientEvent<[SSEntity, number, boolean, string]>(), // target, damage, isCrit, damageType

	// Enhanced Combat Actions (Client to Server)
	RequestEnhancedBasicAttack:
		Definitions.ClientToServerEvent<[target: SSEntity, weaponId?: string, context?: string]>(),
	RequestAbilityWithContext:
		Definitions.ClientToServerEvent<[abilityKey: string, target?: SSEntity, context?: string]>(),

	// Combat State Queries
	GetActiveDamageContainers: Definitions.ServerAsyncFunction<(entity: SSEntity) => DamageContainer[]>(),
	GetCombatSession:
		Definitions.ServerAsyncFunction<(sessionId: CombatSessionId) => CombatAnalyticsData | undefined>(),
	GetPlayerCombatMetrics: Definitions.ServerAsyncFunction<(playerId: string) => CombatMetrics | undefined>(),
	GetCombatHistory: Definitions.ServerAsyncFunction<(playerId: string, limit?: number) => CombatAnalyticsData[]>(),

	// Advanced Combat Features
	RequestComboExecution: Definitions.ClientToServerEvent<[comboId: string, targets: SSEntity[]]>(),
	CounterAttackAttempt: Definitions.ClientToServerEvent<[attackerId: SSEntity, windowStart: number]>(),
	EnvironmentalHazardTrigger: Definitions.ServerToClientEvent<[hazardId: string, affectedEntities: SSEntity[]]>(),

	// Debug and Testing (Development only)
	DebugCreateDamageContainer:
		Definitions.ClientToServerEvent<[source: SSEntity, target: SSEntity, baseDamage: number]>(),
	DebugForceApplyContainer: Definitions.ClientToServerEvent<[containerId: DamageContainerId]>(),
	DebugGetAllActiveSessions: Definitions.ServerAsyncFunction<() => CombatSessionId[]>(),
});
