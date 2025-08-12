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
 * @lastUpdated 2025-08-12 - Added comprehensive signal documentation
 *
 * ## Server Signals (Inter-Service Communication)
 * - `PlayerDamaged` - Emits when players take damage for analytics/reward systems
 * - `HealthDamageRequested` - Emits health damage requests for resource system
 *
 * ## Client Events (Network Communication)
 * - `ExecuteBasicAttack` - Handles client basic attack requests
 * - `ExecuteAbilityAttack` - Handles client ability-based attack requests
 * - `RequestWeaponEquip` - Handles client weapon equip requests
 * - `SpawnTestNPCs` - Handles test NPC spawning for combat testing
 * - `GetCombatStats` - Provides combat statistics to clients
 * - `GetEquippedWeapon` - Provides equipped weapon data to clients
 * - `GetActiveCombos` - Provides active combo data to clients
 * - `CombatHit` - Sends hit events to all clients for visual effects
 * - `WeaponEquipped` - Sends weapon equip events to all clients
 * - `WeaponUnequipped` - Sends weapon unequip events to all clients
 * - `CombatSessionStarted` - Sends combat session start events to all clients
 * - `CombatSessionEnded` - Sends combat session end events to all clients
 *
 * ## Roblox Events (Engine Integration)
 * - `Players.PlayerRemoving` - Cleans up combat data for leaving players
 * - `Players.GetPlayers()` - Used for broadcasting combat events to all players
 */

import { Players, Workspace, HttpService } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { CombatRemotes, CombatHitEvent, WeaponEquipEvent } from "shared/network";
import { MessageType, MessageMetaRecord } from "shared/types";
// import { ResourceServiceInstance } from "./resource-service"; // Avoid direct coupling
import { MessageServiceInstance } from "./message-service";
import { DamageServiceInstance } from "./damage-service";
import { AbilityCatalog, AbilityKey } from "shared/catalogs/ability-catalog";
import { AbilityServiceInstance } from "./ability-service";
import { SignalServiceInstance } from "./signal-service";

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

	/** Simple per-player rate limit windows for various actions */
	private lastBasicAttackAt = new Map<Player, number>();
	private BASIC_ATTACK_WINDOW_SEC = 0.1; // 10/s

	private lastAbilityAttackAt = new Map<Player, number>();
	private ABILITY_ATTACK_WINDOW_SEC = 0.15; // ~6/s

	private lastEquipAt = new Map<Player, number>();
	private EQUIP_WINDOW_SEC = 0.25; // 4/s

	private constructor() {}

	/**
	 * Get the singleton instance of CombatService
	 */
	public static getInstance(): CombatService {
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
			const now = tick();
			const last = this.lastBasicAttackAt.get(player);
			if (last !== undefined && now - last < this.BASIC_ATTACK_WINDOW_SEC) return;
			this.lastBasicAttackAt.set(player, now);
			this.handleBasicAttack(player, target, weaponId);
		});

		// Ability attack handler
		CombatRemotes.Server.Get("ExecuteAbilityAttack").Connect((player, abilityKey, target) => {
			const now = tick();
			const last = this.lastAbilityAttackAt.get(player);
			if (last !== undefined && now - last < this.ABILITY_ATTACK_WINDOW_SEC) return;
			this.lastAbilityAttackAt.set(player, now);
			this.handleAbilityAttack(player, abilityKey, target);
		});

		// Weapon equip handler
		CombatRemotes.Server.Get("RequestWeaponEquip").Connect((player, weaponId) => {
			const now = tick();
			const last = this.lastEquipAt.get(player);
			if (last !== undefined && now - last < this.EQUIP_WINDOW_SEC) return;
			this.lastEquipAt.set(player, now);
			this.handleWeaponEquip(player, weaponId);
		});

		// Demo/Testing - NPC spawn handler
		CombatRemotes.Server.Get("SpawnTestNPCs").Connect((_player) => {
			// For testing: spawn a small group near the first SpawnLocation
			import("./unified-npc-service").then((m) => m.UnifiedNPCServiceInstance.Initialize());
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

		// Apply damage through signals
		const success = this.applyDamage(target, finalDamage);

		if (success) {
			// Emit combat events for other services to react to
			SignalServiceInstance.emit("PlayerDamaged", {
				victim: target,
				attacker: attacker,
				damage: finalDamage,
			});

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

			print(
				`CombatService: ${attacker.Name} attacked ${target.Name} with ${weapon.name} for ${finalDamage} damage${
					isCritical ? " (CRITICAL!)" : ""
				}`,
			);
		} else {
			// Attack failed
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`Your attack on ${target.Name} failed!`, "warning"),
			);
		}
	}

	/**
	 * Handle ability-based attack execution
	 */
	private handleAbilityAttack(attacker: Player, abilityKey: string, target?: SSEntity): void {
		warn(
			`CombatService: Handling ability attack ${abilityKey} from ${attacker.Name} on Target: ${target ? target.Name : "None"}`,
		);
		// Get attacker character
		const attackerCharacter = attacker.Character;
		if (!attackerCharacter || !isSSEntity(attackerCharacter)) {
			warn(`CombatService: Invalid attacker character for ${attacker.Name}`);
			return;
		}

		// Get ability data
		const ability = AbilityCatalog[abilityKey as AbilityKey];
		if (!ability) {
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`Unknown ability: ${abilityKey}`, "error"),
			);
			return;
		}

		// Use AbilityService to validate and consume resources
		// This will check cooldowns, mana costs, and trigger ability effects
		const abilitySuccess = AbilityServiceInstance.ActivateAbilityForCombat(attacker, abilityKey as AbilityKey);
		if (abilitySuccess === false) {
			// AbilityService already sent failure messages
			warn(`CombatService: ${attacker.Name} failed to activate ${ability.displayName}`);
			return;
		}

		// Check if ability requires target
		if (ability.requiresTarget && !target) {
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`${ability.displayName} requires a target!`, "warning"),
			);
			return;
		}

		// Validate target if provided
		if (target && !isSSEntity(target)) {
			warn(`CombatService: Invalid target for ability ${abilityKey} from ${attacker.Name}`);
			return;
		}

		// Prevent self-attack (unless it's a healing ability)
		if (target && attackerCharacter === target && ability.baseDamage !== undefined && ability.baseDamage > 0) {
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage("You cannot attack yourself!", "warning"),
			);
			return;
		}

		// Check if ability deals damage
		if (ability.baseDamage === undefined || ability.baseDamage <= 0) {
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`${ability.displayName} is not a damage ability!`, "warning"),
			);
			return;
		}

		// Calculate ability damage
		const baseDamage = ability.baseDamage;
		const critChance = ability.criticalChance !== undefined ? ability.criticalChance : 0.05; // Default 5% crit
		const critMultiplier = ability.criticalMultiplier !== undefined ? ability.criticalMultiplier : 1.5; // Default 1.5x crit

		// Roll for critical hit
		const isCritical = math.random() < critChance;

		// Calculate final damage with variance
		const variance = 0.85 + math.random() * 0.3; // 85%-115% damage variance
		let finalDamage = math.floor(baseDamage * variance);
		warn(`CombatService: ${attacker.Name} used ${ability.displayName} for ${finalDamage} damage`);
		if (isCritical) {
			finalDamage = math.floor(finalDamage * critMultiplier);
		}

		// Handle different ability types
		if (abilityKey === "Earthquake") {
			// Area effect - find nearby targets
			warn("Handling area effect ability");
			this.handleAreaAbility(attackerCharacter, ability, finalDamage, isCritical);
		} else if (target) {
			// Single target ability
			warn("Handling single target ability");
			this.handleSingleTargetAbility(attackerCharacter, target, ability, finalDamage, isCritical);
		}

		// Handle special ability effects
		if (abilityKey === "Soul-Drain" && target) {
			// Heal attacker for 30% of damage dealt via signal
			warn("Handling Soul Drain ability");
			const healAmount = math.floor(finalDamage * 0.3);
			DamageServiceInstance.requestHealthHeal(attacker, healAmount, "Soul-Drain");
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`Soul Drain healed you for ${healAmount} health!`, "success"),
			);
		}
	}

	/**
	 * Handle single target ability damage
	 */
	private handleSingleTargetAbility(
		attacker: SSEntity,
		target: SSEntity,
		ability: (typeof AbilityCatalog)[AbilityKey],
		damage: number,
		isCritical: boolean,
	): void {
		// Apply damage
		const success = this.applyDamage(target, damage);

		if (success) {
			// Create combat hit event
			const hitEvent: CombatHitEvent = {
				attacker,
				target,
				weaponId: ability.abilityKey,
				damage,
				isCritical,
				hitType: "ability_attack",
			};

			// Broadcast combat hit
			CombatRemotes.Server.Get("CombatHit").SendToAllPlayers(hitEvent);

			// Send feedback messages
			if (attacker.IsA("Player")) {
				MessageServiceInstance.SendMessageToPlayer(
					attacker,
					this.createMessage(
						`${ability.displayName} dealt ${damage} damage to ${target.Name}${isCritical ? " (Critical!)" : ""}`,
						"success",
					),
				);
			}

			if (target.IsA("Player")) {
				MessageServiceInstance.SendMessageToPlayer(
					target,
					this.createMessage(
						`You took ${damage} damage from ${attacker.Name}'s ${ability.displayName}${isCritical ? " (Critical!)" : ""}`,
						"warning",
					),
				);
			}

			print(`CombatService: ${attacker.Name} used ${ability.displayName} for ${damage} damage on ${target.Name}`);
		}
	}

	/**
	 * Handle area effect ability damage
	 */
	private handleAreaAbility(
		attacker: SSEntity,
		ability: (typeof AbilityCatalog)[AbilityKey],
		damage: number,
		isCritical: boolean,
	): void {
		// Find all entities within range (for now, simple implementation)
		const attackerPosition = attacker.HumanoidRootPart?.Position;
		if (!attackerPosition) return;

		const targets: SSEntity[] = [];
		const AREA_RANGE = 15; // 15 stud radius

		// Check players
		for (const player of Players.GetPlayers()) {
			if (player.Character && isSSEntity(player.Character) && player.Character !== attacker) {
				const targetPosition = player.Character.HumanoidRootPart?.Position;
				if (targetPosition) {
					const distance = attackerPosition.sub(targetPosition).Magnitude;
					if (distance <= AREA_RANGE) {
						targets.push(player.Character);
					}
				}
			}
		}

		// Check NPCs in workspace
		for (const child of Workspace.GetChildren()) {
			if (classIs(child, "Model") && isSSEntity(child) && child !== attacker) {
				const targetPosition = child.HumanoidRootPart?.Position;
				if (targetPosition) {
					const distance = attackerPosition.sub(targetPosition).Magnitude;
					if (distance <= AREA_RANGE) {
						targets.push(child);
					}
				}
			}
		}

		// Apply damage to all targets
		for (const target of targets) {
			this.handleSingleTargetAbility(attacker, target, ability, damage, isCritical);
		}

		if (attacker.IsA("Player")) {
			MessageServiceInstance.SendMessageToPlayer(
				attacker,
				this.createMessage(`${ability.displayName} hit ${targets.size()} targets!`, "success"),
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
			// Apply damage to player through signals
			SignalServiceInstance.emit("HealthDamageRequested", {
				player: target,
				amount: damage,
				source: "Combat",
			});
			return true;
		} else {
			// Handle NPC damage - could also use signals for consistency
			const humanoid = target.FindFirstChild("Humanoid") as Humanoid;
			if (humanoid) {
				const currentHealth = humanoid.Health;
				const newHealth = math.max(0, currentHealth - damage);
				humanoid.Health = newHealth;

				print(
					`CombatService: Applied ${damage} damage to NPC ${target.Name} (${currentHealth} -> ${newHealth})`,
				);

				// Emit signal for NPC damage (for logging, analytics, etc.)
				SignalServiceInstance.emit("PlayerDamaged", {
					victim: target,
					attacker: undefined, // Could pass attacker if needed
					damage: damage,
				});

				// Check if NPC died
				if (newHealth <= 0) {
					print(`CombatService: NPC ${target.Name} was defeated!`);
					// Optional: Add death effects here
				}

				return true;
			} else {
				warn(`CombatService: NPC ${target.Name} has no Humanoid to damage`);
				return false;
			}
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
export const CombatServiceInstance = CombatService.getInstance();
export { CombatService };
