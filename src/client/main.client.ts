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
import { createSSFusionScreen, createPlayerHUD } from "./screens";
const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const fusionComponents = createSSFusionScreen(playerGui);
//const playerHud = createPlayerHUD(playerGui);

// Demo imports moved under client/demos. Remove or update if needed.
// Initialize the main client controller (this initializes all sub-controllers)
const clientController = ClientController.initialize();
clientController.getAbilityController();

//const playerHud = PlayerHUD;

print("Main client initialized with consolidated controller architecture");
