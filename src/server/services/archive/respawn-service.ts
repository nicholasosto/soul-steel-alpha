// /**
//  * @file src/server/services/respawn-service.ts
//  * @module RespawnService
//  * @layer Server/Services
//  * @description Safely handles player character respawn after death with delay and guards.
//  */

// import { Players } from "@rbxts/services";
// import { SignalServiceInstance } from "./signal-service";
// import { SpawnRemotes } from "shared/network/spawn-remotes";

// const RESPAWN_DELAY_SECONDS = 3; // tweakable respawn delay

// /**
//  * RespawnService – schedules and performs safe respawns when a player's Humanoid dies.
//  *
//  * Responsibilities:
//  * - Listen to HumanoidDied (via SignalService)
//  * - Schedule delayed respawn with duplicate suppression per player
//  * - Validate player/session state before calling LoadCharacter()
//  * - Notify client of spawn completion for UI consistency (optional)
//  */
// export class RespawnService {
// 	private static instance?: RespawnService;
// 	private scheduled = new Map<Player, boolean>();

// 	private constructor() {
// 		this.bindSignals();
// 		this.bindCleanup();
// 	}

// 	public static getInstance(): RespawnService {
// 		if (RespawnService.instance === undefined) {
// 			RespawnService.instance = new RespawnService();
// 		}
// 		return RespawnService.instance;
// 	}

// 	private bindSignals() {
// 		// Bridge from Humanoid death → respawn scheduling
// 		SignalServiceInstance.connect("HumanoidDied", (payload) => {
// 			const { player } = payload as { player: Player; character: Model };
// 			if (player === undefined) return; // explicit guard
// 			this.scheduleRespawn(player);
// 		});
// 	}

// 	private bindCleanup() {
// 		// Ensure we don't keep stale scheduled flags when players leave
// 		Players.PlayerRemoving.Connect((player) => {
// 			this.scheduled.delete(player);
// 		});
// 	}

// 	/**
// 	 * Schedule a respawn with duplicate suppression and state validation.
// 	 */
// 	private scheduleRespawn(player: Player) {
// 		if (this.scheduled.get(player) === true) {
// 			return; // already scheduled; avoid duplicates
// 		}
// 		this.scheduled.set(player, true);

// 		task.delay(RESPAWN_DELAY_SECONDS, () => {
// 			// Validate player still in-game
// 			if (player.Parent === undefined) {
// 				this.scheduled.delete(player);
// 				return;
// 			}

// 			// If character already exists and is alive, skip
// 			const character = player.Character;
// 			if (character !== undefined) {
// 				const humanoid = character.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
// 				if (humanoid !== undefined && humanoid.Health > 0) {
// 					this.scheduled.delete(player);
// 					return;
// 				}
// 			}

// 			// Perform server-authoritative respawn
// 			try {
// 				player.LoadCharacter();
// 				// Optional: notify client for UI flows that reuse SPAWN_COMPLETE
// 				SpawnRemotes.Server.Get("SPAWN_COMPLETE").SendToPlayer(player);
// 			} catch (e) {
// 				warn(`[RespawnService] Failed to respawn ${player.Name}:`, e);
// 			} finally {
// 				this.scheduled.delete(player);
// 			}
// 		});
// 	}
// }

// export const RespawnServiceInstance = RespawnService.getInstance();
