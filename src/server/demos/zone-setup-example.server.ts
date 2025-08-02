/**
 * @file src/server/zone-setup-example.server.ts
 * @module ZoneSetupExample
 * @layer Server/Examples
 * @description Example of how to set up and use the zone system
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Workspace } from "@rbxts/services";
import { ZoneServiceInstance } from "server/server-services";

const ZonesFolder = Workspace.FindFirstChild("ZoneContainers") as Folder;
assert(ZonesFolder, "ZoneContainers folder not found in Workspace");
/**
 * Example of setting up zones in your game
 * Call this during server initialization
 */
function setupGameZones(): void {
	// Method 1: Create zones from existing workspace containers
	// Assumes you have a folder structure like:
	// Workspace
	//   └── ZoneContainers
	//       ├── PlayerSpawn (Model/Folder with parts)
	//       ├── SafeZone (Model/Folder with parts)
	//       └── ArenaZone (Model/Folder with parts)

	ZoneServiceInstance.initializeWorldZones();

	// Method 2: Create zones from regions (programmatically)
	ZoneServiceInstance.createZoneFromRegion("BuffZone", new CFrame(100, 500, 100), new Vector3(200, 15, 200));

	// Method 3: Create zone from specific container
	const customContainer = Workspace.FindFirstChild("PlayerSpawn") as Model;
	if (customContainer) {
		ZoneServiceInstance.createZone("PlayerSpawn", customContainer);
	}

	// Example: Temporarily disable a zone
	//ZoneServiceInstance.setZoneActive("PlayerSpawn", false);

	// Re-enable it later
	wait(30);
	ZoneServiceInstance.setZoneActive("PlayerSpawn", true);
}

/**
 * Example of monitoring zone activity
 */
function monitorZones(): void {
	// Check zone statistics
	const stats = ZoneServiceInstance.getZoneStats();
	print("Zone Statistics:", stats);

	// Monitor specific zone
	const arenaPlayers = ZoneServiceInstance.getPlayersInZone("ArenaZone");
	print(`Players in arena: ${arenaPlayers.size()}`);

	// Check if specific player is in a zone
	const players = game.GetService("Players").GetPlayers();
	for (const player of players) {
		const playerZones = ZoneServiceInstance.getPlayerZones(player);
		if (playerZones.size() > 0) {
			print(`${player.Name} is in zones: ${playerZones.join(", ")}`);
		}
	}
}

// Example setup - remove this in production
setupGameZones();

// Monitor zones every 30 seconds - adjust as needed
// eslint-disable-next-line no-constant-condition
while (true) {
	wait(30);
	monitorZones();
}
