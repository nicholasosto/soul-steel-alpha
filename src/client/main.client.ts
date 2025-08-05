/**
 * @file src/client/main.client.ts
 * @module MainClient
 * @layer Client
 * @description Main client entry point - coordinates all client-side initialization
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Reorganized to use controller architecture
 */

import { PlayerStateInstance } from "./states/player-state";
import { DataRemotes } from "shared/network/data-remotes";

const playerData = DataRemotes.Client.Get("GET_PLAYER_DATA");

playerData.CallServerAsync().then((data) => {
	if (data) {
		print("Player data received:", data);
	} else {
		warn("No player data received.");
	}
});
