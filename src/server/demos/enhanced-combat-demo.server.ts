/**
 * @file src/server/demos/enhanced-combat-demo.server.ts
 * @module EnhancedCombatDemo
 * @layer Server/Demos
 * @description Demonstration of the enhanced combat flow system with damage containers
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.1.0
 * @lastUpdated 2025-08-01 - Enhanced combat damage flow demonstration
 */

import { Players, Workspace } from "@rbxts/services";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { EnhancedCombatService } from "../server-services/enhanced-combat-service";
import { DamageInfo } from "shared/types/ResourceTypes";
import { AbilityKey, ABILITY_KEYS } from "shared/keys";

/**
 * Enhanced Combat Flow Demonstration
 *
 * This demonstrates the complete flow:
 * 1. AbilityActivateAttempt
 * 2. ActivateAbility
 * 3. ValidateAbility
 * 4. DamageContainerCreated
 * 5. DamageContainerApplied
 * 6. DamageRecordedForRewards
 */
class EnhancedCombatDemo {
	private enhancedCombatService: EnhancedCombatService;

	constructor() {
		this.enhancedCombatService = EnhancedCombatService.getInstance();
		this.setupDemo();
	}

	/**
	 * Set up the enhanced combat flow demonstration
	 */
	private setupDemo(): void {
		print("=== Enhanced Combat Flow Demo ===");
		print("This demo shows the complete damage container flow:");
		print("AbilityActivateAttempt → ValidateAbility → DamageContainerCreated → Applied → RecordedForRewards");
		print("");

		// Wait for players to join
		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				this.demonstrateEnhancedFlow(character as SSEntity);
			});
		});

		// For existing players
		for (const player of Players.GetPlayers()) {
			if (player.Character) {
				this.demonstrateEnhancedFlow(player.Character as SSEntity);
			}
		}
	}

	/**
	 * Demonstrate the enhanced combat flow for a player
	 */
	private demonstrateEnhancedFlow(playerCharacter: SSEntity): void {
		if (!isSSEntity(playerCharacter)) {
			warn("Invalid player character for enhanced combat demo");
			return;
		}

		const player = Players.GetPlayerFromCharacter(playerCharacter);
		if (!player) return;

		print(`\n=== Enhanced Combat Demo for ${player.Name} ===`);

		// Create a dummy target for demonstration
		const dummyTarget = this.createDummyTarget();
		if (!dummyTarget) {
			warn("Failed to create dummy target");
			return;
		}

		// Demonstrate the complete enhanced flow
		this.demonstrateCompleteFlow(playerCharacter, dummyTarget);

		// Clean up after 30 seconds
		task.wait(30);
		if (dummyTarget.Parent) {
			dummyTarget.Destroy();
		}
	}

	/**
	 * Demonstrate the complete enhanced combat flow
	 */
	private demonstrateCompleteFlow(attacker: SSEntity, target: SSEntity): void {
		print("\n--- STEP 1: AbilityActivateAttempt ---");
		print("Player attempts to use an ability...");

		// Step 1: Ability Activate Attempt (simulated)
		const abilityKey = "Melee";
		print(`Attempting to activate ability: ${abilityKey}`);

		print("\n--- STEP 2: ActivateAbility & ValidateAbility ---");
		print("Server validates ability and creates damage container...");

		// Step 2-3: Activate and Validate Ability (integrated in handleAbilityWithContext)
		const result = this.enhancedCombatService.handleAbilityWithContext(
			attacker,
			abilityKey as AbilityKey,
			target,
			this.createDemoContext(),
		);

		if (result) {
			print("\n--- ENHANCED COMBAT FLOW COMPLETED ---");
			print(`✅ Total Damage Dealt: ${result.totalDamageDealt}`);
			print(`✅ Experience Earned: ${result.experienceEarned}`);
			print(`✅ Accuracy: ${math.floor(result.metrics.accuracy * 100)}%`);
			print(`✅ Critical Rate: ${math.floor(result.metrics.criticalRate * 100)}%`);
			print(`✅ Targets Hit: ${result.metrics.targetsHit}`);

			// Show container details
			print("\n--- DAMAGE CONTAINER DETAILS ---");
			print(`Container ID: ${result.containerId}`);
			print(`Success: ${result.success}`);

			// Show target results
			result.targetResults.forEach((targetResult, entity) => {
				print(`Target: ${entity.Name}`);
				print(`  Damage: ${targetResult.damageDealt}`);
				print(`  Critical: ${targetResult.wasCritical ? "Yes" : "No"}`);
				print(`  Blocked: ${targetResult.wasBlocked ? "Yes" : "No"}`);
				print(`  Killed: ${targetResult.targetKilled ? "Yes" : "No"}`);
			});

			print("\n--- REWARD CALCULATION COMPLETE ---");
			print("Enhanced combat flow demonstration successful!");
		} else {
			print("❌ Enhanced combat flow failed");
		}

		// Additional demonstrations
		task.wait(2);
		this.demonstrateBasicAttackFlow(attacker, target);

		task.wait(2);
		this.demonstrateAnalytics(attacker);
	}

	/**
	 * Demonstrate enhanced basic attack flow
	 */
	private demonstrateBasicAttackFlow(attacker: SSEntity, target: SSEntity): void {
		print("\n--- ENHANCED BASIC ATTACK DEMO ---");
		print("Demonstrating enhanced basic attack with damage container...");

		const result = this.enhancedCombatService.handleEnhancedBasicAttack(
			attacker,
			target,
			"demo_weapon",
			this.createDemoContext(),
		);

		if (result) {
			print(`✅ Basic Attack Complete - Damage: ${result.totalDamageDealt}`);
		} else {
			print("❌ Basic attack failed");
		}
	}

	/**
	 * Demonstrate combat analytics features
	 */
	private demonstrateAnalytics(entity: SSEntity): void {
		print("\n--- COMBAT ANALYTICS DEMO ---");

		const player = Players.GetPlayerFromCharacter(entity);
		if (!player) return;

		const playerId = tostring(player.UserId);

		// Get player metrics
		const metrics = this.enhancedCombatService.getPlayerCombatMetrics(playerId);
		if (metrics) {
			print("Player Combat Metrics:");
			print(`  Overall Accuracy: ${math.floor(metrics.accuracy * 100)}%`);
			print(`  Critical Rate: ${math.floor(metrics.criticalRate * 100)}%`);
			print(`  Average Damage: ${math.floor(metrics.averageDamage)}`);
			print(`  DPS: ${math.floor(metrics.dps)}`);
			print(`  Total Targets Hit: ${metrics.targetsHit}`);
		}

		// Get active damage containers
		const activeContainers = this.enhancedCombatService.getActiveDamageContainers(entity);
		print(`Active Damage Containers: ${activeContainers.size()}`);

		// Get combat history
		const history = this.enhancedCombatService.getCombatHistory(playerId, 5);
		print(`Combat History Entries: ${history.size()}`);
	}

	/**
	 * Create a demo context for testing
	 */
	private createDemoContext(): string {
		const context = {
			sessionId: "demo-session",
			comboInfo: {
				comboId: "basic-combo",
				currentStep: 1,
				totalSteps: 3,
				multiplier: 1.2,
			},
			environment: {
				weather: "clear",
				terrain: "grass",
				lighting: "day" as const,
				temperature: 75,
			},
			combatType: "training" as const,
			difficultyMultiplier: 1.0,
		};

		return game.GetService("HttpService").JSONEncode(context);
	}

	/**
	 * Create a dummy target for demonstration
	 */
	private createDummyTarget(): SSEntity | undefined {
		const dummy = new Instance("Model");
		dummy.Name = "CombatDummy";
		dummy.Parent = Workspace;

		// Create humanoid
		const humanoid = new Instance("Humanoid");
		humanoid.MaxHealth = 100;
		humanoid.Health = 100;
		humanoid.Parent = dummy;

		// Create root part
		const rootPart = new Instance("Part");
		rootPart.Name = "HumanoidRootPart";
		rootPart.Size = new Vector3(2, 5, 1);
		rootPart.Material = Enum.Material.Wood;
		rootPart.BrickColor = new BrickColor("Brown");
		rootPart.Anchored = true;
		rootPart.CanCollide = true;
		rootPart.Position = new Vector3(0, 2.5, 0);
		rootPart.Parent = dummy;

		// Create required body parts for SSEntity
		const requiredParts = [
			"Head",
			"UpperTorso",
			"LowerTorso",
			"LeftUpperArm",
			"LeftLowerArm",
			"LeftHand",
			"RightUpperArm",
			"RightLowerArm",
			"RightHand",
			"LeftUpperLeg",
			"LeftLowerLeg",
			"LeftFoot",
			"RightUpperLeg",
			"RightLowerLeg",
			"RightFoot",
		];

		for (const partName of requiredParts) {
			const part = new Instance("MeshPart");
			part.Name = partName;
			part.Size = new Vector3(1, 1, 1);
			part.Material = Enum.Material.Wood;
			part.BrickColor = new BrickColor("Brown");
			part.CanCollide = false;
			part.Parent = dummy;
		}

		dummy.PrimaryPart = rootPart;

		if (isSSEntity(dummy)) {
			print("✅ Created valid combat dummy target");
			return dummy;
		} else {
			warn("❌ Failed to create valid SSEntity dummy");
			dummy.Destroy();
			return undefined;
		}
	}
}

// Initialize the enhanced combat demo
const enhancedCombatDemo = new EnhancedCombatDemo();

print("Enhanced Combat Flow Demo initialized!");
print("Join the game to see the complete damage container flow in action!");
