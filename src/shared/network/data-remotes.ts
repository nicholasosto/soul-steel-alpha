import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";

export const DataRemotes = Definitions.Create({
	[SIGNAL_KEYS.GET_PLAYER_DATA]: Definitions.ServerAsyncFunction<() => PlayerData>(),
});
