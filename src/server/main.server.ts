/// <reference types="@rbxts/types" />

import { Players } from "@rbxts/services";
import CmdrBootstrap from "./cmdr/commander-service";
import type { SSEntity } from "shared/types";

// Prefer centralized service instance exports from services index
import {
	AbilityServiceInstance,
	MessageServiceInstance,
	UnifiedNPCServiceInstance,
	ZoneServiceInstance,
	NPCSpawnManagerInstance,
	
} from "./services";
import { CombatServiceInstance } from "./services/combat-service";

// --- Server bootstrap (single entry point) ---
print("Soul Steel Alpha server bootstrapping...");

// Initialize Cmdr
CmdrBootstrap.Initialize();

// Initialize systems that expose Initialize() explicitly
CombatServiceInstance.Initialize();
UnifiedNPCServiceInstance.Initialize();

// Initialize zones and NPC spawn areas deterministically (no arbitrary waits)
ZoneServiceInstance.initializeWorldZones();

// Centralized player lifecycle wiring
Players.PlayerAdded.Connect((player) => {
	print(`Player ${player.Name} joined`);
	player.CharacterAdded.Connect((character) => {
		const entity = character as SSEntity;
		print(`Character ready for ${player.Name} → ${entity.Name}`);
	});

	// Friendly greeting or initialization message
	MessageServiceInstance.SendInfoToPlayer(player, `Welcome ${player.Name}!`);
});

// Backfill existing players at server start
Players.GetPlayers().forEach((player) => {
	MessageServiceInstance.SendInfoToPlayer(player, `Welcome ${player.Name}! Your character is ready.`);
});

print("✅ Soul Steel Alpha server initialized successfully");
