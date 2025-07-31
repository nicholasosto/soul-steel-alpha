import { Players, RunService, Workspace } from "@rbxts/services";
import { cloneNPCModel, NPC_MODEL_CATALOG, type NPCModelKey } from "shared/catalogs/npc-model-catalog";

// Phase 1: Super Simple NPC Types (mapped to model catalog)
export type BasicNPCType = "goblin" | "skeleton" | "guard";
export type BasicAIState = "idle" | "patrol" | "combat";

// Phase 1: Minimal NPC Entity (extends SSEntity but simplified)
export interface BasicNPCEntity {
	// Core Roblox components
	Model: Model;
	Humanoid: Humanoid;
	HumanoidRootPart: BasePart;

	// Basic NPC properties
	npcId: string;
	npcType: BasicNPCType;
	aiState: BasicAIState;
	health: number;
	maxHealth: number;
	level: number;
	isActive: boolean;
	spawnTime: number;
	homePosition: Vector3;
	lastActionTime: number;
}

// Phase 1: Simple NPC Configuration
export interface BasicNPCConfig {
	level?: number;
	health?: number;
}

// Phase 1: Basic NPC Templates (enhanced with model catalog integration)
const BASIC_NPC_TEMPLATES = {
	goblin: {
		modelKey: "goblin" as NPCModelKey,
		name: "Goblin Warrior",
		baseHealth: 60,
		baseLevel: 3,
		walkSpeed: 12,
	},
	skeleton: {
		modelKey: "skeleton" as NPCModelKey,
		name: "Skeleton Mage",
		baseHealth: 80,
		baseLevel: 5,
		walkSpeed: 10,
	},
	guard: {
		modelKey: "guard" as NPCModelKey,
		name: "Steam Guard",
		baseHealth: 120,
		baseLevel: 8,
		walkSpeed: 14,
	},
} as const;

/**
 * Phase 1: Super Simple NPC Service
 *
 * Features:
 * - Basic NPC spawning with simple models
 * - Minimal AI states (idle, patrol, combat)
 * - Simple movement and basic interaction
 * - Foundation for future expansion
 */
class NPCService {
	private npcs = new Map<string, BasicNPCEntity>();
	private npcCounter = 0;

	/**
	 * Spawn a basic NPC at the specified position
	 */
	public SpawnNPC(npcType: BasicNPCType, position: Vector3, config?: BasicNPCConfig): BasicNPCEntity | undefined {
		try {
			const template = BASIC_NPC_TEMPLATES[npcType];
			if (!template) {
				warn(`Unknown NPC type: ${npcType}`);
				return undefined;
			}

			// Generate unique ID
			this.npcCounter++;
			const npcId = `npc_${npcType}_${this.npcCounter}`;

			// Clone model from catalog instead of creating basic blocks
			const model = cloneNPCModel(template.modelKey, position, `${template.name}_${npcId}`);
			if (!model) {
				warn(`Failed to clone model for NPC: ${npcId}`);
				return undefined;
			}

			// Parent to workspace
			model.Parent = Workspace;

			// Get required SSEntity components
			const humanoid = model.FindFirstChild("Humanoid") as Humanoid;
			const rootPart = model.FindFirstChild("HumanoidRootPart") as BasePart;

			if (!humanoid || !rootPart) {
				warn(`NPC model missing required components: ${npcId}`);
				model.Destroy();
				return undefined;
			}

			// Configure humanoid
			humanoid.WalkSpeed = template.walkSpeed;
			humanoid.MaxHealth = config?.health ?? template.baseHealth;
			humanoid.Health = humanoid.MaxHealth;

			// Create NPC entity
			const npc: BasicNPCEntity = {
				// SSEntity properties
				Humanoid: humanoid,
				HumanoidRootPart: rootPart,
				Model: model,

				// Basic NPC properties
				npcId: npcId,
				npcType: npcType,
				aiState: "idle",
				health: humanoid.Health,
				maxHealth: humanoid.MaxHealth,
				level: config?.level ?? template.baseLevel,
				isActive: true,
				spawnTime: tick(),
				homePosition: position,
				lastActionTime: tick(),
			};

			// Store NPC
			this.npcs.set(npcId, npc);

			// Start basic AI loop for this NPC
			this.startBasicAI(npc);

			print(`✅ Spawned ${template.name} (${npcId}) at ${position}`);
			return npc;
		} catch (error) {
			warn(`Failed to spawn NPC ${npcType}: ${error}`);
			return undefined;
		}
	}

	/**
	 * Remove an NPC from the game
	 */
	public DespawnNPC(npcId: string): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc) {
			warn(`NPC not found: ${npcId}`);
			return false;
		}

		// Clean up model
		if (npc.Model && npc.Model.Parent) {
			npc.Model.Destroy();
		}

		// Remove from tracking
		this.npcs.delete(npcId);

		print(`🗑️ Despawned NPC: ${npcId}`);
		return true;
	}

	/**
	 * Set NPC AI state
	 */
	public SetAIState(npcId: string, state: BasicAIState): boolean {
		const npc = this.npcs.get(npcId);
		if (!npc) {
			warn(`NPC not found: ${npcId}`);
			return false;
		}

		npc.aiState = state;
		npc.lastActionTime = tick();

		print(`🧠 Set ${npcId} AI state to: ${state}`);
		return true;
	}

	/**
	 * Get NPC by ID
	 */
	public GetNPC(npcId: string): BasicNPCEntity | undefined {
		return this.npcs.get(npcId);
	}

	/**
	 * Get all active NPCs
	 */
	public GetAllNPCs(): BasicNPCEntity[] {
		const activeNPCs: BasicNPCEntity[] = [];
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
	public GetNPCsInRange(position: Vector3, range: number): BasicNPCEntity[] {
		const npcsInRange: BasicNPCEntity[] = [];

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
	 * Start basic AI behavior for an NPC
	 */
	private startBasicAI(npc: BasicNPCEntity): void {
		// Simple AI loop - just basic idle behavior for now
		const connection = RunService.Heartbeat.Connect(() => {
			if (!npc.isActive || !npc.Model.Parent) {
				connection.Disconnect();
				return;
			}

			const currentTime = tick();

			// Basic AI state machine
			switch (npc.aiState) {
				case "idle":
					// Stay put, occasionally look around
					if (currentTime - npc.lastActionTime > 5) {
						// Face a random direction every 5 seconds
						const randomDirection = CFrame.lookAt(
							npc.HumanoidRootPart.Position,
							npc.HumanoidRootPart.Position.add(
								new Vector3(math.random(-10, 10), 0, math.random(-10, 10)),
							),
						);
						npc.HumanoidRootPart.CFrame = randomDirection;
						npc.lastActionTime = currentTime;
					}
					break;

				case "patrol":
					// Simple patrol - walk to a random nearby position
					if (currentTime - npc.lastActionTime > 3) {
						const patrolTarget = npc.homePosition.add(
							new Vector3(math.random(-20, 20), 0, math.random(-20, 20)),
						);
						npc.Humanoid.MoveTo(patrolTarget);
						npc.lastActionTime = currentTime;
					}
					break;

				case "combat":
					// For now, just stand still in combat stance
					// (Combat integration will come in Phase 2)
					break;
			}

			// Check for nearby players (basic detection)
			const nearestPlayer = this.findNearestPlayer(npc.HumanoidRootPart.Position, 15);
			if (nearestPlayer && npc.aiState === "idle") {
				// Switch to patrol mode when player is nearby
				this.SetAIState(npc.npcId, "patrol");
			} else if (!nearestPlayer && npc.aiState === "patrol") {
				// Return to idle when no players nearby
				this.SetAIState(npc.npcId, "idle");
			}
		});
	}

	/**
	 * Find the nearest player to a position
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
}

// Export singleton instance
export const NPCServiceInstance = new NPCService();
