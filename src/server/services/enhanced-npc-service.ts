import { Players, RunService, Workspace } from "@rbxts/services";
import { cloneNPCModel, NPC_MODEL_CATALOG, type NPCModelKey } from "shared/catalogs/npc-model-catalog";
import { SSEntity } from "shared/types/SSEntity";
import { CombatServiceInstance } from "server/services/combat-service";
import { ResourceServiceInstance } from "server/services/resource-service";

// Phase 2: Enhanced NPC Types with full SSEntity compatibility
export type NPCType = "goblin" | "skeleton" | "guard";
export type NPCAIState = "idle" | "patrol" | "combat" | "pursuit" | "retreat" | "dead";

// Phase 2: Full NPC Entity (now extends SSEntity completely)
export interface NPCEntity extends SSEntity {
	// NPC-specific properties
	npcId: string;
	npcType: NPCType;
	aiState: NPCAIState;
	level: number;
	isActive: boolean;
	spawnTime: number;
	homePosition: Vector3;
	lastActionTime: number;

	// Combat integration
	isCombatant: boolean;
	currentTarget?: SSEntity;
	aggroRange: number;

	// AI behavior
	behaviorState: {
		lastDamageTime: number;
		lastAbilityTime: number;
		retreatThreshold: number;
	};
}

// Phase 2: Enhanced NPC Configuration
export interface NPCConfig {
	level?: number;
	health?: number;
	aggroRange?: number;
	isHostile?: boolean;
}

// Phase 2: Enhanced NPC Templates with combat integration
const NPC_TEMPLATES = {
	goblin: {
		modelKey: "goblin" as NPCModelKey,
		displayName: "Goblin Warrior",
		baseHealth: 80,
		baseMana: 40,
		baseLevel: 3,
		walkSpeed: 12,
		aggroRange: 15,
		isHostile: true,
		availableAbilities: ["Melee"],
		combatRole: "damage" as const,
		retreatThreshold: 0.2, // Retreat at 20% health
	},
	skeleton: {
		modelKey: "skeleton" as NPCModelKey,
		displayName: "Skeleton Mage",
		baseHealth: 120,
		baseMana: 80,
		baseLevel: 5,
		walkSpeed: 10,
		aggroRange: 20,
		isHostile: true,
		availableAbilities: ["Melee", "Soul-Drain"],
		combatRole: "caster" as const,
		retreatThreshold: 0.15, // Retreat at 15% health
	},
	guard: {
		modelKey: "guard" as NPCModelKey,
		displayName: "Steam Guard",
		baseHealth: 200,
		baseMana: 60,
		baseLevel: 8,
		walkSpeed: 14,
		aggroRange: 12,
		isHostile: false,
		availableAbilities: ["Melee"],
		combatRole: "tank" as const,
		retreatThreshold: 0.1, // Retreat at 10% health (guards are tough!)
	},
} as const;

/**
 * Phase 2: Enhanced NPC Service with Combat Integration
 *
 * Features:
 * - Full SSEntity compatibility
 * - Combat system integration
 * - Resource management integration
 * - Enhanced AI with combat behaviors
 * - Ability usage and targeting
 */
class EnhancedNPCService {
	private static instance?: EnhancedNPCService;
	private npcs = new Map<string, NPCEntity>();
	private npcCounter = 0;

	private constructor() {}

	public static getInstance(): EnhancedNPCService {
		if (!EnhancedNPCService.instance) {
			EnhancedNPCService.instance = new EnhancedNPCService();
		}
		return EnhancedNPCService.instance;
	}

	/**
	 * Spawn an enhanced NPC with full combat integration
	 */
	public SpawnNPC(npcType: NPCType, position: Vector3, config?: NPCConfig): NPCEntity | undefined {
		try {
			const template = NPC_TEMPLATES[npcType];
			if (!template) {
				warn(`❌ Unknown NPC type: ${npcType}`);
				return undefined;
			}

			// Generate unique ID
			this.npcCounter++;
			const npcId = `npc_${npcType}_${this.npcCounter}`;

			// Clone model from catalog
			const model = cloneNPCModel(template.modelKey, position, `${template.displayName}_${npcId}`);
			if (!model) {
				warn(`❌ Failed to clone model for NPC: ${npcId}`);
				return undefined;
			}

			// Parent to workspace
			model.Parent = Workspace;

			// Validate SSEntity structure
			const npcEntity = this.validateAndCreateNPCEntity(model, npcId, npcType, template, config);
			if (!npcEntity) {
				warn(`❌ Failed to create valid SSEntity for NPC: ${npcId}`);
				model.Destroy();
				return undefined;
			}

			// Register with combat system
			if (template.isHostile || config?.isHostile) {
				this.registerNPCWithCombatSystem(npcEntity, template);
			}

			// Register with resource system
			this.registerNPCWithResourceSystem(npcEntity, template, config);

			// Store NPC
			this.npcs.set(npcId, npcEntity);

			// Start enhanced AI
			this.startEnhancedAI(npcEntity, template);

			print(`✅ Spawned ${template.displayName} (${npcId}) - Combat Ready: ${npcEntity.isCombatant}`);
			return npcEntity;
		} catch (error) {
			warn(`❌ Failed to spawn NPC ${npcType}: ${error}`);
			return undefined;
		}
	}

	/**
	 * Validate model structure and create full NPCEntity
	 */
	private validateAndCreateNPCEntity(
		model: Model,
		npcId: string,
		npcType: NPCType,
		template: (typeof NPC_TEMPLATES)[NPCType],
		config?: NPCConfig,
	): NPCEntity | undefined {
		// Check for required Humanoid and HumanoidRootPart
		const humanoid = model.FindFirstChild("Humanoid") as Humanoid;
		const rootPart = model.FindFirstChild("HumanoidRootPart") as BasePart;

		if (!humanoid || !rootPart) {
			warn(`❌ NPC model missing Humanoid or HumanoidRootPart: ${npcId}`);
			return undefined;
		}

		// Configure humanoid
		humanoid.WalkSpeed = template.walkSpeed;
		humanoid.MaxHealth = config?.health ?? template.baseHealth;
		humanoid.Health = humanoid.MaxHealth;

		// Set PrimaryPart
		model.PrimaryPart = rootPart;

		// Try to cast to SSEntity (your models should have all required parts)
		const ssEntity = model as SSEntity;

		// Verify critical SSEntity parts exist
		const requiredParts = ["Head", "UpperTorso", "LowerTorso", "LeftHand", "RightHand"];
		for (const partName of requiredParts) {
			if (!ssEntity.FindFirstChild(partName)) {
				warn(`⚠️ NPC model missing ${partName}, combat abilities may be limited: ${npcId}`);
			}
		}

		// Create enhanced NPC entity
		const npcEntity: NPCEntity = {
			// SSEntity properties (spread the model as SSEntity)
			...ssEntity,

			// NPC-specific properties
			npcId: npcId,
			npcType: npcType,
			aiState: "idle",
			level: config?.level ?? template.baseLevel,
			isActive: true,
			spawnTime: tick(),
			homePosition: rootPart.Position,
			lastActionTime: tick(),

			// Combat integration
			isCombatant: false, // Will be set by combat registration
			aggroRange: config?.aggroRange ?? template.aggroRange,

			// AI behavior state
			behaviorState: {
				lastDamageTime: 0,
				lastAbilityTime: 0,
				retreatThreshold: template.retreatThreshold,
			},
		};

		return npcEntity;
	}

	/**
	 * Register NPC with the combat system
	 */
	private registerNPCWithCombatSystem(npc: NPCEntity, template: (typeof NPC_TEMPLATES)[NPCType]): void {
		try {
			// Register as combatant
			const success = CombatServiceInstance.RegisterCombatant(npc);
			if (success) {
				npc.isCombatant = true;
				print(`⚔️ Registered ${npc.npcId} as combatant`);
			} else {
				warn(`⚠️ Failed to register ${npc.npcId} with combat system`);
			}
		} catch (error) {
			warn(`❌ Error registering NPC with combat system: ${error}`);
		}
	}

	/**
	 * Register NPC with the resource system
	 */
	private registerNPCWithResourceSystem(
		npc: NPCEntity,
		template: (typeof NPC_TEMPLATES)[NPCType],
		config?: NPCConfig,
	): void {
		try {
			// Initialize resources
			ResourceServiceInstance.initializeEntityHealth(npc);
			print(`💙 Initialized resources for ${npc.npcId} (${npc.Humanoid.Health}/${npc.Humanoid.MaxHealth} HP)`);
		} catch (error) {
			warn(`❌ Error registering NPC with resource system: ${error}`);
		}
	}

	/**
	 * Enhanced AI with combat behaviors
	 */
	private startEnhancedAI(npc: NPCEntity, template: (typeof NPC_TEMPLATES)[NPCType]): void {
		const connection = RunService.Heartbeat.Connect(() => {
			if (!npc.isActive || !npc.Parent) {
				connection.Disconnect();
				return;
			}

			const currentTime = tick();

			// Check health status
			const healthPercentage = npc.Humanoid.Health / npc.Humanoid.MaxHealth;

			// Death check
			if (npc.Humanoid.Health <= 0 && npc.aiState !== "dead") {
				this.handleNPCDeath(npc);
				return;
			}

			// Retreat check
			if (healthPercentage <= npc.behaviorState.retreatThreshold && npc.aiState !== "retreat") {
				this.SetAIState(npc.npcId, "retreat");
			}

			// Find targets if hostile
			let nearestTarget: SSEntity | undefined;
			if (template.isHostile && npc.aiState !== "dead" && npc.aiState !== "retreat") {
				nearestTarget = this.findNearestTarget(npc);
				if (nearestTarget && npc.aiState === "idle") {
					this.SetAIState(npc.npcId, "combat");
					npc.currentTarget = nearestTarget;
				}
			}

			// Enhanced AI state machine
			this.executeAIBehavior(npc, template, currentTime, nearestTarget);
		});
	}

	/**
	 * Execute AI behavior based on current state
	 */
	private executeAIBehavior(
		npc: NPCEntity,
		template: (typeof NPC_TEMPLATES)[NPCType],
		currentTime: number,
		nearestTarget?: SSEntity,
	): void {
		switch (npc.aiState) {
			case "idle":
				// Idle behavior - look around occasionally
				if (currentTime - npc.lastActionTime > 5) {
					const randomDirection = CFrame.lookAt(
						npc.HumanoidRootPart.Position,
						npc.HumanoidRootPart.Position.add(new Vector3(math.random(-10, 10), 0, math.random(-10, 10))),
					);
					npc.HumanoidRootPart.CFrame = randomDirection;
					npc.lastActionTime = currentTime;
				}
				break;

			case "patrol":
				// Enhanced patrol behavior
				if (currentTime - npc.lastActionTime > 3) {
					const patrolTarget = npc.homePosition.add(
						new Vector3(math.random(-15, 15), 0, math.random(-15, 15)),
					);
					npc.Humanoid.MoveTo(patrolTarget);
					npc.lastActionTime = currentTime;
				}
				break;

			case "combat":
				if (nearestTarget && npc.isCombatant) {
					this.executeCombatBehavior(npc, template, nearestTarget, currentTime);
				} else {
					// No target, return to patrol or idle
					this.SetAIState(npc.npcId, template.isHostile ? "patrol" : "idle");
				}
				break;

			case "pursuit":
				if (nearestTarget) {
					// Chase the target
					npc.Humanoid.MoveTo(nearestTarget.HumanoidRootPart.Position);

					// If close enough, switch to combat
					const distance = npc.HumanoidRootPart.Position.sub(
						nearestTarget.HumanoidRootPart.Position,
					).Magnitude;
					if (distance <= 6) {
						this.SetAIState(npc.npcId, "combat");
					}
				}
				break;

			case "retreat": {
				// Move away from home position
				const retreatTarget = npc.homePosition.add(new Vector3(math.random(-30, 30), 0, math.random(-30, 30)));
				npc.Humanoid.MoveTo(retreatTarget);

				// If health recovers, return to combat
				const healthPercentage = npc.Humanoid.Health / npc.Humanoid.MaxHealth;
				if (healthPercentage > npc.behaviorState.retreatThreshold + 0.1) {
					this.SetAIState(npc.npcId, "idle");
				}
				break;
			}

			case "dead":
				// NPC is dead, cleanup will happen elsewhere
				break;
		}
	}

	/**
	 * Execute combat behavior - use abilities and attacks
	 */
	private executeCombatBehavior(
		npc: NPCEntity,
		template: (typeof NPC_TEMPLATES)[NPCType],
		target: SSEntity,
		currentTime: number,
	): void {
		const distance = npc.HumanoidRootPart.Position.sub(target.HumanoidRootPart.Position).Magnitude;

		// Use abilities if available and cooldown ready
		if (currentTime - npc.behaviorState.lastAbilityTime > 3) {
			for (const abilityKey of template.availableAbilities) {
				try {
					// Try to use ability on target
					if (abilityKey === "Melee" && distance <= 6) {
						// Execute melee attack through combat system
						CombatServiceInstance.ExecuteBasicAttack(npc, target);
						npc.behaviorState.lastAbilityTime = currentTime;
						print(
							`⚔️ ${npc.npcId} attacks ${target.Name !== undefined ? target.Name : "target"} with ${abilityKey}`,
						);
						break;
					} else if (abilityKey === "Soul-Drain" && distance <= 15) {
						// Execute Soul-Drain ability
						// AbilityServiceInstance could be used here for ability casting
						npc.behaviorState.lastAbilityTime = currentTime;
						print(
							`🌟 ${npc.npcId} casts ${abilityKey} on ${target.Name !== undefined ? target.Name : "target"}`,
						);
						break;
					}
				} catch (error) {
					warn(`❌ Error executing ability ${abilityKey}: ${error}`);
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
	private handleNPCDeath(npc: NPCEntity): void {
		npc.aiState = "dead";
		npc.isActive = false;

		// Unregister from combat system
		if (npc.isCombatant) {
			CombatServiceInstance.unregisterCombatant(npc);
		}

		print(`💀 ${npc.npcId} has been defeated!`);

		// Remove after delay
		task.wait(3);
		this.DespawnNPC(npc.npcId);
	}

	/**
	 * Find nearest target for hostile NPCs
	 */
	private findNearestTarget(npc: NPCEntity): SSEntity | undefined {
		let nearestTarget: SSEntity | undefined;
		let nearestDistance = npc.aggroRange;

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
	 * Remove an NPC from the game
	 */
	public DespawnNPC(npcId: string): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc) {
			warn(`❌ NPC not found: ${npcId}`);
			return false;
		}

		// Unregister from combat system
		if (npc.isCombatant) {
			CombatServiceInstance.unregisterCombatant(npc);
		}

		// Clean up model
		if (npc.Parent) {
			npc.Destroy();
		}

		// Remove from tracking
		this.npcs.delete(npcId);

		print(`🗑️ Despawned NPC: ${npcId}`);
		return true;
	}

	/**
	 * Set NPC AI state with enhanced state management
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
	 * Get NPC by ID
	 */
	public GetNPC(npcId: string): NPCEntity | undefined {
		return this.npcs.get(npcId);
	}

	/**
	 * Get all active NPCs
	 */
	public GetAllNPCs(): NPCEntity[] {
		const activeNPCs: NPCEntity[] = [];
		this.npcs.forEach((npc) => {
			if (npc.isActive === true) {
				activeNPCs.push(npc);
			}
		});
		return activeNPCs;
	}

	/**
	 * Get NPCs within range of a position
	 */
	public GetNPCsInRange(position: Vector3, range: number): NPCEntity[] {
		const npcsInRange: NPCEntity[] = [];

		this.npcs.forEach((npc) => {
			if (npc.isActive !== true) return;

			const distance = npc.HumanoidRootPart.Position.sub(position).Magnitude;
			if (distance <= range) {
				npcsInRange.push(npc);
			}
		});

		return npcsInRange;
	}

	/**
	 * Force NPC to attack a specific target (for testing/admin commands)
	 */
	public ForceNPCAttack(npcId: string, target: SSEntity): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc || !npc.isCombatant) {
			return false;
		}

		npc.currentTarget = target;
		this.SetAIState(npcId, "combat");
		print(`🎯 Forced ${npcId} to attack ${target.Name !== undefined ? target.Name : "target"}`);
		return true;
	}
}

// Export singleton instance
export const EnhancedNPCServiceInstance = EnhancedNPCService.getInstance();
