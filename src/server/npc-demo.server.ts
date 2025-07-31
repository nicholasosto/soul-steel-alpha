import { Players } from "@rbxts/services";
import { NPCServiceInstance } from "server/services/npc-service";

/**
 * Phase 1 NPC Service Demo
 *
 * This script demonstrates the basic functionality of the NPC service.
 * Run this from the server to spawn some test NPCs.
 */

// Demo function to spawn some basic NPCs
function spawnDemoNPCs() {
	print("🎮 Starting Phase 1 NPC Demo...");

	// Spawn a goblin at position (0, 5, 0)
	const goblin = NPCServiceInstance.SpawnNPC("goblin", new Vector3(0, 5, 0), { level: 3 });
	if (goblin) {
		print(`✅ Spawned Goblin: ${goblin.npcId}`);

		// Set it to patrol mode after 3 seconds
		task.wait(3);
		NPCServiceInstance.SetAIState(goblin.npcId, "patrol");
		print("🚶 Goblin is now patrolling!");
	}

	// Spawn a skeleton at position (10, 5, 0)
	const skeleton = NPCServiceInstance.SpawnNPC("skeleton", new Vector3(10, 5, 0), { level: 5 });
	if (skeleton) {
		print(`✅ Spawned Skeleton: ${skeleton.npcId}`);
	}

	// Spawn a guard at position (-10, 5, 0)
	const guard = NPCServiceInstance.SpawnNPC("guard", new Vector3(-10, 5, 0), { level: 8 });
	if (guard) {
		print(`✅ Spawned Guard: ${guard.npcId}`);

		// Guards start in patrol mode
		NPCServiceInstance.SetAIState(guard.npcId, "patrol");
	}

	// Print status after 5 seconds
	task.wait(5);
	const allNPCs = NPCServiceInstance.GetAllNPCs();
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
				const nearbyNPCs = NPCServiceInstance.GetNPCsInRange(playerPos, 20);

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
