/**
 * @fileoverview Spawn DTOs - Data transfer objects for spawn requests/results
 * @module shared/dtos/spawn-dtos
 * @description
 * Defines spawn request/response shapes used by spawn flow remotes.
 */

export type SpawnFailureReason = "NO_PROFILE" | "ALREADY_SPAWNED" | "SERVER_ERROR";

export interface SpawnResult {
	/** Whether the server accepted and completed the spawn */
	success: boolean;
	/** Optional failure reason when success is false */
	reason?: SpawnFailureReason;
	/** Optional serialized CFrame or a spawn key to place the client UI/camera */
	spawnCFrame?: string;
}
