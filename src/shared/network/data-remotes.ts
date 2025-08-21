import { Definitions } from "@rbxts/net";
import { EVENT_KEYS, SIGNAL_KEYS } from "shared/keys";
import { PersistentPlayerData } from "shared/types";

export const DataRemotes = Definitions.Create({
	[SIGNAL_KEYS.GET_PLAYER_DATA]: Definitions.ServerAsyncFunction<() => PersistentPlayerData | undefined>(),
	[EVENT_KEYS.PLAYER_DATA_UPDATED]: Definitions.ServerToClientEvent<[PersistentPlayerData]>(),
});
