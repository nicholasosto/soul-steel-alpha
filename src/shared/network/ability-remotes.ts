import { Definitions } from "@rbxts/net";
import { AbilityKey, SIGNAL_KEYS, SignalKey } from "shared/keys";
import { PlayerData } from "shared/types";

export const AbilityRemotes = Definitions.Create({
	[SIGNAL_KEYS.ABILITY_ACTIVATE]: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => boolean>(),
	[SIGNAL_KEYS.GET_PLAYER_DATA]: Definitions.ServerAsyncFunction<(playerId: string) => PlayerData | undefined>(),
	[SIGNAL_KEYS.SET_PLAYER_DATA]: Definitions.ServerAsyncFunction<(playerId: string, data: Partial<PlayerData>) => boolean>(),
});