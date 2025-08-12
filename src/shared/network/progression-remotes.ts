/**
 * @fileoverview Progression Remotes - Network definitions for player progression
 * @module shared/network/progression-remotes
 * @description
 * Defines the network interface for player progression system including
 * experience gain, level ups, and progression data synchronization.
 */

import { Definitions } from "@rbxts/net";
import { PlayerProgression } from "shared/types/player-data";

export const ProgressionRemotes = Definitions.Create({
	/**
	 * Get current player progression data
	 * @returns Current progression data or undefined if not found
	 */
	GET_PROGRESSION: Definitions.ServerAsyncFunction<() => PlayerProgression | undefined>(),

	/**
	 * Award experience to a player (server-only, for admin/testing)
	 * @param amount Amount of experience to award
	 * @returns Success status
	 */
	AWARD_EXPERIENCE: Definitions.ServerAsyncFunction<(amount: number) => boolean>(),

	/**
	 * Event fired when player levels up
	 * @param newLevel The new level achieved
	 * @param progression Complete progression data
	 */
	LEVEL_UP: Definitions.ServerToClientEvent<[newLevel: number, progression: PlayerProgression]>(),

	/**
	 * Event fired when progression data changes
	 * @param progression Updated progression data
	 */
	PROGRESSION_UPDATED: Definitions.ServerToClientEvent<[progression: PlayerProgression]>(),
});
