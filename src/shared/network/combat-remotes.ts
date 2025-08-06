/**
 * @file src/shared/network/combat-remotes.ts
 * @module CombatRemotes
 * @layer Shared/Network
 * @description Network definitions for combat systems including weapons, attacks, and combos
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Definitions } from "@rbxts/net";
import { SSEntity } from "shared/types";

// Combat-specific event data types
export interface CombatHitEvent {
	attacker: SSEntity;
	target: SSEntity;
	weaponId: string;
	damage: number;
	isCritical: boolean;
	hitType: "basic_attack" | "weapon_skill" | "combo_finisher";
}

export interface ComboEvent {
	entity: SSEntity;
	comboId: string;
	currentStep: number;
	totalSteps: number;
	multiplier: number;
	isCompleted: boolean;
}

export interface WeaponEquipEvent {
	entity: SSEntity;
	weaponId: string;
	weaponName: string;
}

/**
 * Combat-related remote events and functions for client-server communication
 */
export const CombatRemotes = Definitions.Create({
	// Combat Actions - Client to Server
	ExecuteBasicAttack: Definitions.ClientToServerEvent<[target: SSEntity, weaponId?: string]>(),
	ExecuteWeaponSkill: Definitions.ClientToServerEvent<[skillId: string, target?: SSEntity]>(),
	RequestWeaponEquip: Definitions.ClientToServerEvent<[weaponId: string]>(),

	// Demo/Testing - Client to Server
	SpawnTestNPCs: Definitions.ClientToServerEvent<[]>(),

	// Combat Events - Server to Client
	CombatHit: Definitions.ServerToClientEvent<[CombatHitEvent]>(),
	CombatMiss: Definitions.ServerToClientEvent<[attacker: SSEntity, target: SSEntity, reason: string]>(),

	// Combo System - Bidirectional
	ComboStarted: Definitions.ServerToClientEvent<[ComboEvent]>(),
	ComboContinued: Definitions.ServerToClientEvent<[ComboEvent]>(),
	ComboCompleted: Definitions.ServerToClientEvent<[ComboEvent]>(),
	ComboFailed: Definitions.ServerToClientEvent<[entity: SSEntity, reason: string]>(),

	// Weapon System
	WeaponEquipped: Definitions.ServerToClientEvent<[WeaponEquipEvent]>(),
	WeaponUnequipped: Definitions.ServerToClientEvent<[entity: SSEntity, weaponId: string]>(),

	// Combat State Queries
	GetCombatStats: Definitions.ServerAsyncFunction<(entity: SSEntity) => Record<string, unknown> | undefined>(),
	GetEquippedWeapon: Definitions.ServerAsyncFunction<(entity: SSEntity) => string | undefined>(),
	GetActiveCombos: Definitions.ServerAsyncFunction<(entity: SSEntity) => ComboEvent[]>(),

	// Combat Session Management
	CombatSessionStarted: Definitions.ServerToClientEvent<[sessionId: string, participants: SSEntity[]]>(),
	CombatSessionEnded: Definitions.ServerToClientEvent<[sessionId: string, winner?: SSEntity]>(),

	// Turn-based Combat (for future implementation)
	TurnStarted: Definitions.ServerToClientEvent<[sessionId: string, currentTurn: SSEntity]>(),
	TurnEnded: Definitions.ServerToClientEvent<[sessionId: string, previousTurn: SSEntity]>(),
});
