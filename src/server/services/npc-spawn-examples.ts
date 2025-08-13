/**
 * @file src/server/services/npc-spawn-examples.ts
 * @module NPCSpawnExamples
 * @layer Server/Services
 * @description Example configurations and setup for NPC spawn areas
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-13 - Initial implementation
 */

import { NPCSpawnManagerInstance, type SpawnAreaConfig } from "./npc-spawn-manager";

// =============================================================================
// EXAMPLE SPAWN AREA CONFIGURATIONS
// =============================================================================

/**
 * Example: Goblin Camp - High-activity spawn area with fast respawns
 */
export const createGoblinCamp = (centerPosition: Vector3): SpawnAreaConfig => {
	return {
		id: "goblin_camp_01",
		displayName: "Goblin Camp",
		npcConfigs: [
			{
				npcType: "goblin",
				weight: 70, // 70% chance
				config: {
					mode: "enhanced",
					enableCombat: true,
					isHostile: true,
					aggroRange: 20,
					health: 100,
				},
			},
			{
				npcType: "skeleton",
				weight: 30, // 30% chance
				config: {
					mode: "enhanced",
					enableCombat: true,
					isHostile: true,
					aggroRange: 25,
					health: 150,
				},
			},
		],
		maxNPCs: 8,
		minNPCs: 4,
		respawnTimeSeconds: 30,
		respawnVariance: 10,
		spawnRadius: 25,
		centerPosition,
		requirePlayerPresence: true,
		playerDetectionRange: 100,
		dynamicSpawning: true,
	};
};

/**
 * Example: Peaceful Village Guards - Low-activity defensive NPCs
 */
export const createVillageGuards = (centerPosition: Vector3): SpawnAreaConfig => {
	return {
		id: "village_guards_01",
		displayName: "Village Guards",
		npcConfigs: [
			{
				npcType: "guard",
				weight: 100,
				config: {
					mode: "enhanced",
					enableCombat: true,
					isHostile: false, // Only attack when attacked
					aggroRange: 15,
					health: 250,
					retreatThreshold: 0.1, // Fight to near death
				},
			},
		],
		maxNPCs: 3,
		minNPCs: 2,
		respawnTimeSeconds: 120, // Slower respawn for guards
		respawnVariance: 30,
		spawnRadius: 20,
		centerPosition,
		requirePlayerPresence: false, // Always active
		dynamicSpawning: false,
	};
};

/**
 * Example: Training Dummies - Basic NPCs for new players
 */
export const createTrainingArea = (centerPosition: Vector3): SpawnAreaConfig => {
	return {
		id: "training_area_01",
		displayName: "Training Area",
		npcConfigs: [
			{
				npcType: "blood_toad",
				weight: 100,
				config: {
					mode: "basic", // Simple AI for training
					enableCombat: false,
					isHostile: false,
					health: 50,
					patrolRadius: 10,
				},
			},
		],
		maxNPCs: 5,
		minNPCs: 3,
		respawnTimeSeconds: 15, // Fast respawn for training
		respawnVariance: 5,
		spawnRadius: 15,
		centerPosition,
		requirePlayerPresence: true,
		playerDetectionRange: 50,
		dynamicSpawning: true,
	};
};

/**
 * Example: Elite Boss Area - High-level single boss with minions
 */
export const createBossArea = (centerPosition: Vector3, linkedZone?: string): SpawnAreaConfig => {
	return {
		id: "boss_area_01",
		displayName: "Elite Boss Lair",
		npcConfigs: [
			{
				npcType: "skeleton",
				weight: 10, // Rare boss spawn
				config: {
					mode: "enhanced",
					enableCombat: true,
					enableAdvancedAI: true,
					isHostile: true,
					aggroRange: 35,
					health: 500, // Boss-level health
					level: 15,
					retreatThreshold: 0, // Never retreats
				},
			},
			{
				npcType: "goblin",
				weight: 90, // Common minions
				config: {
					mode: "enhanced",
					enableCombat: true,
					isHostile: true,
					aggroRange: 25,
					health: 120,
					level: 8,
				},
			},
		],
		maxNPCs: 6,
		minNPCs: 2,
		respawnTimeSeconds: 180, // Long respawn for boss encounters
		respawnVariance: 60,
		spawnRadius: 30,
		centerPosition,
		linkedZone: linkedZone as never, // Cast to zone key type
		requirePlayerPresence: true,
		playerDetectionRange: 150,
		dynamicSpawning: true,
	};
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Setup common spawn areas around spawn points
 */
export function setupBasicSpawnAreas(): void {
	// Find spawn locations in workspace
	const spawnLocations: SpawnLocation[] = [];
	for (const child of game.Workspace.GetChildren()) {
		if (child.IsA("SpawnLocation")) {
			spawnLocations.push(child);
		}
	}

	// Create spawn areas around each spawn location
	for (let i = 0; i < spawnLocations.size(); i++) {
		const spawn = spawnLocations[i];
		const position = spawn.Position;

		// Goblin camp 50 studs away
		const goblinCampPos = position.add(new Vector3(50, 0, 0));
		const goblinCamp = createGoblinCamp(goblinCampPos);
		NPCSpawnManagerInstance.createSpawnArea(goblinCamp);

		// Training area 30 studs in different direction
		const trainingPos = position.add(new Vector3(-30, 0, 30));
		const trainingArea = createTrainingArea(trainingPos);
		NPCSpawnManagerInstance.createSpawnArea(trainingArea);

		// Village guards near spawn
		const guardPos = position.add(new Vector3(0, 0, 25));
		const guards = createVillageGuards(guardPos);
		NPCSpawnManagerInstance.createSpawnArea(guards);

		print(`🏗️ Created spawn areas around SpawnLocation ${i + 1}`);
	}
}

/**
 * Setup zone-linked spawn areas
 */
export function setupZoneLinkedSpawnAreas(): void {
	// Example: Boss area linked to a combat zone
	const bossArea = createBossArea(new Vector3(200, 10, 200), "ArenaZone");
	NPCSpawnManagerInstance.createSpawnArea(bossArea);

	print("🏗️ Created zone-linked spawn areas");
}

/**
 * Get spawn area statistics for monitoring
 */
export function logSpawnAreaStats(): void {
	const stats = NPCSpawnManagerInstance.getAllSpawnAreaStats();
	print("📊 NPC Spawn Area Statistics:", stats);
}

// =============================================================================
// INITIALIZATION HELPER
// =============================================================================

/**
 * Initialize all example spawn areas
 * Call this from your main server script after services are initialized
 */
export function initializeExampleSpawnAreas(): void {
	// Initialize the spawn manager
	NPCSpawnManagerInstance.initialize();

	// Setup basic areas
	setupBasicSpawnAreas();

	// Setup zone-linked areas
	setupZoneLinkedSpawnAreas();

	// Log initial stats
	logSpawnAreaStats();

	print("✅ NPC Spawn Areas initialized successfully!");
}
