/**
 * @file src/server/spawn-area-setup.server.ts
 * @description Example server script showing how to integrate the NPC Spawn Area System
 *
 * Place this file in your server folder or integrate the code into your main server script.
 */

import { NPCSpawnManagerInstance } from "./services";
import { ZoneServiceInstance } from "./services";
import { initializeExampleSpawnAreas } from "./services/npc-spawn-examples";

// Wait for other services to initialize first
wait(2);

// Initialize zone service first (if not already done)
ZoneServiceInstance.initializeWorldZones();

// Initialize the spawn area system
initializeExampleSpawnAreas();

// Custom spawn area example
const customSpawnArea = {
	id: "custom_area_01",
	displayName: "Custom Monster Area",
	npcConfigs: [
		{
			npcType: "skeleton",
			weight: 60,
			config: {
				mode: "enhanced" as const,
				enableCombat: true,
				enableAdvancedAI: true,
				isHostile: true,
				aggroRange: 30,
				health: 200,
				level: 12,
			},
		},
		{
			npcType: "goblin",
			weight: 40,
			config: {
				mode: "enhanced" as const,
				enableCombat: true,
				isHostile: true,
				aggroRange: 20,
				health: 120,
				level: 8,
			},
		},
	],
	maxNPCs: 6,
	minNPCs: 3,
	respawnTimeSeconds: 45,
	respawnVariance: 15,
	spawnRadius: 30,
	centerPosition: new Vector3(150, 5, 150),
	requirePlayerPresence: true,
	playerDetectionRange: 100,
	dynamicSpawning: true,
};

NPCSpawnManagerInstance.createSpawnArea(customSpawnArea);

// Monitor spawn areas (optional)
spawn(() => {
	// eslint-disable-next-line roblox-ts/no-array-pairs, roblox-ts/lua-truthiness
	while (wait(60)[0]) {
		// Check every minute
		const stats = NPCSpawnManagerInstance.getAllSpawnAreaStats();
		print("🧊 Spawn Area Status:", stats);
	}
});

print("✅ NPC Spawn Area System fully initialized!");
