import { Players } from "@rbxts/services";
import { UnifiedNPCServiceInstance } from "server/services/unified-npc-service";

/**
 * Updated NPC Service Demo (using UnifiedNPCService)
 *
 * This script demonstrates the unified NPC service functionality.
 * Run this from the server to spawn some test NPCs.
 */

// Demo function to spawn some NPCs using unified service
function spawnDemoNPCs() {
	print("🎮 Starting Unified NPC Demo...");

	// Spawn a basic goblin at position (0, 5, 0)
	const goblin = UnifiedNPCServiceInstance.SpawnNPC("goblin", new Vector3(0, 5, 0), {
		mode: "basic",
		level: 3,
	});
	if (goblin) {
		print(`✅ Spawned Basic Goblin: ${goblin.npcId}`);

		// Set it to patrol mode after 3 seconds
		task.wait(3);
		UnifiedNPCServiceInstance.SetAIState(goblin.npcId, "patrol");
		print("🚶 Goblin is now patrolling!");
	}

	// Spawn an enhanced skeleton at position (10, 5, 0)
	const skeleton = UnifiedNPCServiceInstance.SpawnNPC("skeleton", new Vector3(10, 5, 0), {
		mode: "enhanced",
		level: 5,
		enableCombat: true,
	});
	if (skeleton) {
		print(`✅ Spawned Enhanced Skeleton: ${skeleton.npcId}`);
	}

	// Spawn a guard at position (-10, 5, 0)
	const guard = UnifiedNPCServiceInstance.SpawnNPC("guard", new Vector3(-10, 5, 0), {
		mode: "basic",
		level: 8,
	});
	if (guard !== undefined) {
		print(`✅ Spawned Guard: ${guard.npcId}`);

		// Guards start in patrol mode
		UnifiedNPCServiceInstance.SetAIState(guard.npcId, "patrol");
	}

	// Print status after 5 seconds
	task.wait(5);
	const allNPCs = UnifiedNPCServiceInstance.GetAllNPCs();
	print(`📊 Total active NPCs: ${allNPCs.size()}`);

	for (const npc of allNPCs) {
		print(`   - ${npc.npcType} (${npc.npcId}): Level ${npc.level}, State: ${npc.aiState}`);
	}
}

// Demo function to show player detection
function demoPlayerDetection() {
	print("👀 Testing player detection...");

	// Check for NPCs near players every 5 seconds
	// eslint-disable-next-line no-constant-condition
	while (true) {
		task.wait(5);

		for (const player of Players.GetPlayers()) {
			if (player.Character && player.Character.FindFirstChild("HumanoidRootPart")) {
				const playerPos = (player.Character.FindFirstChild("HumanoidRootPart") as BasePart).Position;
				const nearbyNPCs = UnifiedNPCServiceInstance.GetNPCsInRange(playerPos, 20);

				if (nearbyNPCs.size() > 0) {
					print(`🎯 ${player.Name} has ${nearbyNPCs.size()} NPCs nearby:`);
					for (const npc of nearbyNPCs) {
						const distance = npc.HumanoidRootPart.Position.sub(playerPos).Magnitude;
						print(`   - ${npc.npcType} at ${math.floor(distance)} studs`);
					}
				}
			}
		}
	}
}

// Run the demo when a player joins
Players.PlayerAdded.Connect((player) => {
	print(`🎮 Player ${player.Name} joined! Starting NPC demo...`);

	// Wait for player to load
	player.CharacterAdded.Connect(() => {
		task.wait(2); // Give player time to fully load

		// Spawn demo NPCs
		spawnDemoNPCs();

		// Start player detection demo
		task.spawn(() => demoPlayerDetection());
	});
});

// If there are already players in the game, start the demo
if (Players.GetPlayers().size() > 0) {
	print("🎮 Players already in game, starting demo immediately...");
	spawnDemoNPCs();
	task.spawn(() => demoPlayerDetection());
}

print("🚀 Phase 1 NPC Service Demo loaded successfully!");
print("📝 Features demonstrated:");
print("   ✅ Basic NPC spawning (goblin, skeleton, guard)");
print("   ✅ AI state management (idle, patrol, combat)");
print("   ✅ Player detection and proximity awareness");
print("   ✅ Simple patrolling behavior");
print("   ✅ NPC management (spawn, despawn, query)");
print("");
print("🔮 Coming in Phase 2:");
print("   🎯 Combat integration");
print("   ⚔️ Weapon and ability usage");
print("   🤖 Smarter AI behaviors");
print("   👥 Group coordination");
