import * as Net from "@rbxts/net";

/// <reference types="@rbxts/types" />

/**
 * @file        Definitions.ts
 * @module      NetworkDefinitions
 * @layer       Shared/Network
 * @description Typed network event definitions for the project.
 */

/* =============================================== Imports =============================================== */
import { Definitions } from "@rbxts/net";

export const GameCycleRemotes = Net.Definitions.Create({
	ClientUILoaded: Definitions.ClientToServerEvent<[]>(),
});
