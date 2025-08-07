/**
 * @file src/server/services/service-interfaces.ts
 * @module ServiceInterfaces
 * @layer Server/Services
 * @description Interface definitions for services to reduce coupling
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { AbilityKey } from "shared/catalogs";
import { SSEntity } from "shared/types";
import { ZoneKey } from "shared/keys";

/**
 * Interface for resource-related operations
 * Services should depend on this interface rather than the concrete ResourceService
 */
export interface IResourceOperations {
	modifyResource(entity: SSEntity, resourceType: string, amount: number): boolean;
	getResourceValue(entity: SSEntity, resourceType: string): number;
	setResourceValue(entity: SSEntity, resourceType: string, value: number): boolean;
}

/**
 * Interface for ability-related operations
 * Services should depend on this interface rather than the concrete AbilityService
 */
export interface IAbilityOperations {
	canActivateAbility(player: Player, abilityKey: AbilityKey): boolean;
	activateAbility(player: Player, abilityKey: AbilityKey): boolean;
	isAbilityOnCooldown(player: Player, abilityKey: AbilityKey): boolean;
}

/**
 * Interface for messaging operations
 * Services should depend on this interface rather than the concrete MessageService
 */
export interface IMessageOperations {
	sendInfoToPlayer(player: Player, message: string): void;
	sendWarningToPlayer(player: Player, message: string): void;
	sendErrorToPlayer(player: Player, message: string): void;
	sendServerWideMessage(message: string): void;
}

/**
 * Interface for data persistence operations
 * Services should depend on this interface rather than the concrete DataService
 */
export interface IDataOperations {
	getProfile(player: Player): unknown;
	saveProfile(player: Player): void;
	isProfileLoaded(player: Player): boolean;
}

/**
 * Interface for combat operations
 * Services should depend on this interface rather than the concrete CombatService
 */
export interface ICombatOperations {
	executeDamage(attacker: SSEntity, target: SSEntity, damage: number, weaponId?: string): boolean;
	startCombatSession(participants: SSEntity[]): string;
	endCombatSession(sessionId: string): void;
	isInCombat(entity: SSEntity): boolean;
}

/**
 * Interface for zone operations
 * Services should depend on this interface rather than the concrete ZoneService
 */
export interface IZoneOperations {
	createZone(zoneKey: ZoneKey, container: Model | Folder | BasePart): boolean;
	destroyZone(zoneKey: ZoneKey): boolean;
	setZoneActive(zoneKey: ZoneKey, active: boolean): boolean;
	getPlayersInZone(zoneKey: ZoneKey): Player[];
}
