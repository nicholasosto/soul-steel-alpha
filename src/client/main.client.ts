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
import { Players } from "@rbxts/services";
import { ClientController } from "./controllers";
import { createPlayerHUD } from "./screens";
import { PlayerStateInstance } from "./states/player-state";

// Player GUI
const localPlayer = Players.LocalPlayer;

// Initialize the main client controller (this initializes all sub-controllers)
const clientController = ClientController.initialize();
clientController.getAbilityController();

// Initialize player state early to subscribe to resource updates
const _playerState = PlayerStateInstance;

const playerHUD = createPlayerHUD(localPlayer.WaitForChild("PlayerGui") as PlayerGui);
print("Player HUD created", playerHUD);
