/**
 * @file src/server/demos/combat-debug-commands.ts
 * @description Lightweight admin/debug chat commands for CombatService (ModuleScript)
 * Exported initializer is called from the single server entry point.
 */

import { Players, RunService } from "@rbxts/services";
import { CombatServiceInstance } from "server/services/combat-service";
import { MessageServiceInstance } from "server/services/message-service";

export interface CombatDebugOptions {
	enabled?: boolean; // default: Studio only
	adminUserIds?: number[]; // optional allowlist for live servers
}

function isAdmin(player: Player, allowlist: ReadonlyArray<number>): boolean {
	if (RunService.IsStudio()) return true;
	return allowlist.includes(player.UserId);
}

export function initializeCombatDebugCommands(options?: CombatDebugOptions): void {
	const enabled = options?.enabled ?? RunService.IsStudio();
	const adminAllowlist = options?.adminUserIds ?? [];

	if (!enabled) return;

	function onPlayerChatted(player: Player, message: string) {
		if (!isAdmin(player, adminAllowlist)) return;

		// Simple exact-match command; keep noise low
		if (message === "!combat sessions") {
			const sessions = CombatServiceInstance.GetActiveSessions();
			if (sessions.size() === 0) {
				print("[CombatDebug] No active combat sessions.");
				MessageServiceInstance.SendInfoToPlayer(player, "No active combat sessions.");
				return;
			}

			print(`[CombatDebug] Active sessions: ${sessions.size()}`);
			for (const session of sessions) {
				const age = math.floor(tick() - session.startTime);
				const names = session.participants.map((p) => p.Name).join(", ");
				print(
					` - ${session.sessionId} | participants: [${names}] | age: ${age}s | active: ${session.isActive}`,
				);
			}

			// Send a concise note back to requester
			MessageServiceInstance.SendInfoToPlayer(player, `Active combat sessions: ${sessions.size()}`);
		}
	}

	function attachToPlayer(player: Player) {
		player.Chatted.Connect((msg) => onPlayerChatted(player, msg));
	}

	// Hook existing players and future joins
	for (const p of Players.GetPlayers()) attachToPlayer(p);
	Players.PlayerAdded.Connect((p) => attachToPlayer(p));
	print("[CombatDebug] Chat commands enabled (Studio or allowlist only).");
}
