/**
 * @file src/client/main.client.ts
 * @module MainClient
 * @layer Client
 * @description Main client entry point - coordinates all client-side initialization
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-07 - Updated to use consolidated controller architecture
 */

import { ClientController } from "./controllers";
import { PlayerStateInstance } from "./states/player-state";
import { DataRemotes } from "shared/network/data-remotes";

// Initialize the main client controller (this initializes all sub-controllers)
const clientController = ClientController.initialize();

const playerData = DataRemotes.Client.Get("GET_PLAYER_DATA");

playerData.CallServerAsync().then((data) => {
	if (data) {
		print("Player data received:", data);
	} else {
		warn("No player data received.");
	}
});

print("Main client initialized with consolidated controller architecture");
