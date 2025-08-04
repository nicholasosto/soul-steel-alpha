/**
 * @file src/server/services/unified-npc-service.ts
 * @module UnifiedNPCService
 * @layer Server/Services
 * @description Unified NPC Service that combines basic and enhanced NPC functionality with configurable features
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Players, RunService, Workspace } from "@rbxts/services";
import { cloneNPCModel, NPC_MODEL_CATALOG, type NPCModelKey } from "shared/catalogs/npc-model-catalog";
import { SSEntity } from "shared/types/SSEntity";
import { isSSEntity } from "shared/helpers/type-guards";

// Import services for enhanced mode
//import { CombatServiceInstance } from "./combat-service";
import { ResourceServiceInstance } from "./resource-service";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

// NPC Modes
export type NPCMode = "basic" | "enhanced";

// AI States (unified from both services)
export type NPCAIState = "idle" | "patrol" | "combat" | "pursuit" | "retreat" | "dead";

// NPC Configuration
export interface NPCConfig {
	// Core settings
	mode?: NPCMode;
	level?: number;
	health?: number;

	// Feature flags for enhanced mode
	enableCombat?: boolean;
	enableResourceManagement?: boolean;
	enableAdvancedAI?: boolean;

	// Combat-specific settings
	aggroRange?: number;
	isHostile?: boolean;
	retreatThreshold?: number; // Health percentage to retreat at

	// AI behavior settings
	patrolRadius?: number;
	idleTime?: number; // Seconds between idle actions
	actionTimeout?: number; // Seconds between AI actions
}

// Base NPC Entity (minimal shared properties)
export interface BaseNPCEntity {
	// Core Roblox components
	Model: Model;
	Humanoid: Humanoid;
	HumanoidRootPart: BasePart;

	// Basic NPC properties
	npcId: string;
	npcType: NPCModelKey;
	aiState: NPCAIState;
	health: number;
	maxHealth: number;
	level: number;
	isActive: boolean;
	spawnTime: number;
	homePosition: Vector3;
	lastActionTime: number;

	// Configuration
	config: Required<NPCConfig>;
}

// Enhanced NPC Entity (for enhanced mode)
export interface EnhancedNPCEntity extends BaseNPCEntity, SSEntity {
	// Combat integration
	isCombatant: boolean;
	currentTarget?: SSEntity;

	// AI behavior state
	behaviorState: {
		lastDamageTime: number;
		lastAbilityTime: number;
		lastTargetSeen: number;
	};
}

// Union type for all NPCs
export type UnifiedNPCEntity = BaseNPCEntity | EnhancedNPCEntity;

// Type guard to check if NPC is enhanced
function isEnhancedNPC(npc: UnifiedNPCEntity): npc is EnhancedNPCEntity {
	return npc.config.mode === "enhanced";
}

// =============================================================================
// NPC TEMPLATES
// =============================================================================

interface NPCTemplate {
	modelKey: NPCModelKey;
	displayName: string;
	baseHealth: number;
	baseMana: number;
	baseLevel: number;
	walkSpeed: number;
	defaultAggroRange: number;
	defaultHostile: boolean;
	availableAbilities: string[];
	combatRole: "damage" | "tank" | "caster";
	defaultRetreatThreshold: number;
}

const NPC_TEMPLATES: Record<string, NPCTemplate> = {
	goblin: {
		modelKey: "goblin",
		displayName: "Goblin Warrior",
		baseHealth: 80,
		baseMana: 40,
		baseLevel: 3,
		walkSpeed: 12,
		defaultAggroRange: 15,
		defaultHostile: true,
		availableAbilities: ["Melee"],
		combatRole: "damage",
		defaultRetreatThreshold: 0.2,
	},
	skeleton: {
		modelKey: "skeleton",
		displayName: "Skeleton Mage",
		baseHealth: 120,
		baseMana: 80,
		baseLevel: 5,
		walkSpeed: 10,
		defaultAggroRange: 20,
		defaultHostile: true,
		availableAbilities: ["Melee", "Soul-Drain"],
		combatRole: "caster",
		defaultRetreatThreshold: 0.15,
	},
	guard: {
		modelKey: "guard",
		displayName: "Steam Guard",
		baseHealth: 200,
		baseMana: 60,
		baseLevel: 8,
		walkSpeed: 14,
		defaultAggroRange: 12,
		defaultHostile: false,
		availableAbilities: ["Melee"],
		combatRole: "tank",
		defaultRetreatThreshold: 0.1,
	},
};

// =============================================================================
// UNIFIED NPC SERVICE
// =============================================================================

/**
 * Unified NPC Service
 *
 * Provides both basic and enhanced NPC functionality through configuration flags.
 * Automatically scales complexity based on the requested features.
 */
class UnifiedNPCService {
	private static instance?: UnifiedNPCService;
	private npcs = new Map<string, UnifiedNPCEntity>();
	private npcCounter = 0;

	private constructor() {}

	public static getInstance(): UnifiedNPCService {
		if (!UnifiedNPCService.instance) {
			UnifiedNPCService.instance = new UnifiedNPCService();
		}
		return UnifiedNPCService.instance;
	}

	/**
	 * Spawn an NPC with configurable features
	 */
	public SpawnNPC(npcType: string, position: Vector3, config: NPCConfig = {}): UnifiedNPCEntity | undefined {
		const template = NPC_TEMPLATES[npcType];
		if (!template) {
			warn(`❌ Unknown NPC type: ${npcType}`);
			return undefined;
		}

		// Generate unique ID
		this.npcCounter++;
		const npcId = `npc_${npcType}_${this.npcCounter}`;

		// Resolve configuration with defaults
		const resolvedConfig = this.resolveNPCConfig(config, template);

		try {
			// Clone model from catalog
			const model = cloneNPCModel(template.modelKey, position, `${template.displayName}_${npcId}`);
			if (!model) {
				warn(`❌ Failed to clone model for NPC: ${npcId}`);
				return undefined;
			}

			// Parent to workspace
			model.Parent = Workspace;

			// Create NPC entity based on mode
			let npcEntity: UnifiedNPCEntity | undefined;

			if (resolvedConfig.mode === "enhanced") {
				npcEntity = this.createEnhancedNPC(model, npcId, template, resolvedConfig);
			} else {
				npcEntity = this.createBasicNPC(model, npcId, template, resolvedConfig);
			}

			if (!npcEntity) {
				warn(`❌ Failed to create NPC entity: ${npcId}`);
				model.Destroy();
				return undefined;
			} // Store NPC
			this.npcs.set(npcId, npcEntity);

			// Setup features based on configuration
			this.setupNPCFeatures(npcEntity);

			// Start AI
			this.startNPCAI(npcEntity);

			const modeStr = resolvedConfig.mode === "enhanced" ? "Enhanced" : "Basic";
			const featuresStr = this.getFeaturesString(resolvedConfig);
			print(`✅ Spawned ${modeStr} ${template.displayName} (${npcId}) ${featuresStr}`);

			return npcEntity;
		} catch (error) {
			warn(`❌ Failed to spawn NPC ${npcType}: ${error}`);
			return undefined;
		}
	}

	/**
	 * Resolve NPC configuration with template defaults
	 */
	private resolveNPCConfig(config: NPCConfig, template: NPCTemplate): Required<NPCConfig> {
		return {
			mode: config.mode ?? "basic",
			level: config.level ?? template.baseLevel,
			health: config.health ?? template.baseHealth,
			enableCombat: config.enableCombat ?? config.mode === "enhanced",
			enableResourceManagement: config.enableResourceManagement ?? config.mode === "enhanced",
			enableAdvancedAI: config.enableAdvancedAI ?? config.mode === "enhanced",
			aggroRange: config.aggroRange ?? template.defaultAggroRange,
			isHostile: config.isHostile ?? template.defaultHostile,
			retreatThreshold: config.retreatThreshold ?? template.defaultRetreatThreshold,
			patrolRadius: config.patrolRadius ?? 20,
			idleTime: config.idleTime ?? 5,
			actionTimeout: config.actionTimeout ?? 3,
		};
	}

	/**
	 * Create a basic NPC entity
	 */
	private createBasicNPC(
		model: Model,
		npcId: string,
		template: NPCTemplate,
		config: Required<NPCConfig>,
	): BaseNPCEntity | undefined {
		const humanoid = model.FindFirstChild("Humanoid") as Humanoid;
		const rootPart = model.FindFirstChild("HumanoidRootPart") as BasePart;

		if (!humanoid || !rootPart) {
			warn(`❌ NPC model missing required components: ${npcId}`);
			return undefined;
		}

		// Configure humanoid
		humanoid.WalkSpeed = template.walkSpeed;
		humanoid.MaxHealth = config.health;
		humanoid.Health = humanoid.MaxHealth;

		// Set PrimaryPart
		model.PrimaryPart = rootPart;

		return {
			Model: model,
			Humanoid: humanoid,
			HumanoidRootPart: rootPart,
			npcId,
			npcType: template.modelKey,
			aiState: "idle",
			health: humanoid.Health,
			maxHealth: humanoid.MaxHealth,
			level: config.level,
			isActive: true,
			spawnTime: tick(),
			homePosition: rootPart.Position,
			lastActionTime: tick(),
			config,
		};
	}

	/**
	 * Create an enhanced NPC entity (with SSEntity validation)
	 */
	private createEnhancedNPC(
		model: Model,
		npcId: string,
		template: NPCTemplate,
		config: Required<NPCConfig>,
	): EnhancedNPCEntity | undefined {
		const humanoid = model.FindFirstChild("Humanoid") as Humanoid;
		const rootPart = model.FindFirstChild("HumanoidRootPart") as BasePart;

		if (!humanoid || !rootPart) {
			warn(`❌ Enhanced NPC model missing required components: ${npcId}`);
			return undefined;
		}

		// Validate SSEntity structure for enhanced mode
		if (!isSSEntity(model)) {
			warn(`⚠️ Enhanced NPC model is not a valid SSEntity, some features may not work: ${npcId}`);
		}

		// Configure humanoid
		humanoid.WalkSpeed = template.walkSpeed;
		humanoid.MaxHealth = config.health;
		humanoid.Health = humanoid.MaxHealth;

		// Set PrimaryPart
		model.PrimaryPart = rootPart;

		// Cast to SSEntity for enhanced features
		const ssEntity = model as SSEntity;

		return {
			// Spread SSEntity properties
			...ssEntity,

			// Base NPC properties
			Model: model,
			Humanoid: humanoid,
			HumanoidRootPart: rootPart,
			npcId,
			npcType: template.modelKey,
			aiState: "idle",
			health: humanoid.Health,
			maxHealth: humanoid.MaxHealth,
			level: config.level,
			isActive: true,
			spawnTime: tick(),
			homePosition: rootPart.Position,
			lastActionTime: tick(),
			config,

			// Enhanced properties
			isCombatant: false, // Will be set during combat registration
			behaviorState: {
				lastDamageTime: 0,
				lastAbilityTime: 0,
				lastTargetSeen: 0,
			},
		};
	}

	/**
	 * Setup NPC features based on configuration
	 */
	private setupNPCFeatures(npc: UnifiedNPCEntity): void {
		// const { config } = npc;

		// // Combat system integration
		// if (config.enableCombat && isEnhancedNPC(npc)) {
		// 	try {
		// 		const success = CombatServiceInstance.RegisterCombatant(npc);
		// 		if (success) {
		// 			npc.isCombatant = true;
		// 			print(`⚔️ Registered ${npc.npcId} with combat system`);
		// 		}
		// 	} catch (error) {
		// 		warn(`❌ Failed to register ${npc.npcId} with combat system: ${error}`);
		// 	}
		// }

		// // Resource system integration
		// if (config.enableResourceManagement && isEnhancedNPC(npc)) {
		// 	try {
		// 		//ResourceServiceInstance.initializeEntityHealth(npc);
		// 		print(`💙 Initialized resources for ${npc.npcId}`);
		// 	} catch (error) {
		// 		warn(`❌ Failed to initialize resources for ${npc.npcId}: ${error}`);
		// 	}
		// }
	}

	/**
	 * Start AI behavior for an NPC
	 */
	private startNPCAI(npc: UnifiedNPCEntity): void {
		const connection = RunService.Heartbeat.Connect(() => {
			if (!npc.isActive || !npc.Model.Parent) {
				connection.Disconnect();
				return;
			}

			const currentTime = tick();

			// Death check
			if (npc.Humanoid.Health <= 0 && npc.aiState !== "dead") {
				this.handleNPCDeath(npc);
				return;
			}

			// Enhanced AI for enhanced NPCs
			if (npc.config.enableAdvancedAI && isEnhancedNPC(npc)) {
				this.executeAdvancedAI(npc, currentTime);
			} else {
				this.executeBasicAI(npc, currentTime);
			}
		});
	}

	/**
	 * Execute basic AI behavior
	 */
	private executeBasicAI(npc: UnifiedNPCEntity, currentTime: number): void {
		const { config } = npc;

		switch (npc.aiState) {
			case "idle":
				if (currentTime - npc.lastActionTime > config.idleTime) {
					// Look around randomly
					const randomDirection = CFrame.lookAt(
						npc.HumanoidRootPart.Position,
						npc.HumanoidRootPart.Position.add(new Vector3(math.random(-10, 10), 0, math.random(-10, 10))),
					);
					npc.HumanoidRootPart.CFrame = randomDirection;
					npc.lastActionTime = currentTime;
				}
				break;

			case "patrol":
				if (currentTime - npc.lastActionTime > config.actionTimeout) {
					const patrolTarget = npc.homePosition.add(
						new Vector3(
							math.random(-config.patrolRadius, config.patrolRadius),
							0,
							math.random(-config.patrolRadius, config.patrolRadius),
						),
					);
					npc.Humanoid.MoveTo(patrolTarget);
					npc.lastActionTime = currentTime;
				}
				break;

			case "combat": {
				// Basic combat - just face nearest player
				const nearestPlayer = this.findNearestPlayer(npc.HumanoidRootPart.Position, config.aggroRange);
				if (nearestPlayer) {
					const playerPos = (nearestPlayer.Character!.FindFirstChild("HumanoidRootPart") as BasePart)
						.Position;
					const lookDirection = CFrame.lookAt(npc.HumanoidRootPart.Position, playerPos);
					npc.HumanoidRootPart.CFrame = lookDirection;
				} else {
					this.SetAIState(npc.npcId, "idle");
				}
				break;
			}
		}

		// Basic player detection for hostile NPCs
		if (config.isHostile && npc.aiState === "idle") {
			const nearestPlayer = this.findNearestPlayer(npc.HumanoidRootPart.Position, config.aggroRange);
			if (nearestPlayer) {
				this.SetAIState(npc.npcId, "patrol");
			}
		}
	}

	/**
	 * Execute advanced AI behavior (for enhanced NPCs)
	 */
	private executeAdvancedAI(npc: EnhancedNPCEntity, currentTime: number): void {
		const { config } = npc;

		// Health-based retreat logic
		const healthPercentage = npc.Humanoid.Health / npc.Humanoid.MaxHealth;
		if (healthPercentage <= config.retreatThreshold && npc.aiState !== "retreat") {
			this.SetAIState(npc.npcId, "retreat");
			return;
		}

		// Find targets for hostile NPCs
		let nearestTarget: SSEntity | undefined;
		if (config.isHostile && npc.aiState !== "dead" && npc.aiState !== "retreat") {
			nearestTarget = this.findNearestTarget(npc);
			if (nearestTarget && npc.aiState === "idle") {
				this.SetAIState(npc.npcId, "combat");
				npc.currentTarget = nearestTarget;
			}
		}

		// Execute state-specific advanced behavior
		switch (npc.aiState) {
			case "combat":
				if (nearestTarget && npc.isCombatant) {
					this.executeAdvancedCombat(npc, nearestTarget, currentTime);
				} else {
					this.SetAIState(npc.npcId, "patrol");
				}
				break;

			case "pursuit":
				if (nearestTarget) {
					npc.Humanoid.MoveTo(nearestTarget.HumanoidRootPart.Position);
					const distance = npc.HumanoidRootPart.Position.sub(
						nearestTarget.HumanoidRootPart.Position,
					).Magnitude;
					if (distance <= 6) {
						this.SetAIState(npc.npcId, "combat");
					}
				} else {
					this.SetAIState(npc.npcId, "patrol");
				}
				break;

			case "retreat": {
				// Move away from home position
				const retreatTarget = npc.homePosition.add(new Vector3(math.random(-30, 30), 0, math.random(-30, 30)));
				npc.Humanoid.MoveTo(retreatTarget);

				// Return to combat if health recovers
				const healthPercentage = npc.Humanoid.Health / npc.Humanoid.MaxHealth;
				if (healthPercentage > config.retreatThreshold + 0.1) {
					this.SetAIState(npc.npcId, "idle");
				}
				break;
			}

			default:
				// Fall back to basic AI for other states
				this.executeBasicAI(npc, currentTime);
				break;
		}
	}

	/**
	 * Execute advanced combat behavior
	 */
	private executeAdvancedCombat(npc: EnhancedNPCEntity, target: SSEntity, currentTime: number): void {
		const distance = npc.HumanoidRootPart.Position.sub(target.HumanoidRootPart.Position).Magnitude;
		const template = NPC_TEMPLATES[npc.npcType];

		// Use abilities if available and cooldown ready
		if (currentTime - npc.behaviorState.lastAbilityTime > 3) {
			for (const abilityKey of template.availableAbilities) {
				try {
					if (abilityKey === "Melee" && distance <= 6) {
						//CombatServiceInstance.ExecuteBasicAttack(npc, target);
						npc.behaviorState.lastAbilityTime = currentTime;
						break;
					}
					// Add more ability logic here as needed
				} catch (error) {
					warn(`❌ Failed to execute ability ${abilityKey}: ${error}`);
				}
			}
		}

		// Move closer if too far
		if (distance > 8) {
			npc.Humanoid.MoveTo(target.HumanoidRootPart.Position);
		}
	}

	/**
	 * Handle NPC death
	 */
	private handleNPCDeath(npc: UnifiedNPCEntity): void {
		npc.aiState = "dead";
		npc.isActive = false;

		// Unregister from systems if enhanced
		if (isEnhancedNPC(npc) && npc.isCombatant) {
			// CombatServiceInstance.unregisterCombatant(npc);
		}

		print(`💀 ${npc.npcId} has been defeated!`);

		// Schedule cleanup
		task.spawn(() => {
			task.wait(3);
			this.DespawnNPC(npc.npcId);
		});
	}

	/**
	 * Find nearest target for enhanced NPCs
	 */
	private findNearestTarget(npc: EnhancedNPCEntity): SSEntity | undefined {
		let nearestTarget: SSEntity | undefined;
		let nearestDistance = npc.config.aggroRange;

		// Check for players
		for (const player of Players.GetPlayers()) {
			if (player.Character && player.Character.FindFirstChild("HumanoidRootPart")) {
				const playerEntity = player.Character as SSEntity;
				const distance = npc.HumanoidRootPart.Position.sub(playerEntity.HumanoidRootPart.Position).Magnitude;

				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestTarget = playerEntity;
				}
			}
		}

		return nearestTarget;
	}

	/**
	 * Find nearest player (for basic NPCs)
	 */
	private findNearestPlayer(position: Vector3, maxDistance: number): Player | undefined {
		let nearestPlayer: Player | undefined;
		let nearestDistance = maxDistance;

		for (const player of Players.GetPlayers()) {
			if (!player.Character || !player.Character.FindFirstChild("HumanoidRootPart")) {
				continue;
			}

			const playerPosition = (player.Character.FindFirstChild("HumanoidRootPart") as BasePart).Position;
			const distance = playerPosition.sub(position).Magnitude;

			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearestPlayer = player;
			}
		}

		return nearestPlayer;
	}

	/**
	 * Get features string for logging
	 */
	private getFeaturesString(config: Required<NPCConfig>): string {
		const features: string[] = [];
		if (config.enableCombat === true) features.push("Combat");
		if (config.enableResourceManagement === true) features.push("Resources");
		if (config.enableAdvancedAI === true) features.push("Advanced AI");
		return features.size() > 0 ? `[${features.join(", ")}]` : "";
	}

	// =============================================================================
	// PUBLIC API METHODS
	// =============================================================================

	/**
	 * Set NPC AI state
	 */
	public SetAIState(npcId: string, state: NPCAIState): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc) {
			warn(`❌ NPC not found: ${npcId}`);
			return false;
		}

		const oldState = npc.aiState;
		npc.aiState = state;
		npc.lastActionTime = tick();

		print(`🧠 ${npcId}: ${oldState} → ${state}`);
		return true;
	}

	/**
	 * Remove an NPC from the game
	 */
	public DespawnNPC(npcId: string): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc) {
			warn(`❌ NPC not found: ${npcId}`);
			return false;
		}

		// Unregister from systems if enhanced
		// if (isEnhancedNPC(npc) && npc.isCombatant) {
		// 	CombatServiceInstance.unregisterCombatant(npc);
		// }

		// Clean up model
		if (npc.Model.Parent) {
			npc.Model.Destroy();
		}

		// Remove from tracking
		this.npcs.delete(npcId);

		print(`🗑️ Despawned NPC: ${npcId}`);
		return true;
	}

	/**
	 * Get NPC by ID
	 */
	public GetNPC(npcId: string): UnifiedNPCEntity | undefined {
		return this.npcs.get(npcId);
	}

	/**
	 * Get all active NPCs
	 */
	public GetAllNPCs(): UnifiedNPCEntity[] {
		const activeNPCs: UnifiedNPCEntity[] = [];
		this.npcs.forEach((npc) => {
			if (npc.isActive) {
				activeNPCs.push(npc);
			}
		});
		return activeNPCs;
	}

	/**
	 * Get NPCs within range of a position
	 */
	public GetNPCsInRange(position: Vector3, range: number): UnifiedNPCEntity[] {
		const npcsInRange: UnifiedNPCEntity[] = [];

		this.npcs.forEach((npc) => {
			if (!npc.isActive) return;

			const distance = npc.HumanoidRootPart.Position.sub(position).Magnitude;
			if (distance <= range) {
				npcsInRange.push(npc);
			}
		});

		return npcsInRange;
	}

	/**
	 * Force NPC to attack a specific target (for enhanced NPCs only)
	 */
	public ForceNPCAttack(npcId: string, target: SSEntity): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc || !isEnhancedNPC(npc) || !npc.isCombatant) {
			warn(`❌ Cannot force attack: NPC ${npcId} is not an enhanced combatant`);
			return false;
		}

		npc.currentTarget = target;
		this.SetAIState(npcId, "combat");
		print(`🎯 Forced ${npcId} to attack ${target.Name ?? "target"}`);
		return true;
	}

	/**
	 * Get NPC service statistics
	 */
	public GetStats(): Record<string, unknown> {
		let basicCount = 0;
		let enhancedCount = 0;
		let combatantCount = 0;

		this.npcs.forEach((npc) => {
			if (npc.config.mode === "basic") {
				basicCount++;
			} else {
				enhancedCount++;
				if (isEnhancedNPC(npc) && npc.isCombatant) {
					combatantCount++;
				}
			}
		});

		return {
			totalNPCs: this.npcs.size(),
			basicNPCs: basicCount,
			enhancedNPCs: enhancedCount,
			combatants: combatantCount,
			activeNPCs: this.GetAllNPCs().size(),
		};
	}
}

// Export singleton instance
export const UnifiedNPCServiceInstance = UnifiedNPCService.getInstance();
