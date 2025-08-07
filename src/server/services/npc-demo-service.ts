/**
 * @file src/server/services/npc-demo-service.ts
 * @module NPCDemoService
 * @layer Server/Services
 * @description Demo service to spawn NPCs around players and test combat/health systems
 *
 * This service demonstrates:
 * - Spawning NPCs around player characters
 * - Timed health damage testing
 * - Integration with ResourceService and CombatService
 *
 * @author Soul Steel Alpha Development Team
 * @since 2.0.0
 * @created 2025-08-06 - NPC spawning and health testing demo
 */

import { Players, Workspace, RunService, ReplicatedStorage } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { MessageServiceInstance } from "./message-service";
import { MessageType, MessageMetaRecord } from "shared/types";
import { cloneNPCModel, getNPCModel } from "shared";

/**
 * NPC Demo data structure
 */
interface DemoNPC {
	model: SSEntity;
	playerId: number;
	spawnTime: number;
	damageScheduled: boolean;
	healScheduled: boolean;
}

/**
 * Demo service for spawning NPCs and testing health systems
 */
class NPCDemoService {
	private static instance: NPCDemoService | undefined;
	private demoNPCs = new Map<string, DemoNPC>();
	private playerNPCs = new Map<number, string[]>(); // Track NPCs per player

	private constructor() {}

	/**
	 * Get the singleton instance
	 */
	public static getInstance(): NPCDemoService {
		if (!NPCDemoService.instance) {
			NPCDemoService.instance = new NPCDemoService();
		}
		return NPCDemoService.instance;
	}

	/**
	 * Initialize the demo service
	 */
	public Initialize(): void {
		this.setupPlayerConnections();
		print("NPCDemoService: Initialized successfully");
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
			id: `npc_demo_${tick()}`,
			timestamp: tick(),
			title,
			content,
			severity: meta.severity,
			textColor: meta.textColor,
		};
	}

	/**
	 * Set up player event connections
	 */
	private setupPlayerConnections(): void {
		// Handle player character spawning
		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				// Wait a moment for character to fully load
				task.wait(2);
				this.spawnNPCsAroundPlayer(player, character);
			});
		});

		// Cleanup when player leaves
		Players.PlayerRemoving.Connect((player) => {
			this.cleanupPlayerNPCs(player);
		});
	}

	/**
	 * Spawn 3 NPCs around the player character
	 */
	private spawnNPCsAroundPlayer(player: Player, character: Model): void {
		const bloodToad = cloneNPCModel(
			"blood_toad",
			character.GetPivot().Position.add(new Vector3(5, 0, 0)),
			"TestNPC_BloodToad",
		);
		if (!isSSEntity(character)) {
			warn(`NPCDemoService: Invalid character for ${player.Name}`);
			return;
		}

		const humanoidRootPart = character.HumanoidRootPart;
		const playerPosition = humanoidRootPart.Position;

		// Initialize player NPC tracking
		this.playerNPCs.set(player.UserId, []);
		const playerNPCList = this.playerNPCs.get(player.UserId)!;

		// Spawn 3 NPCs in a circle around the player
		const spawnRadius = 10;
		const npcPositions = [
			playerPosition.add(new Vector3(spawnRadius, 0, 0)),
			playerPosition.add(new Vector3(-spawnRadius / 2, 0, spawnRadius * 0.866)), // 120 degrees
			playerPosition.add(new Vector3(-spawnRadius / 2, 0, -spawnRadius * 0.866)), // 240 degrees
		];

		const npcNames = ["TestNPC_1", "TestNPC_2", "TestNPC_3"];

		for (let i = 0; i < 3; i++) {
			const npcId = `${player.UserId}_npc_${i + 1}`;
			const npc = this.createTestNPC(npcNames[i], npcPositions[i]);

			if (npc) {
				// Store NPC data
				const demoNPC: DemoNPC = {
					model: npc,
					playerId: player.UserId,
					spawnTime: tick(),
					damageScheduled: false,
					healScheduled: false,
				};

				this.demoNPCs.set(npcId, demoNPC);
				playerNPCList.push(npcId);

				// Schedule damage and healing
				this.scheduleDamageAndHeal(npcId, player);
			}
		}

		// Notify player
		MessageServiceInstance.SendMessageToPlayer(
			player,
			this.createMessage("3 Test NPCs spawned! Watch their health in 10 seconds...", "info"),
		);

		print(`NPCDemoService: Spawned 3 NPCs around ${player.Name}`);
	}

	/**
	 * Create a simple test NPC
	 */
	private createTestNPC(name: string, position: Vector3): SSEntity | undefined {
		try {
			// Create a basic R15 character as test NPC
			const npc = new Instance("Model");
			npc.Name = name;
			npc.Parent = Workspace;

			// Create basic R15 parts
			const humanoid = new Instance("Humanoid");
			humanoid.Parent = npc;
			humanoid.Health = 100;
			humanoid.MaxHealth = 100;

			const humanoidRootPart = new Instance("Part");
			humanoidRootPart.Name = "HumanoidRootPart";
			humanoidRootPart.Size = new Vector3(2, 2, 1);
			humanoidRootPart.Position = position;
			humanoidRootPart.Anchored = false;
			humanoidRootPart.CanCollide = true;
			humanoidRootPart.BrickColor = BrickColor.random();
			humanoidRootPart.Material = Enum.Material.Neon;
			humanoidRootPart.Parent = npc;

			// Set primary part
			npc.PrimaryPart = humanoidRootPart;

			// Create all required R15 body parts as MeshParts
			const requiredParts = [
				{ name: "Head", size: new Vector3(2, 1, 1) },
				{ name: "UpperTorso", size: new Vector3(2, 2, 1) },
				{ name: "LowerTorso", size: new Vector3(2, 1, 1) },
				{ name: "LeftUpperArm", size: new Vector3(1, 2, 1) },
				{ name: "LeftLowerArm", size: new Vector3(1, 2, 1) },
				{ name: "LeftHand", size: new Vector3(1, 0.4, 1) },
				{ name: "RightUpperArm", size: new Vector3(1, 2, 1) },
				{ name: "RightLowerArm", size: new Vector3(1, 2, 1) },
				{ name: "RightHand", size: new Vector3(1, 0.4, 1) },
				{ name: "LeftUpperLeg", size: new Vector3(1, 2, 1) },
				{ name: "LeftLowerLeg", size: new Vector3(1, 2, 1) },
				{ name: "LeftFoot", size: new Vector3(1, 0.4, 2) },
				{ name: "RightUpperLeg", size: new Vector3(1, 2, 1) },
				{ name: "RightLowerLeg", size: new Vector3(1, 2, 1) },
				{ name: "RightFoot", size: new Vector3(1, 0.4, 2) },
			];

			// Create each required part
			const parts: MeshPart[] = [];
			for (const partInfo of requiredParts) {
				const part = new Instance("MeshPart");
				part.Name = partInfo.name;
				part.Size = partInfo.size;
				part.Position = position;
				part.Anchored = false;
				part.CanCollide = false;
				part.BrickColor = humanoidRootPart.BrickColor;
				part.Material = Enum.Material.Plastic;
				part.Parent = npc;
				parts.push(part);

				// Create weld to keep parts together
				const weld = new Instance("WeldConstraint");
				weld.Part0 = humanoidRootPart;
				weld.Part1 = part;
				weld.Parent = humanoidRootPart;
			}

			// Add name tag
			const billboardGui = new Instance("BillboardGui");
			billboardGui.Size = new UDim2(0, 100, 0, 50);
			billboardGui.Adornee = humanoidRootPart;
			billboardGui.Parent = humanoidRootPart;

			const nameLabel = new Instance("TextLabel");
			nameLabel.Size = new UDim2(1, 0, 1, 0);
			nameLabel.BackgroundTransparency = 1;
			nameLabel.Text = name;
			nameLabel.TextColor3 = new Color3(1, 1, 1);
			nameLabel.TextScaled = true;
			nameLabel.Font = Enum.Font.SourceSansBold;
			nameLabel.Parent = billboardGui;

			if (isSSEntity(npc)) {
				return npc;
			} else {
				warn(`NPCDemoService: Created model is not a valid SSEntity: ${name}`);
				npc.Destroy();
				return undefined;
			}
		} catch (error) {
			warn(`NPCDemoService: Failed to create NPC ${name}: ${error}`);
			return undefined;
		}
	}

	/**
	 * Schedule damage and healing for an NPC
	 */
	private scheduleDamageAndHeal(npcId: string, player: Player): void {
		const demoNPC = this.demoNPCs.get(npcId);
		if (!demoNPC) return;

		// Schedule 50% damage after 10 seconds
		task.spawn(() => {
			task.wait(10);

			if (this.demoNPCs.has(npcId) && !demoNPC.damageScheduled) {
				demoNPC.damageScheduled = true;
				this.applyDamageToNPC(npcId, 50, player);

				// Schedule 100% health after 5 more seconds
				task.wait(5);

				if (this.demoNPCs.has(npcId) && !demoNPC.healScheduled) {
					demoNPC.healScheduled = true;
					this.healNPCToFull(npcId, player);
				}
			}
		});
	}

	/**
	 * Apply damage to an NPC
	 */
	private applyDamageToNPC(npcId: string, damage: number, player: Player): void {
		const demoNPC = this.demoNPCs.get(npcId);
		if (!demoNPC) return;

		const humanoid = demoNPC.model.Humanoid;
		const currentHealth = humanoid.Health;
		const newHealth = math.max(0, currentHealth - damage);

		humanoid.Health = newHealth;

		// Update name tag to show health
		this.updateNPCHealthDisplay(demoNPC.model, newHealth, humanoid.MaxHealth);

		print(
			`NPCDemoService: Applied ${damage} damage to ${demoNPC.model.Name} (${newHealth}/${humanoid.MaxHealth} HP)`,
		);

		MessageServiceInstance.SendMessageToPlayer(
			player,
			this.createMessage(
				`${demoNPC.model.Name} took ${damage} damage! (${newHealth}/${humanoid.MaxHealth} HP)`,
				"warning",
			),
		);
	}

	/**
	 * Heal NPC to full health
	 */
	private healNPCToFull(npcId: string, player: Player): void {
		const demoNPC = this.demoNPCs.get(npcId);
		if (!demoNPC) return;

		const humanoid = demoNPC.model.Humanoid;
		const oldHealth = humanoid.Health;
		const maxHealth = humanoid.MaxHealth;

		humanoid.Health = maxHealth;

		// Update name tag to show full health
		this.updateNPCHealthDisplay(demoNPC.model, maxHealth, maxHealth);

		print(`NPCDemoService: Healed ${demoNPC.model.Name} to full health (${maxHealth}/${maxHealth} HP)`);

		MessageServiceInstance.SendMessageToPlayer(
			player,
			this.createMessage(
				`${demoNPC.model.Name} restored to full health! (${maxHealth}/${maxHealth} HP)`,
				"success",
			),
		);
	}

	/**
	 * Update NPC health display on name tag
	 */
	private updateNPCHealthDisplay(npc: SSEntity, currentHealth: number, maxHealth: number): void {
		const humanoidRootPart = npc.HumanoidRootPart;
		const billboardGui = humanoidRootPart.FindFirstChild("BillboardGui") as BillboardGui;

		if (billboardGui) {
			const nameLabel = billboardGui.FindFirstChild("TextLabel") as TextLabel;
			if (nameLabel) {
				const healthPercent = (currentHealth / maxHealth) * 100;
				nameLabel.Text = `${npc.Name}\n${math.floor(currentHealth)}/${maxHealth} HP (${math.floor(healthPercent)}%)`;

				// Color based on health
				if (healthPercent > 75) {
					nameLabel.TextColor3 = new Color3(0, 1, 0); // Green
				} else if (healthPercent > 25) {
					nameLabel.TextColor3 = new Color3(1, 1, 0); // Yellow
				} else {
					nameLabel.TextColor3 = new Color3(1, 0, 0); // Red
				}
			}
		}
	}

	/**
	 * Clean up NPCs for a departing player
	 */
	private cleanupPlayerNPCs(player: Player): void {
		const playerNPCList = this.playerNPCs.get(player.UserId);
		if (!playerNPCList) return;

		for (const npcId of playerNPCList) {
			const demoNPC = this.demoNPCs.get(npcId);
			if (demoNPC) {
				demoNPC.model.Destroy();
				this.demoNPCs.delete(npcId);
			}
		}

		this.playerNPCs.delete(player.UserId);
		print(`NPCDemoService: Cleaned up NPCs for ${player.Name}`);
	}

	/**
	 * Get all active demo NPCs (for debugging)
	 */
	public GetActiveDemoNPCs(): DemoNPC[] {
		const npcs: DemoNPC[] = [];
		for (const [, npc] of this.demoNPCs) {
			npcs.push(npc);
		}
		return npcs;
	}

	/**
	 * Manually trigger damage test for a player (for debugging)
	 */
	/**
	 * Manually trigger NPC spawning for a player (for testing)
	 */
	public SpawnNPCsForPlayer(player: Player): void {
		if (!player.Character) {
			MessageServiceInstance.SendMessageToPlayer(
				player,
				this.createMessage("Character not found - try again in a moment", "warning"),
			);
			return;
		}

		this.spawnNPCsAroundPlayer(player, player.Character);
	}

	public TriggerDamageTest(player: Player): void {
		const playerNPCList = this.playerNPCs.get(player.UserId);
		if (!playerNPCList) {
			print(`NPCDemoService: No NPCs found for ${player.Name}`);
			return;
		}

		for (const npcId of playerNPCList) {
			this.applyDamageToNPC(npcId, 25, player);
		}
	}
}

// Export singleton instance
export const NPCDemoServiceInstance = NPCDemoService.getInstance();
export { NPCDemoService };
