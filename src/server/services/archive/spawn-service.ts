// /**
//  * @file src/server/services/spawn-service.ts
//  * @module SpawnService
//  * @layer Server/Services
//  * @description Server-authoritative controlled player spawning with rate limiting and idempotency.
//  */

// import { Players } from "@rbxts/services";
// import { SpawnRemotes } from "shared/network/spawn-remotes";
// import type { SpawnResult } from "shared/dtos/spawn-dtos";
// import { ServiceRegistryInstance } from "./service-registry";

// const REQUEST_THROTTLE_SECONDS = 1.0;

// class SpawnService {
// 	private static instance?: SpawnService;

// 	// Per-player last request time for simple rate limiting
// 	private lastRequestAt = new Map<Player, number>();

// 	private constructor() {
// 		this.bindRemotes();
// 	}

// 	public static getInstance(): SpawnService {
// 		if (SpawnService.instance === undefined) {
// 			SpawnService.instance = new SpawnService();
// 		}
// 		return SpawnService.instance;
// 	}

// 	private bindRemotes() {
// 		SpawnRemotes.Server.Get("REQUEST_SPAWN").SetCallback((player) => this.handleSpawnRequest(player));
// 	}

// 	private hasActiveCharacter(player: Player): boolean {
// 		const character = player.Character;
// 		if (character === undefined) return false;
// 		const humanoid = character.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
// 		if (humanoid === undefined) return true; // character exists but no humanoid; treat as spawned to be safe
// 		return humanoid.Health > 0;
// 	}

// 	private isThrottled(player: Player): boolean {
// 		const now = os.clock();
// 		const last = this.lastRequestAt.get(player);
// 		if (last !== undefined && now - last < REQUEST_THROTTLE_SECONDS) return true;
// 		this.lastRequestAt.set(player, now);
// 		return false;
// 	}

// 	private handleSpawnRequest(player: Player): SpawnResult {
// 		print(`[SpawnService] REQUEST_SPAWN from ${player.Name}`);
// 		// Rate limit
// 		if (this.isThrottled(player)) {
// 			warn(`[SpawnService] Throttled spawn request for ${player.Name}`);
// 			return { success: false, reason: "SERVER_ERROR" };
// 		}

// 		// Validate profile/session
// 		const dataOps = ServiceRegistryInstance.getDataOperations();
// 		const profile = dataOps.getProfile(player);
// 		if (profile === undefined) {
// 			warn(`[SpawnService] NO_PROFILE for ${player.Name}`);
// 			return { success: false, reason: "NO_PROFILE" };
// 		}

// 		// Idempotency
// 		if (this.hasActiveCharacter(player)) {
// 			warn(`[SpawnService] ALREADY_SPAWNED for ${player.Name}`);
// 			return { success: false, reason: "ALREADY_SPAWNED" };
// 		}

// 		// Perform server-authoritative spawn
// 		try {
// 			print(`[SpawnService] Loading character for ${player.Name}`);
// 			player.LoadCharacter();
// 			// Optionally position/spawnCFrame here based on profile.Data or zones
// 			// Send optional completion event for UI state machine
// 			SpawnRemotes.Server.Get("SPAWN_COMPLETE").SendToPlayer(player);
// 			print(`[SpawnService] Spawn complete for ${player.Name}`);
// 			return { success: true };
// 		} catch (e) {
// 			warn(`[SpawnService] Failed to spawn ${player.Name}:`, e);
// 			return { success: false, reason: "SERVER_ERROR" };
// 		}
// 	}
// }

// export const SpawnServiceInstance = SpawnService.getInstance();
