/**
 * @file src/server/services/enhanced-combat-service.ts
 * @module EnhancedCombatService
 * @layer Server/Services
 * @description Enhanced combat service implementing damage container system and advanced combat flow
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.1.0
 * @lastUpdated 2025-08-01 - Enhanced combat damage flow implementation
 */

import { Players, RunService, HttpService } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import {
	DamageContainer,
	DamageApplicationResult,
	CombatContext,
	CombatMetrics,
	RewardData,
	CombatAnalyticsData,
	CombatSessionId,
	DamageContainerId,
	TargetDamageResult,
	StatusEffectApplication,
	EnvironmentalModifier,
	DamageContainerStatus,
} from "shared/types/CombatFlowTypes";
import { DamageInfo, DamageType, CombatStats } from "shared/types/ResourceTypes";
import { AbilityKey } from "shared/keys";

// Import existing services for integration
import { ResourceService } from "./resource-service";

/**
 * Enhanced Combat Service - Implements damage container system for advanced combat flow
 */
export class EnhancedCombatService {
	private static instance: EnhancedCombatService;

	// Core systems
	private resourceService: ResourceService;

	// Damage container management
	private activeDamageContainers = new Map<DamageContainerId, DamageContainer>();
	private containerExpirationTimes = new Map<DamageContainerId, number>();

	// Combat session management
	private activeCombatSessions = new Map<CombatSessionId, CombatAnalyticsData>();
	private entityToSession = new Map<SSEntity, CombatSessionId>();

	// Combat metrics and analytics
	private playerMetrics = new Map<string, CombatMetrics>();
	private combatHistory = new Map<string, CombatAnalyticsData[]>();

	// Configuration
	private readonly CONTAINER_EXPIRATION_TIME = 5; // seconds
	private readonly MAX_CONTAINERS_PER_ENTITY = 10;
	private readonly MAX_HISTORY_ENTRIES = 100;

	private constructor() {
		// Get singleton instance of ResourceService
		this.resourceService = ResourceService.GetInstance();

		this.startContainerCleanup();
	}

	public static getInstance(): EnhancedCombatService {
		if (!EnhancedCombatService.instance) {
			EnhancedCombatService.instance = new EnhancedCombatService();
		}
		return EnhancedCombatService.instance;
	}

	/**
	 * Handle enhanced basic attack request
	 */
	public handleEnhancedBasicAttack(
		attacker: SSEntity,
		target: SSEntity,
		weaponId?: string,
		contextString?: string,
	): DamageApplicationResult | undefined {
		if (!isSSEntity(attacker) || !isSSEntity(target)) {
			warn("Invalid entities for enhanced basic attack");
			return undefined;
		}

		// Parse context if provided
		const context = contextString !== undefined ? this.parseContext(contextString) : undefined;

		// Create basic damage info (simplified)
		const baseDamage = 50; // Placeholder value
		const damageInfo: DamageInfo = {
			baseDamage: baseDamage,
			damageType: "physical",
			source: attacker,
			sourceId: weaponId !== undefined ? weaponId : "basic_attack",
			canCrit: true,
		};

		// Create damage container
		const container = this.createDamageContainer(attacker, [target], damageInfo, context);

		// Apply the container
		return this.applyDamageContainer(container);
	}

	/**
	 * Handle ability with enhanced context
	 */
	public handleAbilityWithContext(
		caster: SSEntity,
		abilityKey: AbilityKey,
		target?: SSEntity,
		contextString?: string,
	): DamageApplicationResult | undefined {
		if (!isSSEntity(caster)) {
			warn("Invalid caster for ability with context");
			return undefined;
		}

		const context = contextString !== undefined ? this.parseContext(contextString) : undefined;

		// Create ability damage info (simplified)
		const baseDamage = 75; // Placeholder value
		const damageInfo: DamageInfo = {
			baseDamage: baseDamage,
			damageType: "magical",
			source: caster,
			sourceId: abilityKey,
			canCrit: true,
		};

		const targets = target ? [target] : [];
		if (targets.size() === 0) {
			warn("No targets for ability");
			return undefined;
		}

		const container = this.createDamageContainer(caster, targets, damageInfo, context);
		return this.applyDamageContainer(container);
	}

	/**
	 * Create a new damage container
	 */
	public createDamageContainer(
		source: SSEntity,
		targets: SSEntity[],
		damageInfo: DamageInfo,
		context?: CombatContext,
	): DamageContainer {
		const containerId = HttpService.GenerateGUID(false);
		const timestamp = tick();

		// Get or create combat session
		let sessionId = this.entityToSession.get(source);
		if (sessionId === undefined || !this.activeCombatSessions.has(sessionId)) {
			sessionId = this.createCombatSession([source, ...targets]);
		}

		// Handle secondary targets with simple array manipulation
		const primaryTarget = targets[0];
		const secondaryTargets: SSEntity[] = [];
		for (let i = 1; i < targets.size(); i++) {
			secondaryTargets.push(targets[i]);
		}

		const container: DamageContainer = {
			id: containerId,
			timestamp: timestamp,
			sessionId: sessionId,
			source: source,
			sourceAbility: context?.comboInfo?.comboId as AbilityKey,
			primaryTarget: primaryTarget,
			secondaryTargets: secondaryTargets.size() > 0 ? secondaryTargets : undefined,
			baseDamage: damageInfo.baseDamage,
			damageType: damageInfo.damageType,
			canCrit: damageInfo.canCrit,
			multipliers: damageInfo.multipliers || [],
			status: "pending",
			comboStep: context?.comboInfo?.currentStep,
			comboMultiplier: context?.comboInfo?.multiplier,
			environmentalModifiers: this.getEnvironmentalModifiers(context),
		};

		// Store container
		this.activeDamageContainers.set(containerId, container);
		this.containerExpirationTimes.set(containerId, timestamp + this.CONTAINER_EXPIRATION_TIME);

		print(`Created damage container ${containerId} for ${damageInfo.baseDamage} damage`);

		return container;
	}

	/**
	 * Apply a damage container to its targets
	 */
	public applyDamageContainer(container: DamageContainer): DamageApplicationResult {
		if (container.status !== "pending") {
			warn(`Cannot apply damage container ${container.id} - status: ${container.status}`);
			return this.createFailureResult(container, "Container not pending");
		}

		const allTargets = [container.primaryTarget];
		if (container.secondaryTargets) {
			for (const target of container.secondaryTargets) {
				allTargets.push(target);
			}
		}

		const targetResults = new Map<SSEntity, TargetDamageResult>();
		let totalDamageDealt = 0;
		let experienceEarned = 0;

		// Process each target
		for (const target of allTargets) {
			const result = this.applyDamageToTarget(container, target);
			targetResults.set(target, result);
			totalDamageDealt += result.damageDealt;

			// Calculate experience based on damage dealt
			experienceEarned += this.calculateExperience(result.damageDealt, result.targetKilled);
		}

		// Update container status
		container.status = "applied";
		container.appliedDamage = new Map();
		container.criticalHits = [];
		container.blockedTargets = [];

		// Iterate through targetResults manually
		const targetResultEntries: [SSEntity, TargetDamageResult][] = [];
		targetResults.forEach((result, target) => {
			targetResultEntries.push([target, result]);
		});

		for (const [target, result] of targetResultEntries) {
			container.appliedDamage.set(target, result.damageDealt);
			if (result.wasCritical && container.criticalHits) {
				container.criticalHits.push(target);
			}
			if (result.wasBlocked && container.blockedTargets) {
				container.blockedTargets.push(target);
			}
		}

		// Calculate combat metrics
		const metrics = this.calculateCombatMetrics(container, targetResults);

		// Create application result
		const applicationResult: DamageApplicationResult = {
			containerId: container.id,
			success: true,
			targetResults: targetResults,
			totalDamageDealt: totalDamageDealt,
			experienceEarned: experienceEarned,
			metrics: metrics,
		};

		// Update analytics
		this.updateCombatAnalytics(container, applicationResult);

		// Calculate and apply rewards
		const rewards = this.calculateRewards(container.source, applicationResult);
		this.applyRewards(container.source, rewards);

		print(`Applied damage container ${container.id}: ${totalDamageDealt} total damage`);

		// Update player metrics
		const player = Players.GetPlayerFromCharacter(container.source);
		if (player) {
			const playerId = tostring(player.UserId);
			this.updatePlayerMetrics(playerId, metrics);
		}

		return applicationResult;
	}

	/**
	 * Apply damage to a single target
	 */
	private applyDamageToTarget(container: DamageContainer, target: SSEntity): TargetDamageResult {
		const stats = this.resourceService.getEntityStats(target);
		if (!stats) {
			return {
				target: target,
				damageDealt: 0,
				wasCritical: false,
				wasBlocked: false,
				blockPercentage: 0,
				statusEffectsApplied: [],
				targetKilled: false,
			};
		}

		// Calculate final damage
		let finalDamage = container.baseDamage;

		// Apply multipliers
		for (const multiplier of container.multipliers) {
			finalDamage *= multiplier;
		}

		// Apply combo multiplier
		if (container.comboMultiplier !== undefined) {
			finalDamage *= container.comboMultiplier;
		}

		// Apply environmental modifiers
		if (container.environmentalModifiers) {
			for (const modifier of container.environmentalModifiers) {
				finalDamage *= modifier.multiplier;
			}
		}

		// Check for critical hit
		const wasCritical = container.canCrit && math.random() < stats.criticalChance;
		if (wasCritical) {
			finalDamage *= stats.criticalMultiplier;
		}

		// Apply defense
		const damageReduction = stats.defense / (stats.defense + 100);
		finalDamage *= 1 - damageReduction;

		// Check for blocking (placeholder implementation)
		const blockChance = 0.1; // 10% base block chance
		const wasBlocked = math.random() < blockChance;
		const blockPercentage = wasBlocked ? 0.5 : 0; // 50% damage reduction when blocked
		finalDamage *= 1 - blockPercentage;

		// Ensure minimum damage
		finalDamage = math.max(1, math.floor(finalDamage));

		// Apply damage using resource service
		const damageInfo: DamageInfo = {
			baseDamage: finalDamage,
			damageType: container.damageType,
			source: container.source,
			sourceId: container.sourceAbility || `container_${container.id}`,
			canCrit: false, // Already calculated
		};

		const damageSuccess = this.resourceService.dealDamage(target, damageInfo);
		const targetKilled = !damageSuccess;

		// Apply status effects (placeholder)
		const statusEffectsApplied: string[] = [];
		if (container.statusEffects) {
			for (const effect of container.statusEffects) {
				if (math.random() < effect.applicationChance) {
					statusEffectsApplied.push(effect.effectId);
					// Apply status effect logic here
				}
			}
		}

		return {
			target: target,
			damageDealt: finalDamage,
			wasCritical: wasCritical,
			wasBlocked: wasBlocked,
			blockPercentage: blockPercentage,
			statusEffectsApplied: statusEffectsApplied,
			targetKilled: targetKilled,
		};
	}

	/**
	 * Calculate combat metrics from damage application
	 */
	private calculateCombatMetrics(
		container: DamageContainer,
		results: Map<SSEntity, TargetDamageResult>,
	): CombatMetrics {
		const totalTargets = results.size();

		// Count successful hits manually
		let successfulHits = 0;
		let criticalHits = 0;
		let totalDamage = 0;

		results.forEach((result) => {
			if (result.damageDealt > 0) {
				successfulHits += 1;
				totalDamage += result.damageDealt;
			}
			if (result.wasCritical) {
				criticalHits += 1;
			}
		});

		return {
			accuracy: totalTargets > 0 ? successfulHits / totalTargets : 0,
			criticalRate: successfulHits > 0 ? criticalHits / successfulHits : 0,
			averageDamage: successfulHits > 0 ? totalDamage / successfulHits : 0,
			dps: totalDamage, // Simplified - would need time tracking
			comboEfficiency: container.comboMultiplier !== undefined ? container.comboMultiplier : 1,
			overkillDamage: 0, // Would need health tracking
			targetsHit: successfulHits,
			combatDuration: 1, // Simplified - would need session tracking
		};
	}

	/**
	 * Calculate rewards based on combat performance
	 */
	private calculateRewards(source: SSEntity, result: DamageApplicationResult): RewardData {
		const baseExperience = result.experienceEarned;
		const performanceBonus = math.floor(baseExperience * result.metrics.accuracy * 0.5);

		// Count killed targets manually
		let killedTargets = 0;
		result.targetResults.forEach((targetResult) => {
			if (targetResult.targetKilled) {
				killedTargets += 1;
			}
		});

		return {
			baseExperience: baseExperience,
			bonusExperience: performanceBonus,
			totalExperience: baseExperience + performanceBonus,
			currency: {
				gold: math.floor(result.totalDamageDealt * 0.1),
				souls: killedTargets,
				tokens: result.metrics.criticalRate > 0.5 ? 1 : 0,
			},
			items: [], // Placeholder
			achievementProgress: [], // Placeholder
			reputation: [], // Placeholder
		};
	}

	/**
	 * Apply rewards to a player
	 */
	private applyRewards(entity: SSEntity, rewards: RewardData): void {
		const player = Players.GetPlayerFromCharacter(entity);
		if (!player) return;

		// Apply rewards through data service (placeholder)
		// This would integrate with the actual data service
		print(`Rewards for ${player.Name}: ${rewards.totalExperience} XP, ${rewards.currency.gold} gold`);
	}

	/**
	 * Get environmental modifiers for current context
	 */
	private getEnvironmentalModifiers(context?: CombatContext): EnvironmentalModifier[] {
		if (!context?.environment) return [];

		const modifiers: EnvironmentalModifier[] = [];

		// Weather effects
		if (context.environment.weather === "rain") {
			modifiers.push({
				type: "weather",
				multiplier: 0.9,
				description: "Rain reduces fire damage",
			});
		}

		// Time of day effects
		if (context.environment.lighting === "night") {
			modifiers.push({
				type: "lighting",
				multiplier: 1.1,
				description: "Darkness enhances shadow abilities",
			});
		}

		return modifiers;
	}

	/**
	 * Create a new combat session
	 */
	private createCombatSession(participants: SSEntity[]): CombatSessionId {
		const sessionId = HttpService.GenerateGUID(false);
		const timestamp = tick();

		const sessionData: CombatAnalyticsData = {
			sessionId: sessionId,
			participants: participants,
			startTime: timestamp,
			endTime: 0,
			damageContainers: [],
			results: [],
			sessionMetrics: {
				totalDamage: 0,
				attacksAttempted: 0,
				successfulHits: 0,
				overallAccuracy: 0,
				averageAttackInterval: 0,
				highestDamage: 0,
				winner: undefined,
			},
		};

		this.activeCombatSessions.set(sessionId, sessionData);

		// Map entities to session
		for (const entity of participants) {
			this.entityToSession.set(entity, sessionId);
		}

		print(`Created combat session ${sessionId} with ${participants.size()} participants`);

		return sessionId;
	}

	/**
	 * Update combat analytics with new data
	 */
	private updateCombatAnalytics(container: DamageContainer, result: DamageApplicationResult): void {
		const session = this.activeCombatSessions.get(container.sessionId);
		if (!session) return;

		session.damageContainers.push(container);
		session.results.push(result);

		// Update session metrics
		session.sessionMetrics.totalDamage += result.totalDamageDealt;
		session.sessionMetrics.attacksAttempted += 1;
		session.sessionMetrics.successfulHits += result.success ? 1 : 0;
		session.sessionMetrics.overallAccuracy =
			session.sessionMetrics.successfulHits / session.sessionMetrics.attacksAttempted;
		session.sessionMetrics.highestDamage = math.max(session.sessionMetrics.highestDamage, result.totalDamageDealt);
	}

	/**
	 * Update player combat metrics
	 */
	private updatePlayerMetrics(playerId: string, newMetrics: CombatMetrics): void {
		const existing = this.playerMetrics.get(playerId);
		if (!existing) {
			this.playerMetrics.set(playerId, newMetrics);
			return;
		}

		// Merge metrics (simplified averaging)
		const merged: CombatMetrics = {
			accuracy: (existing.accuracy + newMetrics.accuracy) / 2,
			criticalRate: (existing.criticalRate + newMetrics.criticalRate) / 2,
			averageDamage: (existing.averageDamage + newMetrics.averageDamage) / 2,
			dps: (existing.dps + newMetrics.dps) / 2,
			comboEfficiency: (existing.comboEfficiency + newMetrics.comboEfficiency) / 2,
			overkillDamage: existing.overkillDamage + newMetrics.overkillDamage,
			targetsHit: existing.targetsHit + newMetrics.targetsHit,
			combatDuration: existing.combatDuration + newMetrics.combatDuration,
		};

		this.playerMetrics.set(playerId, merged);
	}

	/**
	 * Get active damage containers for an entity
	 */
	public getActiveDamageContainers(entity: SSEntity): DamageContainer[] {
		const containers: DamageContainer[] = [];

		this.activeDamageContainers.forEach((container) => {
			if (container.source === entity || container.primaryTarget === entity) {
				containers.push(container);
			}
		});

		return containers;
	}

	/**
	 * Get combat session data
	 */
	public getCombatSession(sessionId: CombatSessionId): CombatAnalyticsData | undefined {
		return this.activeCombatSessions.get(sessionId);
	}

	/**
	 * Get player combat metrics
	 */
	public getPlayerCombatMetrics(playerId: string): CombatMetrics | undefined {
		return this.playerMetrics.get(playerId);
	}

	/**
	 * Get combat history for a player
	 */
	public getCombatHistory(playerId: string, limit?: number): CombatAnalyticsData[] {
		const history = this.combatHistory.get(playerId) || [];
		if (limit !== undefined && limit < history.size()) {
			const limitedHistory: CombatAnalyticsData[] = [];
			for (let i = 0; i < limit && i < history.size(); i++) {
				limitedHistory.push(history[i]);
			}
			return limitedHistory;
		}
		return history;
	}

	/**
	 * Start container cleanup process
	 */
	private startContainerCleanup(): void {
		RunService.Heartbeat.Connect(() => {
			const currentTime = tick();
			const expiredContainers: DamageContainerId[] = [];

			this.containerExpirationTimes.forEach((expirationTime, containerId) => {
				if (currentTime >= expirationTime) {
					expiredContainers.push(containerId);
				}
			});

			for (const containerId of expiredContainers) {
				this.expireContainer(containerId);
			}
		});
	}

	/**
	 * Expire a damage container
	 */
	private expireContainer(containerId: DamageContainerId): void {
		const container = this.activeDamageContainers.get(containerId);
		if (container && container.status === "pending") {
			container.status = "expired";
			print(`Damage container ${containerId} expired`);
		}

		this.activeDamageContainers.delete(containerId);
		this.containerExpirationTimes.delete(containerId);
	}

	/**
	 * Create a failure result
	 */
	private createFailureResult(container: DamageContainer, reason: string): DamageApplicationResult {
		return {
			containerId: container.id,
			success: false,
			failureReason: reason,
			targetResults: new Map(),
			totalDamageDealt: 0,
			experienceEarned: 0,
			metrics: {
				accuracy: 0,
				criticalRate: 0,
				averageDamage: 0,
				dps: 0,
				comboEfficiency: 0,
				overkillDamage: 0,
				targetsHit: 0,
				combatDuration: 0,
			},
		};
	}

	/**
	 * Calculate experience from damage dealt
	 */
	private calculateExperience(damage: number, targetKilled: boolean): number {
		let experience = math.floor(damage * 0.1);
		if (targetKilled) {
			experience += 50; // Bonus for kill
		}
		return experience;
	}

	/**
	 * Parse context string into CombatContext
	 */
	private parseContext(contextString: string): CombatContext | undefined {
		try {
			return HttpService.JSONDecode(contextString) as CombatContext;
		} catch {
			warn(`Failed to parse combat context: ${contextString}`);
			return undefined;
		}
	}

	/**
	 * Cleanup method for service shutdown
	 */
	public destroy(): void {
		this.activeDamageContainers.clear();
		this.containerExpirationTimes.clear();
		this.activeCombatSessions.clear();
		this.entityToSession.clear();
		this.playerMetrics.clear();
		this.combatHistory.clear();
	}
}
