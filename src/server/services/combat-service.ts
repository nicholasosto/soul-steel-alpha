/**
 * @file src/server/services/combat-service.ts
 * @module CombatService
 * @layer Server/Services
 * @description Server-side combat management service
 *
 * This service manages the server-side logic for combat system including:
 * - Basic attack execution and validation
 * - Damage calculation and application
 * - Combat session management
 * - Integration with ResourceService for health/damage
 * - Integration with AbilityService for ability-based combat
 *
 * The service follows a singleton pattern and integrates with the game's
 * remote system for secure client-server combat communication.
 *
 * @author Soul Steel Alpha Development Team
 * @since 2.0.0
 * @created 2025-08-06 - Initial implementation
 */

import { Players, Workspace, HttpService } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { CombatRemotes, CombatHitEvent, WeaponEquipEvent } from "shared/network";
import { MessageType, MessageMetaRecord } from "shared/types";
import { ResourceServiceInstance } from "./resource-service";
import { MessageServiceInstance } from "./message-service";
import { NPCDemoServiceInstance } from "./npc-demo-service";

/**
 * Combat session data structure
 */
interface CombatSession {
	sessionId: string;
	participants: SSEntity[];
	startTime: number;
	isActive: boolean;
}

/**
 * Weapon data structure
 */
interface WeaponData {
	id: string;
	name: string;
	baseDamage: number;
	criticalChance: number;
	criticalMultiplier: number;
}

/**
 * Server-side combat management service.
 *
 * This singleton service handles all server-side combat operations including
 * attack execution, damage calculation, combat session management, and weapon
 * handling. It integrates with ResourceService for health management and
 * provides secure combat validation.
 *
 * @class CombatService
 * @example
 * ```typescript
 * // Start combat service
 * const service = CombatService.GetInstance();
 * service.Initialize();
 *
 * // Service automatically handles client combat requests
 * ```
 */
class CombatService {
	/** Singleton instance of the CombatService */
	private static instance: CombatService | undefined;

	/** Active combat sessions */
	private activeSessions = new Map<string, CombatSession>();

	/** Entity weapon mappings */
	private equippedWeapons = new Map<SSEntity, string>();

	/** Default weapon catalog */
	private readonly DEFAULT_WEAPONS: Record<string, WeaponData> = {
		fists: {
			id: "fists",
			name: "Fists",
			baseDamage: 10,
			criticalChance: 0.05, // 5%
			criticalMultiplier: 1.5,
		},
		basic_sword: {
			id: "basic_sword",
			name: "Basic Sword",
			baseDamage: 25,
			criticalChance: 0.1, // 10%
			criticalMultiplier: 2.0,
		},
		soul_blade: {
			id: "soul_blade",
			name: "Soul Blade",
			baseDamage: 40,
			criticalChance: 0.15, // 15%
			criticalMultiplier: 2.5,
		},
	};

	private constructor() {}

	/**
	 * Get the singleton instance of CombatService
	 */
	public static GetInstance(): CombatService {
		if (!CombatService.instance) {
			CombatService.instance = new CombatService();
		}
		return CombatService.instance;
	}

	/**
	 * Initialize the combat service and set up network connections
	 */
	public Initialize(): void {
		this.setupNetworkConnections();
		print("CombatService: Initialized successfully");
	}

	/**
	 * Create a properly formatted message
	 */
	private createMessage(
		content: string,
		severity: "info" | "warning" | "error" | "success" | "prompt",
		title = "",
	): MessageType {
		const meta = MessageMetaRecord[severity];
		return {
			id: HttpService.GenerateGUID(false),
			timestamp: tick(),
			title,
			content,
			severity: meta.severity,
			textColor: meta.textColor,
		};
	}

	/**
	 * Set up network connections for combat remotes
	 */
	private setupNetworkConnections(): void {
		// Basic attack handler
		CombatRemotes.Server.Get("ExecuteBasicAttack").Connect((player, target, weaponId) => {
			this.handleBasicAttack(player, target, weaponId);
		});

		// Weapon equip handler
		CombatRemotes.Server.Get("RequestWeaponEquip").Connect((player, weaponId) => {
			this.handleWeaponEquip(player, weaponId);
		});

		// Demo/Testing - NPC spawn handler
		CombatRemotes.Server.Get("SpawnTestNPCs").Connect((player) => {
			NPCDemoServiceInstance.SpawnNPCsForPlayer(player);
		});

		// Combat state query handlers
		CombatRemotes.Server.Get("GetCombatStats").SetCallback((player, entity) => {
			return this.getCombatStats(entity);
		});

		CombatRemotes.Server.Get("GetEquippedWeapon").SetCallback((player, entity) => {
			return this.getEquippedWeapon(entity);
		});

		CombatRemotes.Server.Get("GetActiveCombos").SetCallback((player, entity) => {
			// TODO: Implement combo system
			return [];
		});

		// Player cleanup
		Players.PlayerRemoving.Connect((player) => {
			const character = player.Character;
			if (character && isSSEntity(character)) {
				this.cleanupPlayer(character);
			}
		});
	}

	/**
	 * Handle basic attack execution
	 */
	private handleBasicAttack(attacker: Player, target: SSEntity, weaponId?: string): void {
		// Get attacker character
		const attackerCharacter = attacker.Character;
		if (!attackerCharacter || !isSSEntity(attackerCharacter)) {
			warn(`CombatService: Invalid attacker character for ${attacker.Name}`);
			return;
		}

		// Validate target
		if (!isSSEntity(target)) {
			warn(`CombatService: Invalid target for attack from ${attacker.Name}`);
			return;
		}

		// Prevent self-attack
		if (attackerCharacter === target) {
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage("You cannot attack yourself!", "warning"),
			);
			return;
		}

		// Get weapon data - fix lua truthiness check
		const equippedWeapon = this.getEquippedWeapon(attackerCharacter);
		const weaponToUse = weaponId !== undefined ? weaponId : equippedWeapon !== undefined ? equippedWeapon : "fists";
		const weapon = this.getWeaponData(weaponToUse);

		// Calculate damage
		const damage = this.calculateDamage(attackerCharacter, target, weapon);
		const isCritical = this.rollCritical(weapon);
		const finalDamage = isCritical ? damage * weapon.criticalMultiplier : damage;

		// Apply damage through ResourceService
		const success = this.applyDamage(target, finalDamage);

		if (success) {
			// Create combat hit event
			const hitEvent: CombatHitEvent = {
				attacker: attackerCharacter,
				target,
				weaponId: weapon.id,
				damage: finalDamage,
				isCritical,
				hitType: "basic_attack",
			};

			// Broadcast combat hit to all clients
			CombatRemotes.Server.Get("CombatHit").SendToAllPlayers(hitEvent);

			// Send feedback messages
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(
					`You dealt ${finalDamage} damage to ${target.Name}${isCritical ? " (Critical!)" : ""}`,
					"info",
				),
			);

			if (target.IsA("Player")) {
				MessageServiceInstance.SendMessageToPlayer(
					target,
					this.createMessage(
						`You took ${finalDamage} damage from ${attacker.Name}${isCritical ? " (Critical!)" : ""}`,
						"warning",
					),
				);
			}

			print(`CombatService: ${attacker.Name} dealt ${finalDamage} damage to ${target.Name}`);
		} else {
			// Attack missed or failed
			CombatRemotes.Server.Get("CombatMiss").SendToAllPlayers(attackerCharacter, target, "Target dodged");

			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`Your attack missed ${target.Name}!`, "warning"),
			);
		}
	}

	/**
	 * Handle weapon equip request
	 */
	private handleWeaponEquip(player: Player, weaponId: string): void {
		const playerCharacter = player.Character;
		if (!playerCharacter || !isSSEntity(playerCharacter)) {
			warn(`CombatService: Invalid player character for weapon equip: ${player.Name}`);
			return;
		}

		// Validate weapon exists
		const weapon = this.getWeaponData(weaponId);
		if (!weapon) {
			MessageServiceInstance.SendMessageToPlayer(
				player,
				this.createMessage(`Unknown weapon: ${weaponId}`, "error"),
			);
			return;
		}

		// TODO: Add weapon ownership/availability checks here
		// For now, allow all weapons

		// Equip weapon
		const previousWeapon = this.equippedWeapons.get(playerCharacter);
		this.equippedWeapons.set(playerCharacter, weaponId);

		// Create weapon equip event
		const equipEvent: WeaponEquipEvent = {
			entity: playerCharacter,
			weaponId: weapon.id,
			weaponName: weapon.name,
		};

		// Broadcast weapon equipped
		CombatRemotes.Server.Get("WeaponEquipped").SendToAllPlayers(equipEvent);

		// Send unequip event for previous weapon
		if (previousWeapon !== undefined) {
			CombatRemotes.Server.Get("WeaponUnequipped").SendToAllPlayers(playerCharacter, previousWeapon);
		}

		MessageServiceInstance.SendMessageToPlayer(player, this.createMessage(`Equipped ${weapon.name}`, "success"));
	}

	/**
	 * Calculate damage for an attack
	 */
	private calculateDamage(attacker: SSEntity, target: SSEntity, weapon: WeaponData): number {
		// Base damage from weapon
		let damage = weapon.baseDamage;

		// TODO: Add attacker stat modifiers (strength, level, etc.)
		// TODO: Add target defense modifiers (armor, buffs, etc.)
		// TODO: Add random variance (±10% for example)

		// For now, simple base damage calculation
		const variance = 0.8 + math.random() * 0.4; // 80%-120% damage
		damage = math.floor(damage * variance);

		return math.max(1, damage); // Minimum 1 damage
	}

	/**
	 * Roll for critical hit
	 */
	private rollCritical(weapon: WeaponData): boolean {
		return math.random() < weapon.criticalChance;
	}

	/**
	 * Apply damage to target through ResourceService
	 */
	private applyDamage(target: SSEntity, damage: number): boolean {
		if (target.IsA("Player")) {
			// Apply damage to player through ResourceService
			return ResourceServiceInstance.ModifyResource(target, "health", -damage);
		} else {
			// TODO: Handle NPC damage through UnifiedNPCService
			// For now, assume success
			print(`CombatService: Would apply ${damage} damage to NPC ${target.Name}`);
			return true;
		}
	}

	/**
	 * Get weapon data by ID
	 */
	private getWeaponData(weaponId: string): WeaponData {
		return this.DEFAULT_WEAPONS[weaponId] || this.DEFAULT_WEAPONS.fists;
	}

	/**
	 * Get combat stats for an entity
	 */
	private getCombatStats(entity: SSEntity): Record<string, unknown> | undefined {
		if (!isSSEntity(entity)) {
			return undefined;
		}

		const equippedWeapon = this.getEquippedWeapon(entity);
		const weaponToUse = equippedWeapon !== undefined ? equippedWeapon : "fists";
		const weapon = this.getWeaponData(weaponToUse);

		return {
			equippedWeapon: equippedWeapon !== undefined ? equippedWeapon : "fists",
			baseDamage: weapon.baseDamage,
			criticalChance: weapon.criticalChance,
			criticalMultiplier: weapon.criticalMultiplier,
		};
	}

	/**
	 * Get equipped weapon for an entity
	 */
	private getEquippedWeapon(entity: SSEntity): string | undefined {
		return this.equippedWeapons.get(entity);
	}

	/**
	 * Start a combat session between entities
	 */
	public StartCombatSession(participants: SSEntity[]): string {
		const sessionId = `combat_${tick()}_${math.random()}`;
		const session: CombatSession = {
			sessionId,
			participants,
			startTime: tick(),
			isActive: true,
		};

		this.activeSessions.set(sessionId, session);

		// Broadcast session start
		CombatRemotes.Server.Get("CombatSessionStarted").SendToAllPlayers(sessionId, participants);

		print(`CombatService: Started combat session ${sessionId} with ${participants.size()} participants`);
		return sessionId;
	}

	/**
	 * End a combat session
	 */
	public EndCombatSession(sessionId: string, winner?: SSEntity): void {
		const session = this.activeSessions.get(sessionId);
		if (!session) {
			warn(`CombatService: Attempted to end non-existent session ${sessionId}`);
			return;
		}

		session.isActive = false;
		this.activeSessions.delete(sessionId);

		// Broadcast session end
		CombatRemotes.Server.Get("CombatSessionEnded").SendToAllPlayers(sessionId, winner);

		print(`CombatService: Ended combat session ${sessionId}`);
	}

	/**
	 * Clean up data for a departing player
	 */
	private cleanupPlayer(player: SSEntity): void {
		// Remove equipped weapons
		this.equippedWeapons.delete(player);

		// End any combat sessions involving this player
		for (const [sessionId, session] of this.activeSessions) {
			if (session.participants.includes(player)) {
				this.EndCombatSession(sessionId);
			}
		}

		print(`CombatService: Cleaned up data for ${player.Name}`);
	}

	/**
	 * Get all active combat sessions (for debugging/admin purposes)
	 */
	public GetActiveSessions(): CombatSession[] {
		const sessions: CombatSession[] = [];
		for (const [, session] of this.activeSessions) {
			sessions.push(session);
		}
		return sessions;
	}
}

// Export singleton instance
export const CombatServiceInstance = CombatService.GetInstance();
export { CombatService };
