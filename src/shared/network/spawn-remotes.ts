/**
 * @fileoverview Spawn Remotes - Network definitions for controlled player spawn
 * @module shared/network/spawn-remotes
 * @description
 * Client requests spawn; server validates and performs character creation.
 */

import { Definitions } from "@rbxts/net";
import { SpawnResult } from "shared/dtos/spawn-dtos";

export const SpawnRemotes = Definitions.Create({
	/**
	 * Client requests to spawn their character after pressing Play.
	 * Server validates session/profile and performs server-authoritative spawn.
	 */
	REQUEST_SPAWN: Definitions.ServerAsyncFunction<() => SpawnResult>(),

	/**
	 * Optional event to signal spawn completion to client for UI transitions.
	 */
	SPAWN_COMPLETE: Definitions.ServerToClientEvent<[]>(),
});
