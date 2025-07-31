/**
 * @fileoverview Combat Service for the Soul Steel Alpha game system.
 *
 * This service manages the server-side logic for combat mechanics including:
 * - Combat state management and turn-based combat flow
 * - Weapon and equipment system integration
 * - Combat calculations (hit chance, critical hits, damage modifiers)
 * - Combo system and skill chains
 * - Status effect application and management
 * - PvP and PvE combat coordination
 * - Combat analytics and logging
 *
 * The service follows a singleton pattern and coordinates with other services
 * (AbilityService, ResourceService, AnimationService) for complete combat experience.
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Players, RunService } from "@rbxts/services";
import { SSEntity } from "shared/types/SSEntity";
import {
	DamageInfo,
	HealingInfo,
	CombatStats,
	StatusEffect,
	StatusEffectType,
	DamageType,
} from "shared/types/health-types";
import { AbilityKey } from "shared/keys";
import { WeaponInfo, WeaponType } from "shared/catalogs/weapon-catalog";
import { isSSEntity } from "shared/helpers/type-guards";
import { ResourceServiceInstance } from "./resource-service";
import { AbilityServiceInstance } from "./ability-service";
import { AnimationServiceInstance } from "./animation-service";
import { MessageServiceInstance } from "./message-service";

// Combat-specific types
export interface CombatTarget {
	entity: SSEntity;
	position: Vector3;
	isValid: boolean;
}

export interface CombatAction {
	id: string;
	source: SSEntity;
	target?: CombatTarget;
	actionType: CombatActionType;
	abilityKey?: AbilityKey;
	weaponId?: string;
	timestamp: number;
	isQueued: boolean;
}

export type CombatActionType =
	| "basic_attack"
	| "ability_cast"
	| "weapon_skill"
	| "dodge"
	| "block"
	| "counter"
	| "combo_finisher";

export interface WeaponEquipEvent {
	entity: SSEntity;
	weaponId: string;
	weaponName: string;
}

export interface CombatSession {
	id: string;
	participants: Set<SSEntity>;
	sessionType: CombatSessionType;
	startTime: number;
	isActive: boolean;
	turnOrder?: SSEntity[];
	currentTurn?: SSEntity;
}

export type CombatSessionType = "pvp" | "pve" | "duel" | "raid" | "training";

export interface ComboChain {
	id: string;
	requiredSequence: AbilityKey[];
	currentSequence: AbilityKey[];
	timeWindow: number;
	lastActionTime: number;
	bonusMultiplier: number;
}

/**
 * Server-side combat management service.
 *
 * This singleton service orchestrates all combat-related mechanics including
 * weapon systems, combat states, combo chains, and coordination between
 * other game services for a cohesive combat experience.
 *
 * @class CombatService
 * @example
 * ```typescript
 * // Initialize combat for entities
 * const service = CombatService.Start();
 * service.RegisterCombatant(playerCharacter, defaultWeapon);
 *
 * // Execute combat actions
 * service.ExecuteBasicAttack(attacker, target, weapon);
 * ```
 */
class CombatService {
	/** Singleton instance of the CombatService */
	private static instance: CombatService | undefined;

	// Service dependencies
	private resourceService = ResourceServiceInstance;
	private abilityService = AbilityServiceInstance;
	private animationService = AnimationServiceInstance;
	private messageService = MessageServiceInstance;

	// Combat state tracking
	private activeCombatants: Map<SSEntity, CombatStats> = new Map();
	private equippedWeapons: Map<SSEntity, WeaponInfo> = new Map();
	private activeCombatSessions: Map<string, CombatSession> = new Map();
	private comboChainsActive: Map<SSEntity, ComboChain[]> = new Map();
	private combatActions: Map<string, CombatAction> = new Map();

	// Combat configuration
	private readonly DEFAULT_WEAPON: WeaponInfo = {
		id: "fists",
		name: "Fists",
		weaponType: "fists",
		baseDamage: 5,
		attackSpeed: 1.0,
		range: 2,
		criticalBonus: 0,
		statRequirements: {},
		description: "Your natural weapons. Always available but limited in power.",
		icon: "rbxassetid://0",
		rarity: "common",
	};

	private readonly COMBO_TIME_WINDOW = 3; // seconds
	private readonly MAX_COMBAT_RANGE = 50; // studs

	/**
	 * Gets or creates the singleton instance of CombatService.
	 * Initializes the service on first call.
	 *
	 * @returns The singleton CombatService instance
	 * @static
	 */
	public static Start(): CombatService {
		if (CombatService.instance === undefined) {
			CombatService.instance = new CombatService();
		}
		return CombatService.instance;
	}

	/**
	 * Private constructor for singleton pattern.
	 * Initializes combat systems and cleanup handlers.
	 *
	 * @private
	 */
	private constructor() {
		this.initializeCleanup();
		this.initializeCombatLoop();
		print("CombatService initialized");
	}

	/**
	 * Sets up automatic cleanup when players leave the game.
	 * Ensures that combat state mappings are properly cleaned up.
	 *
	 * @private
	 */
	private initializeCleanup(): void {
		Players.PlayerRemoving.Connect((player) => {
			player.CharacterRemoving.Connect((character) => {
				if (isSSEntity(character)) {
					this.unregisterCombatant(character);
				}
			});
		});
	}

	/**
	 * Initializes the main combat update loop.
	 * Handles combo timing, session management, and combat state updates.
	 *
	 * @private
	 */
	private initializeCombatLoop(): void {
		RunService.Heartbeat.Connect((deltaTime: number) => {
			this.updateComboChains(deltaTime);
			this.updateCombatSessions(deltaTime);
			this.processQueuedActions(deltaTime);
		});
	}

	/**
	 * Registers an entity as a combatant with optional weapon.
	 *
	 * @param entity - The SSEntity to register as a combatant
	 * @param weapon - Optional weapon to equip (defaults to fists)
	 * @returns True if registration was successful
	 * @public
	 */
	public RegisterCombatant(entity: SSEntity, weapon?: WeaponInfo): boolean {
		if (!isSSEntity(entity)) {
			warn("Invalid entity provided for combat registration");
			return false;
		}

		if (this.activeCombatants.has(entity)) {
			warn(`Entity ${entity.Name} is already registered as a combatant`);
			return false;
		}

		// Get combat stats from ResourceService
		const stats = this.resourceService.getEntityStats(entity);
		if (!stats) {
			warn(`No combat stats found for entity ${entity.Name}`);
			return false;
		}

		this.activeCombatants.set(entity, stats);
		this.equippedWeapons.set(entity, weapon || this.DEFAULT_WEAPON);
		this.comboChainsActive.set(entity, []);

		print(`Registered combatant: ${entity.Name} with weapon: ${(weapon || this.DEFAULT_WEAPON).name}`);
		return true;
	}

	/**
	 * Unregisters an entity from combat system.
	 *
	 * @param entity - The SSEntity to unregister
	 * @returns True if entity was found and unregistered
	 * @public
	 */
	public unregisterCombatant(entity: SSEntity): boolean {
		if (!this.activeCombatants.has(entity)) {
			return false;
		}

		// Clean up all combat-related data
		this.activeCombatants.delete(entity);
		this.equippedWeapons.delete(entity);
		this.comboChainsActive.delete(entity);

		// Remove from active combat sessions
		for (const [sessionId, session] of this.activeCombatSessions) {
			if (session.participants.has(entity)) {
				session.participants.delete(entity);
				if (session.participants.size() === 0) {
					this.endCombatSession(sessionId);
				}
			}
		}

		print(`Unregistered combatant: ${entity.Name}`);
		return true;
	}

	/**
	 * Executes a basic weapon attack between two entities.
	 *
	 * @param attacker - The entity performing the attack
	 * @param target - The entity being attacked
	 * @param weaponOverride - Optional weapon to use instead of equipped weapon
	 * @returns True if attack was successful
	 * @public
	 */
	public ExecuteBasicAttack(attacker: SSEntity, target: SSEntity, weaponOverride?: WeaponInfo): boolean {
		if (!this.validateCombatAction(attacker, target)) {
			return false;
		}

		const weapon = weaponOverride || this.equippedWeapons.get(attacker) || this.DEFAULT_WEAPON;
		const attackerStats = this.activeCombatants.get(attacker)!;

		// Calculate hit chance and damage
		const hitChance = this.calculateHitChance(attacker, target, weapon);
		if (math.random() > hitChance) {
			this.handleMissedAttack(attacker, target, weapon);
			return false;
		}

		// Calculate final damage
		const baseDamage = weapon.baseDamage + attackerStats.attackPower;
		const damageInfo: DamageInfo = {
			baseDamage: baseDamage,
			damageType: this.getWeaponDamageType(weapon.weaponType),
			source: attacker,
			sourceId: `weapon_${weapon.id}`,
			canCrit: true,
			multipliers: this.getWeaponMultipliers(weapon, attackerStats),
		};

		// Play attack animation
		this.playAttackAnimation(attacker, weapon);

		// Apply damage
		const success = this.resourceService.dealDamage(target, damageInfo);
		if (success) {
			this.handleSuccessfulAttack(attacker, target, weapon, damageInfo);
		}

		return success;
	}

	/**
	 * Executes a weapon-specific special skill.
	 *
	 * @param user - The entity using the weapon skill
	 * @param target - Optional target for the skill
	 * @param skillId - The weapon skill identifier
	 * @returns True if skill was executed successfully
	 * @public
	 */
	public ExecuteWeaponSkill(user: SSEntity, skillId: string, target?: SSEntity): boolean {
		if (!this.activeCombatants.has(user)) {
			warn(`Entity ${user.Name} is not a registered combatant`);
			return false;
		}

		const weapon = this.equippedWeapons.get(user);
		if (!weapon) {
			warn(`No weapon equipped for entity ${user.Name}`);
			return false;
		}

		// Weapon skill implementation would go here
		// This would integrate with the ability system for weapon-specific abilities

		print(`Executing weapon skill ${skillId} for ${user.Name} with ${weapon.name}`);
		return true;
	}

	/**
	 * Starts a combo chain for an entity.
	 *
	 * @param entity - The entity starting the combo
	 * @param abilityKey - The first ability in the combo
	 * @returns True if combo was started successfully
	 * @public
	 */
	public StartComboChain(entity: SSEntity, abilityKey: AbilityKey): boolean {
		if (!this.activeCombatants.has(entity)) {
			return false;
		}

		const activeCombos = this.comboChainsActive.get(entity) || [];

		// Check if this ability can start a new combo
		const availableCombos = this.getAvailableCombos(entity, abilityKey);

		for (const comboPattern of availableCombos) {
			const newCombo: ComboChain = {
				id: `${entity.Name}_${comboPattern.id}_${tick()}`,
				requiredSequence: comboPattern.sequence,
				currentSequence: [abilityKey],
				timeWindow: this.COMBO_TIME_WINDOW,
				lastActionTime: tick(),
				bonusMultiplier: comboPattern.bonusMultiplier,
			};

			activeCombos.push(newCombo);
		}

		this.comboChainsActive.set(entity, activeCombos);
		return activeCombos.size() > 0;
	}

	/**
	 * Continues an existing combo chain.
	 *
	 * @param entity - The entity continuing the combo
	 * @param abilityKey - The next ability in the combo
	 * @returns Combo multiplier if successful, 1.0 if no combo
	 * @public
	 */
	public ContinueComboChain(entity: SSEntity, abilityKey: AbilityKey): number {
		const activeCombos = this.comboChainsActive.get(entity);
		if (!activeCombos || activeCombos.size() === 0) {
			return 1.0;
		}

		let maxMultiplier = 1.0;
		const updatedCombos: ComboChain[] = [];

		for (const combo of activeCombos) {
			const nextExpectedIndex = combo.currentSequence.size();
			const expectedAbility = combo.requiredSequence[nextExpectedIndex];

			if (expectedAbility === abilityKey) {
				// Combo continues
				combo.currentSequence.push(abilityKey);
				combo.lastActionTime = tick();

				if (combo.currentSequence.size() === combo.requiredSequence.size()) {
					// Combo completed!
					maxMultiplier = math.max(maxMultiplier, combo.bonusMultiplier);
					this.handleComboCompleted(entity, combo);
				} else {
					// Combo continues
					updatedCombos.push(combo);
					maxMultiplier = math.max(maxMultiplier, 1 + combo.currentSequence.size() * 0.1);
				}
			}
			// If ability doesn't match, combo is broken (don't add to updatedCombos)
		}

		this.comboChainsActive.set(entity, updatedCombos);
		return maxMultiplier;
	}

	/**
	 * Equips a weapon to an entity.
	 *
	 * @param entity - The entity to equip the weapon on
	 * @param weapon - The weapon to equip
	 * @returns True if weapon was equipped successfully
	 * @public
	 */
	public EquipWeapon(entity: SSEntity, weapon: WeaponInfo): boolean {
		if (!this.activeCombatants.has(entity)) {
			warn(`Entity ${entity.Name} is not a registered combatant`);
			return false;
		}

		// Validate stat requirements
		const stats = this.activeCombatants.get(entity)!;
		if (!this.validateWeaponRequirements(stats, weapon)) {
			warn(`Entity ${entity.Name} does not meet requirements for weapon ${weapon.name}`);
			return false;
		}

		this.equippedWeapons.set(entity, weapon);
		print(`Equipped ${weapon.name} to ${entity.Name}`);
		return true;
	}

	/**
	 * Gets the currently equipped weapon for an entity.
	 *
	 * @param entity - The entity to get the weapon for
	 * @returns The equipped weapon or undefined if none
	 * @public
	 */
	public GetEquippedWeapon(entity: SSEntity): WeaponInfo | undefined {
		return this.equippedWeapons.get(entity);
	}

	// Private helper methods

	private validateCombatAction(attacker: SSEntity, target: SSEntity): boolean {
		if (!this.activeCombatants.has(attacker)) {
			warn(`Attacker ${attacker.Name} is not a registered combatant`);
			return false;
		}

		if (!isSSEntity(target)) {
			warn("Invalid target for combat action");
			return false;
		}

		// Check range
		const distance = attacker.HumanoidRootPart.Position.sub(target.HumanoidRootPart.Position).Magnitude;
		if (distance > this.MAX_COMBAT_RANGE) {
			warn("Target is too far away for combat");
			return false;
		}

		return true;
	}

	private calculateHitChance(attacker: SSEntity, target: SSEntity, weapon: WeaponInfo): number {
		// Base hit chance calculation
		const attackerStats = this.activeCombatants.get(attacker)!;
		const targetStats = this.resourceService.getEntityStats(target);

		if (!targetStats) return 0.9; // Default hit chance if target has no stats

		// Simple hit chance formula - can be expanded
		const baseHitChance = 0.8;
		const accuracyModifier = (attackerStats.attackPower / 100) * 0.1;
		const evasionModifier = (targetStats.defense / 100) * 0.05;

		return math.max(0.1, math.min(0.95, baseHitChance + accuracyModifier - evasionModifier));
	}

	private getWeaponDamageType(weaponType: WeaponType): DamageType {
		const damageTypeMap: Record<WeaponType, DamageType> = {
			sword: "physical",
			staff: "magical",
			bow: "physical",
			dagger: "physical",
			hammer: "physical",
			shield: "physical",
			fists: "physical",
		};

		return damageTypeMap[weaponType] || "physical";
	}

	private getWeaponMultipliers(weapon: WeaponInfo, stats: CombatStats): number[] {
		const multipliers: number[] = [];

		// Weapon-specific multipliers
		multipliers.push(weapon.attackSpeed);

		// Stat-based multipliers
		if (weapon.weaponType === "bow" && stats.criticalChance > 0.1) {
			multipliers.push(1.1); // Bow precision bonus
		}

		return multipliers;
	}

	private playAttackAnimation(attacker: SSEntity, weapon: WeaponInfo): void {
		// Integration with AnimationService for weapon-specific animations
		// This would be expanded based on your animation system
		print(`Playing attack animation for ${attacker.Name} with ${weapon.name}`);
	}

	private handleMissedAttack(attacker: SSEntity, target: SSEntity, weapon: WeaponInfo): void {
		print(`${attacker.Name} missed attack on ${target.Name} with ${weapon.name}`);
		// Could trigger dodge animations, combat text, etc.
	}

	private handleSuccessfulAttack(
		attacker: SSEntity,
		target: SSEntity,
		weapon: WeaponInfo,
		damageInfo: DamageInfo,
	): void {
		print(`${attacker.Name} hit ${target.Name} for ${damageInfo.baseDamage} damage with ${weapon.name}`);

		// Apply weapon special effects
		if (weapon.specialEffects) {
			for (const effect of weapon.specialEffects) {
				this.applyStatusEffect(target, effect);
			}
		}
	}

	private applyStatusEffect(target: SSEntity, effect: StatusEffect): void {
		// Status effect application logic
		// This would integrate with ResourceService for effect management
		print(`Applied status effect ${effect.name} to ${target.Name}`);
	}

	private validateWeaponRequirements(stats: CombatStats, weapon: WeaponInfo): boolean {
		for (const [statName, requiredValue] of pairs(weapon.statRequirements)) {
			const currentValue = stats[statName as keyof CombatStats] as number;
			if (currentValue < requiredValue) {
				return false;
			}
		}
		return true;
	}

	private getAvailableCombos(
		entity: SSEntity,
		abilityKey: AbilityKey,
	): Array<{ id: string; sequence: AbilityKey[]; bonusMultiplier: number }> {
		// Combo pattern definitions - could be moved to a separate catalog
		const comboPatterns = [
			{
				id: "basic_combo",
				sequence: ["Melee", "Soul-Drain"] as AbilityKey[],
				bonusMultiplier: 1.5,
			},
			{
				id: "elemental_combo",
				sequence: ["Earthquake", "Ice-Rain"] as AbilityKey[],
				bonusMultiplier: 2.0,
			},
		];

		return comboPatterns.filter((pattern) => pattern.sequence[0] === abilityKey);
	}

	private handleComboCompleted(entity: SSEntity, combo: ComboChain): void {
		print(`${entity.Name} completed combo: ${combo.id} with ${combo.bonusMultiplier}x multiplier!`);
		// Could trigger special effects, rewards, achievements, etc.
	}

	private updateComboChains(deltaTime: number): void {
		const currentTime = tick();

		for (const [entity, combos] of this.comboChainsActive) {
			const activeCombos = combos.filter((combo) => {
				const timeSinceLastAction = currentTime - combo.lastActionTime;
				return timeSinceLastAction < combo.timeWindow;
			});

			if (activeCombos.size() !== combos.size()) {
				this.comboChainsActive.set(entity, activeCombos);
			}
		}
	}

	private updateCombatSessions(deltaTime: number): void {
		// Update active combat sessions
		// Handle turn-based combat, session timeouts, etc.
	}

	private processQueuedActions(deltaTime: number): void {
		// Process any queued combat actions
		// Handle action delays, animation timing, etc.
	}

	private endCombatSession(sessionId: string): void {
		const session = this.activeCombatSessions.get(sessionId);
		if (session) {
			session.isActive = false;
			this.activeCombatSessions.delete(sessionId);
			print(`Combat session ${sessionId} ended`);
		}
	}
}

/**
 * Singleton instance of the CombatService.
 * Use this instance for all combat-related operations in the server.
 *
 * @example
 * ```typescript
 * import { CombatServiceInstance } from "server/services/combat-service";
 *
 * // Register a combatant with a weapon
 * CombatServiceInstance.RegisterCombatant(character, swordWeapon);
 *
 * // Execute basic attack
 * CombatServiceInstance.ExecuteBasicAttack(attacker, target);
 * ```
 */
export const CombatServiceInstance = CombatService.Start();
