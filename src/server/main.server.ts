/// <reference types="@rbxts/types" />

import { Players } from "@rbxts/services";
import { AbilityKey } from "shared";
import type { SSEntity } from "shared/types";

// Prefer centralized service instance exports from services index
import {
	AbilityServiceInstance,
	MessageServiceInstance,
	UnifiedNPCServiceInstance,
	ZoneServiceInstance,
	NPCSpawnManagerInstance,
} from "./services";
import { initializeExampleSpawnAreas } from "./services/npc-spawn-examples";
import { CombatServiceInstance } from "./services/combat-service";

// --- Server bootstrap (single entry point) ---
print("Soul Steel Alpha server bootstrapping...");

// Initialize systems that expose Initialize() explicitly
CombatServiceInstance.Initialize();
UnifiedNPCServiceInstance.Initialize();

// Initialize zones and NPC spawn areas deterministically (no arbitrary waits)
ZoneServiceInstance.initializeWorldZones();
initializeExampleSpawnAreas();

// Custom spawn area example (previously in spawn-area-setup.server.ts)
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

// Optional: monitor spawn areas periodically
spawn(() => {
	// eslint-disable-next-line roblox-ts/no-array-pairs, roblox-ts/lua-truthiness
	while (wait(60)[0]) {
		const stats = NPCSpawnManagerInstance.getAllSpawnAreaStats();
		print("🧊 Spawn Area Status:", stats);
	}
});

// Centralized player lifecycle wiring
const defaultAbilityKeys: AbilityKey[] = ["Melee", "Ice-Rain"];

Players.PlayerAdded.Connect((player) => {
	print(`Player ${player.Name} joined`);
	player.CharacterAdded.Connect((character) => {
		const entity = character as SSEntity;
		print(`Registering abilities for ${player.Name} → ${entity.Name}`);
		AbilityServiceInstance.RegisterModel(entity, defaultAbilityKeys);
	});

	// Friendly greeting or initialization message
	MessageServiceInstance.SendInfoToPlayer(player, `Welcome ${player.Name}!`);
});

// Backfill existing players at server start
Players.GetPlayers().forEach((player) => {
	MessageServiceInstance.SendInfoToPlayer(player, `Welcome ${player.Name}! Your character is ready.`);
});

print("✅ Soul Steel Alpha server initialized successfully");
