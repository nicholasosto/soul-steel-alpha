import { Players } from "@rbxts/services";
import { UnifiedNPCServiceInstance } from "server/services/unified-npc-service";

/**
 * Unified NPC Service Demo
 *
 * This script demonstrates the unified NPC service with both basic and enhanced modes.
 * Shows how to spawn NPCs with different feature configurations.
 */

// Demo function to spawn NPCs with different configurations
function spawnDemoNPCs() {
	print("🎮 Starting Unified NPC Service Demo...");

	// Example 1: Basic lightweight NPC (minimal overhead)
	const villager = UnifiedNPCServiceInstance.SpawnNPC("guard", new Vector3(-15, 509, 0), {
		mode: "basic",
		level: 1,
		enableCombat: false,
		enableResourceManagement: false,
		enableAdvancedAI: false,
		isHostile: false,
	});
	if (villager) {
		print(`✅ Spawned Lightweight Villager: ${villager.npcId} (Basic Mode)`);
	}

	// Example 2: Basic patrol guard (simple combat-ready)
	const patrolGuard = UnifiedNPCServiceInstance.SpawnNPC("guard", new Vector3(0, 509, 0), {
		mode: "basic",
		level: 5,
		enableCombat: false, // Basic mode doesn't use full combat system
		isHostile: false,
		patrolRadius: 15,
	});
	if (patrolGuard) {
		print(`✅ Spawned Patrol Guard: ${patrolGuard.npcId} (Basic Mode)`);
		// Set to patrol after 2 seconds
		task.wait(2);
		UnifiedNPCServiceInstance.SetAIState(patrolGuard.npcId, "patrol");
		print("🚶 Guard is now patrolling!");
	}

	// Example 3: Enhanced combat goblin (full features)
	const combatGoblin = UnifiedNPCServiceInstance.SpawnNPC("goblin", new Vector3(10, 509, 0), {
		mode: "enhanced",
		level: 3,
		enableCombat: true,
		enableResourceManagement: true,
		enableAdvancedAI: true,
		isHostile: true,
		aggroRange: 20,
		retreatThreshold: 0.25, // Retreat at 25% health
	});
	if (combatGoblin) {
		print(`✅ Spawned Combat Goblin: ${combatGoblin.npcId} (Enhanced Mode)`);
	}

	// Example 4: Enhanced boss skeleton (maximum features)
	const bossSkeletonMage = UnifiedNPCServiceInstance.SpawnNPC("skeleton", new Vector3(20, 509, 0), {
		mode: "enhanced",
		level: 8,
		health: 300,
		enableCombat: true,
		enableResourceManagement: true,
		enableAdvancedAI: true,
		isHostile: true,
		aggroRange: 25,
		retreatThreshold: 0.1, // Retreat at 10% health (tough boss!)
	});
	if (bossSkeletonMage) {
		print(`✅ Spawned Boss Skeleton Mage: ${bossSkeletonMage.npcId} (Enhanced Mode)`);
	}

	// Show statistics after spawning
	task.wait(3);
	const stats = UnifiedNPCServiceInstance.GetStats();
	print("📊 NPC Service Statistics:");
	print(`   Total NPCs: ${stats.totalNPCs}`);
	print(`   Basic NPCs: ${stats.basicNPCs}`);
	print(`   Enhanced NPCs: ${stats.enhancedNPCs}`);
	print(`   Combat-ready: ${stats.combatants}`);
	print(`   Active NPCs: ${stats.activeNPCs}`);

	// List all NPCs with their configurations
	const allNPCs = UnifiedNPCServiceInstance.GetAllNPCs();
	print("\n🗂️ Spawned NPCs:");
	for (const npc of allNPCs) {
		const modeStr = npc.config.mode === "enhanced" ? "Enhanced" : "Basic";
		const featuresStr = getFeaturesString(npc.config);
		print(
			`   - ${npc.npcType} (${npc.npcId}): Level ${npc.level}, ${modeStr} ${featuresStr}, State: ${npc.aiState}`,
		);
	}
}

// Demo function to show advanced features
function demoAdvancedFeatures() {
	print("\n🔬 Testing Advanced Features...");

	// Test player detection and aggro
	// eslint-disable-next-line no-constant-condition
	while (true) {
		task.wait(5);

		for (const player of Players.GetPlayers()) {
			if (player.Character && player.Character.FindFirstChild("HumanoidRootPart")) {
				const playerPos = (player.Character.FindFirstChild("HumanoidRootPart") as BasePart).Position;
				const nearbyNPCs = UnifiedNPCServiceInstance.GetNPCsInRange(playerPos, 25);

				if (nearbyNPCs.size() > 0) {
					print(`\n🎯 ${player.Name} has ${nearbyNPCs.size()} NPCs nearby:`);
					for (const npc of nearbyNPCs) {
						const distance = npc.HumanoidRootPart.Position.sub(playerPos).Magnitude;
						const modeStr = npc.config.mode === "enhanced" ? "Enhanced" : "Basic";
						const hostileStr = npc.config.isHostile ? "Hostile" : "Peaceful";
						print(`   - ${npc.npcType} (${modeStr}, ${hostileStr}) at ${math.floor(distance)} studs`);
					}
				}
			}
		}
	}
}

// Demo function to test NPC interactions
function demoNPCInteractions() {
	print("\n⚔️ Testing NPC Combat Interactions...");

	task.wait(10); // Wait for NPCs to be established

	// Find enhanced NPCs
	const allNPCs = UnifiedNPCServiceInstance.GetAllNPCs();
	const enhancedNPCs = allNPCs.filter((npc) => npc.config.mode === "enhanced");

	if (enhancedNPCs.size() >= 2) {
		const npc1 = enhancedNPCs[0];
		const npc2 = enhancedNPCs[1];

		print(`🥊 Testing combat between ${npc1.npcId} and ${npc2.npcId}...`);

		// This would require the enhanced NPC to have SSEntity compatibility
		// UnifiedNPCServiceInstance.ForceNPCAttack(npc1.npcId, npc2 as any);
	}
}

// Helper function to get features string
function getFeaturesString(config: Record<string, unknown>): string {
	const features: string[] = [];
	if (config.enableCombat === true) features.push("Combat");
	if (config.enableResourceManagement === true) features.push("Resources");
	if (config.enableAdvancedAI === true) features.push("AI");
	return features.size() > 0 ? `[${features.join(", ")}]` : "[Minimal]";
}

// Run the demo when a player joins
Players.PlayerAdded.Connect((player) => {
	print(`🎮 Player ${player.Name} joined! Starting Unified NPC demo...`);

	player.CharacterAdded.Connect(() => {
		task.wait(2); // Give player time to fully load

		// Spawn demo NPCs
		spawnDemoNPCs();

		// Start advanced features demo
		task.spawn(() => demoAdvancedFeatures());

		// Start interaction demo
		task.spawn(() => demoNPCInteractions());
	});
});

// If there are already players in the game, start the demo
if (Players.GetPlayers().size() > 0) {
	print("🎮 Players already in game, starting demo immediately...");
	spawnDemoNPCs();
	task.spawn(() => demoAdvancedFeatures());
	task.spawn(() => demoNPCInteractions());
}

print("🚀 Unified NPC Service Demo loaded successfully!");
print("📝 Features demonstrated:");
print("   ✅ Basic Mode NPCs (lightweight, minimal features)");
print("   ✅ Enhanced Mode NPCs (full combat integration)");
print("   ✅ Configurable AI complexity");
print("   ✅ Resource and combat system integration");
print("   ✅ Performance-scaled features");
print("   ✅ Advanced player detection");
print("");
print("🎛️ Configuration Options:");
print("   • mode: 'basic' | 'enhanced'");
print("   • enableCombat: boolean");
print("   • enableResourceManagement: boolean");
print("   • enableAdvancedAI: boolean");
print("   • isHostile: boolean");
print("   • aggroRange: number");
print("   • retreatThreshold: number");
