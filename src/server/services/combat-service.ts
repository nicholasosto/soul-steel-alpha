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
 *
 * ## Public API
 * - `CombatServiceInstance` — Singleton instance for use across server code
 * - `Initialize(): void`
 * - `StartCombatSession(participants: SSEntity[]): string`
 * - `EndCombatSession(sessionId: string, winner?: SSEntity): void`
 * - `ExecuteDamage(attacker: SSEntity, target: SSEntity, damage: number, weaponId?: string): boolean`
 * - `IsInCombat(entity: SSEntity): boolean`
 */

import { Players, Workspace, HttpService } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { CombatRemotes, CombatHitEvent, WeaponEquipEvent } from "shared/network";
import { MessageType, MessageMetaRecord } from "shared/types";
import { AbilityCatalog, AbilityKey } from "shared/catalogs/ability-catalog";
import { SignalServiceInstance } from "./signal-service";
import { ServiceRegistryInstance } from "./service-registry";
import { ICombatOperations } from "./service-interfaces";

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

	/** Track NPCs that have already been defeated to prevent multiple experience rewards */
	private deadNPCs = new Set<SSEntity>();

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

	// Toggle for console verbosity (set to true during development/testing)
	private static readonly DEBUG = true;

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

		// Register CombatOperations interface for loose coupling
		const ops: ICombatOperations = {
			executeDamage(attacker, target, damage, _weaponId?) {
				return CombatService.getInstance().ExecuteDamage(attacker, target, damage);
			},
			startCombatSession(participants) {
				return CombatService.getInstance().StartCombatSession(participants);
			},
			endCombatSession(sessionId) {
				CombatService.getInstance().EndCombatSession(sessionId);
			},
			isInCombat(entity) {
				return CombatService.getInstance().IsInCombat(entity);
			},
		};
		ServiceRegistryInstance.registerService<ICombatOperations>("CombatOperations", ops);
		if (CombatService.DEBUG) print("CombatService: Initialized successfully");
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
	 * Helper method to send messages via ServiceRegistry
	 */
	private sendMessage(player: Player, content: string, severity: "info" | "warning" | "error" | "success"): void {
		const messageOps = ServiceRegistryInstance.getMessageOperations();
		switch (severity) {
			case "info":
				messageOps.sendInfoToPlayer(player, content);
				break;
			case "warning":
				messageOps.sendWarningToPlayer(player, content);
				break;
			case "error":
				messageOps.sendErrorToPlayer(player, content);
				break;
			case "success":
				messageOps.sendInfoToPlayer(player, content); // Success maps to info for now
				break;
		}
	}

	/**
	 * Set up network connections for combat remotes
	 */
	private setupNetworkConnections(): void {
		// Basic attack handler
		CombatRemotes.Server.Get("ExecuteBasicAttack").Connect((player, target, weaponId) => {
			if (!this.rateOk(this.lastBasicAttackAt, this.BASIC_ATTACK_WINDOW_SEC, player)) return;
			print("CombatService: Executing basic attack");
			this.handleBasicAttack(player, target, weaponId);
		});

		// Ability attack handler
		CombatRemotes.Server.Get("ExecuteAbilityAttack").Connect((player, abilityKey, target) => {
			if (!this.rateOk(this.lastAbilityAttackAt, this.ABILITY_ATTACK_WINDOW_SEC, player)) return;
			print("CombatService: Executing ability attack");
			this.handleAbilityAttack(player, abilityKey, target);
		});

		// Weapon equip handler
		CombatRemotes.Server.Get("RequestWeaponEquip").Connect((player, weaponId) => {
			print("CombatService: Requesting weapon equip");
			if (!this.rateOk(this.lastEquipAt, this.EQUIP_WINDOW_SEC, player)) return;
			this.handleWeaponEquip(player, weaponId);
		});

		// Combat state query handlers
		CombatRemotes.Server.Get("GetCombatStats").SetCallback((player, entity) => {
			print("CombatService: Querying combat stats");
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
	 * Rate limiting helper for per-player actions
	 */
	private rateOk(map: Map<Player, number>, windowSec: number, player: Player): boolean {
		const now = tick();
		const last = map.get(player);
		if (last !== undefined && now - last < windowSec) return false;
		map.set(player, now);
		return true;
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
			const messageOps = ServiceRegistryInstance.getMessageOperations();
			messageOps.sendWarningToPlayer(attacker, "You cannot attack yourself!");
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
		const success = this.applyDamage(target, finalDamage, attacker);

		if (success) {
			// Emit combat events for other services to react to
			SignalServiceInstance.emit("PlayerDamaged", {
				victim: target,
				attacker: attacker,
				damage: finalDamage,
			});

			// Send feedback messages
			this.sendMessage(
				attacker,
				`You dealt ${finalDamage} damage to ${target.Name}${isCritical ? " (Critical!)" : ""}`,
				"info",
			);

			if (target.IsA("Player")) {
				this.sendMessage(
					target,
					`You took ${finalDamage} damage from ${attacker.Name}${isCritical ? " (Critical!)" : ""}`,
					"warning",
				);
			}

			if (CombatService.DEBUG) {
				print(
					`CombatService: ${attacker.Name} attacked ${target.Name} with ${weapon.name} for ${finalDamage} damage${
						isCritical ? " (CRITICAL!)" : ""
					}`,
				);
			}
		} else {
			// Attack failed
			this.sendMessage(attacker, `Your attack on ${target.Name} failed!`, "warning");
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
			this.sendMessage(attacker, `Unknown ability: ${abilityKey}`, "error");
			return;
		}

		// NOTE: Ability activation (validation + cooldown + resource costs) is performed
		// by AbilityService via the ABILITY_ACTIVATE remote that the client calls first.
		// Calling ActivateAbilityForCombat here would double-validate and immediately
		// fail on cooldown (FAIL 04) because the cooldown has just started.
		// Trust the prior activation and proceed with damage handling only.
		// TODO: Harden this path by verifying a recent activation token from AbilityService
		// to prevent clients from bypassing activation and calling this remote directly.

		// Check if ability requires target
		if (ability.requiresTarget && !target) {
			this.sendMessage(attacker, `${ability.displayName} requires a target!`, "warning");
			return;
		}

		// Validate target if provided
		if (target && !isSSEntity(target)) {
			warn(`CombatService: Invalid target for ability ${abilityKey} from ${attacker.Name}`);
			return;
		}

		// Prevent self-attack (unless it's a healing ability)
		if (target && attackerCharacter === target && ability.baseDamage !== undefined && ability.baseDamage > 0) {
			this.sendMessage(attacker, "You cannot attack yourself!", "warning");
			return;
		}

		// Check if ability deals damage
		if (ability.baseDamage === undefined || ability.baseDamage <= 0) {
			this.sendMessage(attacker, `${ability.displayName} is not a damage ability!`, "warning");
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
			this.handleSingleTargetAbility(attackerCharacter, target, ability, finalDamage, isCritical, attacker);
		}

		// Handle special ability effects
		if (abilityKey === "Soul-Drain" && target) {
			// Heal attacker for 30% of damage dealt via signal
			warn("Handling Soul Drain ability");
			const healAmount = math.floor(finalDamage * 0.3);
			SignalServiceInstance.emit("HealthHealRequested", {
				player: attacker,
				amount: healAmount,
				source: "Soul-Drain",
			});
			const messageOps = ServiceRegistryInstance.getMessageOperations();
			messageOps.sendInfoToPlayer(attacker, `Soul Drain healed you for ${healAmount} health!`);
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
		attackerPlayer?: Player,
	): void {
		// Apply damage
		const success = this.applyDamage(target, damage, attackerPlayer);

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
				this.sendMessage(
					attacker,
					`${ability.displayName} dealt ${damage} damage to ${target.Name}${isCritical ? " (Critical!)" : ""}`,
					"success",
				);
			}

			if (target.IsA("Player")) {
				this.sendMessage(
					target,
					`You took ${damage} damage from ${attacker.Name}'s ${ability.displayName}${isCritical ? " (Critical!)" : ""}`,
					"warning",
				);
			}

			if (CombatService.DEBUG) {
				print(
					`CombatService: ${attacker.Name} used ${ability.displayName} for ${damage} damage on ${target.Name}`,
				);
			}
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
			this.sendMessage(attacker, `${ability.displayName} hit ${targets.size()} targets!`, "success");
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
			this.sendMessage(player, `Unknown weapon: ${weaponId}`, "error");
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

		this.sendMessage(player, `Equipped ${weapon.name}`, "success");
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
	private applyDamage(target: SSEntity, damage: number, attacker?: Player): boolean {
		if (target.IsA("Player")) {
			// Apply damage to player via signals (decoupled approach)
			SignalServiceInstance.emit("HealthDamageRequested", {
				player: target,
				amount: damage,
				source: "Combat",
			});
			return true;
		} else {
			// Check if NPC is already marked as dead
			if (this.deadNPCs.has(target)) {
				if (CombatService.DEBUG) {
					print(`CombatService: ${target.Name} is already defeated - no damage or rewards`);
				}
				return false;
			}

			// Handle NPC damage - could also use signals for consistency
			const humanoid = target.FindFirstChild("Humanoid") as Humanoid;
			if (humanoid) {
				const currentHealth = humanoid.Health;
				const newHealth = math.max(0, currentHealth - damage);
				humanoid.Health = newHealth;

				if (CombatService.DEBUG) {
					print(
						`CombatService: Applied ${damage} damage to NPC ${target.Name} (${currentHealth} -> ${newHealth})`,
					);
				}

				// Emit signal for NPC damage (for logging, analytics, etc.)
				SignalServiceInstance.emit("PlayerDamaged", {
					victim: target,
					attacker: attacker, // Now properly tracks the attacker
					damage: damage,
				});

				// Check if NPC died (transition from alive to dead)
				if (newHealth <= 0 && currentHealth > 0) {
					if (CombatService.DEBUG) print(`CombatService: NPC ${target.Name} was defeated!`);

					// Mark NPC as dead to prevent multiple experience rewards
					this.deadNPCs.add(target);

					// Emit NPCDefeated signal for reward systems
					if (attacker) {
						SignalServiceInstance.emit("NPCDefeated", {
							npc: target,
							killer: attacker,
							finalDamage: damage,
							npcName: target.Name,
						});
					}
				} else if (newHealth <= 0) {
					// NPC is already dead, don't award experience again
					if (CombatService.DEBUG)
						print(`CombatService: ${target.Name} is already defeated (no additional rewards)`);
				}

				return true;
			} else {
				warn(`CombatService: NPC ${target.Name} has no Humanoid to damage`);
				return false;
			}
		}
	}

	/**
	 * Public wrapper to execute direct damage through combat rules.
	 * Prefer signals for cross-service calls; this is for controlled integrations.
	 */
	public ExecuteDamage(attacker: SSEntity, target: SSEntity, damage: number, _weaponId?: string): boolean {
		const attackerPlayer = Players.GetPlayerFromCharacter(attacker as unknown as Model);
		return this.applyDamage(target, damage, attackerPlayer);
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

		if (CombatService.DEBUG)
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

		if (CombatService.DEBUG) print(`CombatService: Ended combat session ${sessionId}`);
	}

	/** Determines if an entity is currently in an active combat session */
	public IsInCombat(entity: SSEntity): boolean {
		for (const [, session] of this.activeSessions) {
			if (session.isActive && session.participants.includes(entity)) return true;
		}
		return false;
	}

	/**
	 * Clean up data for a departing player
	 */
	private cleanupPlayer(player: SSEntity): void {
		// Remove equipped weapons
		this.equippedWeapons.delete(player);

		// Remove from dead NPCs set if somehow a player is in there
		this.deadNPCs.delete(player);

		// End any combat sessions involving this player
		for (const [sessionId, session] of this.activeSessions) {
			if (session.participants.includes(player)) {
				this.EndCombatSession(sessionId);
			}
		}

		if (CombatService.DEBUG) print(`CombatService: Cleaned up data for ${player.Name}`);
	}

	/**
	 * Clean up dead NPC tracking when NPC is removed from workspace
	 */
	public cleanupDeadNPC(npc: SSEntity): void {
		if (this.deadNPCs.has(npc)) {
			this.deadNPCs.delete(npc);
			if (CombatService.DEBUG) print(`CombatService: Cleaned up dead NPC tracking for ${npc.Name}`);
		}
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
