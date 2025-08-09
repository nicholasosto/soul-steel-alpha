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
import { PlayerHUD } from "./screens";

// Initialize the main client controller (this initializes all sub-controllers)
const clientController = ClientController.initialize();
clientController.getAbilityController();

const playerHud = PlayerHUD;

print("Main client initialized with consolidated controller architecture");
