/**
 * @file src/server/demos/combat-debug-commands.server.ts
 * @description Lightweight admin/debug chat commands for CombatService
 *
 * Commands (Studio or whitelisted admins only):
 * - !combat sessions
 *   Prints a compact summary of active combat sessions and also sends a brief note to the requester.
 */

import { Players, RunService } from "@rbxts/services";
import { CombatServiceInstance } from "server/services/combat-service";
import { MessageServiceInstance } from "server/services/message-service";

// Enable only in Studio by default; provide optional admin allowlist for live debug
const ENABLED = RunService.IsStudio();
const ADMIN_USER_IDS: number[] = [] as const as number[]; // add user IDs here for live servers if needed

function isAdmin(player: Player): boolean {
	if (RunService.IsStudio()) return true;
	return ADMIN_USER_IDS.includes(player.UserId);
}

function onPlayerChatted(player: Player, message: string) {
	if (!ENABLED) return;
	if (!isAdmin(player)) return;

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
			print(` - ${session.sessionId} | participants: [${names}] | age: ${age}s | active: ${session.isActive}`);
		}

		// Send a concise note back to requester
		MessageServiceInstance.SendInfoToPlayer(player, `Active combat sessions: ${sessions.size()}`);
	}
}

function attachToPlayer(player: Player) {
	player.Chatted.Connect((msg) => onPlayerChatted(player, msg));
}

if (ENABLED) {
	// Hook existing players and future joins
	for (const p of Players.GetPlayers()) attachToPlayer(p);
	Players.PlayerAdded.Connect((p) => attachToPlayer(p));
	print("[CombatDebug] Chat commands enabled (Studio or allowlist only).");
}
