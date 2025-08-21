/**
 * @fileoverview Profile Remotes - Network definitions for profile bootstrap
 * @module shared/network/profile-remotes
 * @description
 * Notifies clients when their profile is ready for the session.
 */

import { Definitions } from "@rbxts/net";
import { PersistentPlayerData } from "shared/types/player-data";

export const ProfileRemotes = Definitions.Create({
	/**
	 * Fired when the player's profile is loaded and bound to the session.
	 * Client uses this to transition from LoadingScreen to Game Menu.
	 */
	PROFILE_READY: Definitions.ServerToClientEvent<[profileSummary: PersistentPlayerData]>(),
});
