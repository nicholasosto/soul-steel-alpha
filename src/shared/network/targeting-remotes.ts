import { Definitions } from "@rbxts/net";
import { SSEntity } from "shared/types";

/**
 * Targeting remotes: client requests lock; server validates; optional server push updates.
 */
export const TargetingRemotes = Definitions.Create({
	TryLockTarget: Definitions.ServerAsyncFunction<(entity: SSEntity) => boolean>(),
	ClearTarget: Definitions.ServerAsyncFunction<() => boolean>(),
	TargetUpdated: Definitions.ServerToClientEvent<[target?: SSEntity]>(),
});
