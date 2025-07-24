import { Definitions } from "@rbxts/net";
import { AbilityKey } from "shared/keys";

export const AbilityRemotes = Definitions.Create({
	START_ABILITY: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => boolean>(),
});
