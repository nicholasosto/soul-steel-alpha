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

import { makeHello } from "shared/module";
import { ClientController } from "./controllers";

print(makeHello("main.client.ts"));

// Initialize the main client controller
// This will set up input handling, movement, and game actions
const clientController = ClientController.initialize();

// The client is now ready
print("Client initialization complete");
