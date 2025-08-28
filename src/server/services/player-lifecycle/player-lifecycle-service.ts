/**
 * @file src/server/services/player-lifecycle-service.ts
 * @module PlayerLifecycleService
 * @layer Server/Services
 * @description Unified lifecycle service: spawn + respawn + humanoid health/death bridge.
 *
 * Responsibilities
 * - Handle REQUEST_SPAWN (rate-limited, idempotent, profile-checked)
 * - Monitor Humanoid of each Character and emit signals:
 *     • HumanoidHealthChanged
 *     • HumanoidDied
 * - Schedule safe, duplicate-suppressed respawns and notify client on spawn complete
 *
 * Keeps network and signal names consistent with legacy services.
 */

import { Players } from "@rbxts/services";
import { SpawnRemotes } from "shared/network/spawn-remotes";
import type { SpawnResult } from "shared/dtos/spawn-dtos";
import { ServiceRegistryInstance } from "server/services/service-registry";
import { SignalServiceInstance } from "server/services/signal-service";

const REQUEST_THROTTLE_SECONDS = 1.0; // same as legacy SpawnService
const RESPAWN_DELAY_SECONDS = 3; // same as legacy RespawnService

export class PlayerLifecycleService {
	private static instance?: PlayerLifecycleService;

	/** Per-player last spawn request time (REQUEST_SPAWN throttle) */
	private lastSpawnRequestAt = new Map<Player, number>();
	/** Per-player "respawn scheduled" flag to avoid duplicates */
	private respawnScheduled = new Map<Player, boolean>();
	/** RBX connections per character to clean up Humanoid listeners */
	private humanoidConns = new Map<Model, RBXScriptConnection[]>();

	public static getInstance(): PlayerLifecycleService {
		if (!this.instance) this.instance = new PlayerLifecycleService();
		return this.instance;
	}

	private constructor() {
		this.bindRemoteHandlers();
		this.bindPlayerLifecycle();
	}

	// ────────────────────────────────────────────────────────────────────────────
	// Startup wiring
	// ────────────────────────────────────────────────────────────────────────────

	private bindRemoteHandlers() {
		// Unifies SpawnService behavior: throttle, idempotency, profile check → LoadCharacter()
		SpawnRemotes.Server.Get("REQUEST_SPAWN").SetCallback((player) => this.handleSpawnRequest(player));
	}

	private bindPlayerLifecycle() {
		// Existing players
		for (const p of Players.GetPlayers()) this.setupPlayer(p);

		// New / leaving players
		Players.PlayerAdded.Connect((p) => this.setupPlayer(p));
		Players.PlayerRemoving.Connect((p) => {
			this.respawnScheduled.delete(p);
			const char = p.Character;
			if (char) this.cleanupCharacter(char);
		});
	}

	private setupPlayer(player: Player) {
		// Wire existing character
		const existing = player.Character;
		if (existing) this.onCharacterAdded(player, existing);

		// Character lifecycle
		player.CharacterAdded.Connect((char) => this.onCharacterAdded(player, char));
		player.CharacterRemoving.Connect((char) => this.cleanupCharacter(char));
	}

	// ────────────────────────────────────────────────────────────────────────────
	// Spawn / Respawn
	// ────────────────────────────────────────────────────────────────────────────

	private handleSpawnRequest(player: Player): SpawnResult {
		print(`[PlayerLifecycle] REQUEST_SPAWN from ${player.Name}`);

		if (this.isThrottled(player)) {
			warn(`[PlayerLifecycle] Throttled spawn request for ${player.Name}`);
			return { success: false, reason: "SERVER_ERROR" };
		}

		// Profile/session guard (same guard used by legacy SpawnService)
		const dataOps = ServiceRegistryInstance.getDataOperations();
		const profile = dataOps.getProfile(player);
		if (profile === undefined) {
			warn(`[PlayerLifecycle] NO_PROFILE for ${player.Name}`);
			return { success: false, reason: "NO_PROFILE" };
		}

		// Idempotency: don't spawn if already alive
		if (this.hasActiveCharacter(player)) {
			warn(`[PlayerLifecycle] ALREADY_SPAWNED for ${player.Name}`);
			return { success: false, reason: "ALREADY_SPAWNED" };
		}

		// Perform authoritative spawn
		try {
			print(`[PlayerLifecycle] Loading character for ${player.Name}`);
			player.LoadCharacter();
			SpawnRemotes.Server.Get("SPAWN_COMPLETE").SendToPlayer(player);
			return { success: true };
		} catch (e) {
			warn(`[PlayerLifecycle] Failed to spawn ${player.Name}:`, e);
			return { success: false, reason: "SERVER_ERROR" };
		}
	}

	private scheduleRespawn(player: Player) {
		if (this.respawnScheduled.get(player)) return; // duplicate suppression
		this.respawnScheduled.set(player, true);

		task.delay(RESPAWN_DELAY_SECONDS, () => {
			// Player still here?
			if (player.Parent === undefined) {
				this.respawnScheduled.delete(player);
				return;
			}

			// If a healthy character already exists, skip
			if (this.hasActiveCharacter(player)) {
				this.respawnScheduled.delete(player);
				return;
			}

			try {
				player.LoadCharacter();
				SpawnRemotes.Server.Get("SPAWN_COMPLETE").SendToPlayer(player);
			} catch (e) {
				warn(`[PlayerLifecycle] Respawn failed for ${player.Name}:`, e);
			} finally {
				this.respawnScheduled.delete(player);
			}
		});
	}

	private hasActiveCharacter(player: Player): boolean {
		const character = player.Character;
		if (character === undefined) return false;
		const humanoid = character.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
		// Consider character active only if Humanoid exists and is alive
		if (humanoid === undefined) return false;
		return humanoid.Health > 0;
	}

	private isThrottled(player: Player): boolean {
		const now = os.clock();
		const last = this.lastSpawnRequestAt.get(player);
		if (last !== undefined && now - last < REQUEST_THROTTLE_SECONDS) return true;
		this.lastSpawnRequestAt.set(player, now);
		return false;
	}

	// ────────────────────────────────────────────────────────────────────────────
	// Humanoid monitoring → standardized signals
	// ────────────────────────────────────────────────────────────────────────────

	private onCharacterAdded(player: Player, character: Model) {
		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid === undefined) {
			warn(`[PlayerLifecycle] No Humanoid for ${player.Name}`);
			return;
		}

		const conns: RBXScriptConnection[] = [];

		// Health bridge → HumanoidHealthChanged
		conns.push(
			humanoid.HealthChanged.Connect((newHealth) => {
				SignalServiceInstance.emit("HumanoidHealthChanged", {
					player,
					character,
					newHealth,
					maxHealth: humanoid.MaxHealth,
				});
			}),
		);

		// Death bridge → HumanoidDied, then schedule respawn
		conns.push(
			humanoid.Died.Connect(() => {
				SignalServiceInstance.emit("HumanoidDied", { player, character });
				this.scheduleRespawn(player);
			}),
		);

		this.humanoidConns.set(character, conns);
		print(`[PlayerLifecycle] Humanoid wired for ${player.Name}`);
	}

	private cleanupCharacter(character: Model) {
		const conns = this.humanoidConns.get(character);
		if (!conns) return;
		conns.forEach((c) => c.Disconnect());
		this.humanoidConns.delete(character);
	}
}

export const PlayerLifecycleServiceInstance = PlayerLifecycleService.getInstance();
