import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import { PersistantPlayerData } from "shared/types";

export const DataRemotes = Definitions.Create({
	[SIGNAL_KEYS.GET_PLAYER_DATA]: Definitions.ServerAsyncFunction<() => PersistantPlayerData | undefined>(),
});
