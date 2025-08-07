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

import { Observer } from "@rbxts/fusion";
import { ClientController } from "./controllers";
import { PlayerStateInstance } from "./states/player-state";
import { DataRemotes } from "shared/network/data-remotes";
import { Players } from "@rbxts/services";
import { PlayerHUD } from "./screens";

// Initialize the main client controller (this initializes all sub-controllers)
const clientController = ClientController.initialize();
const playerState = PlayerStateInstance;

Observer(playerState.Resources.Health.current).onChange(() => {
	print(`Player health updated: ${playerState.Resources.Health.current}`);
	const humanoid = Players.LocalPlayer.Character?.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		print(`Humanoid health updated: ${humanoid.Health}`);
	} else {
		warn("Humanoid not found in character.");
	}
});

const playerData = DataRemotes.Client.Get("GET_PLAYER_DATA");

playerData.CallServerAsync().then((data) => {
	if (data) {
		print("Player data received:", data);
	} else {
		warn("No player data received.");
	}
});

const playerHud = PlayerHUD;

print("Main client initialized with consolidated controller architecture");
