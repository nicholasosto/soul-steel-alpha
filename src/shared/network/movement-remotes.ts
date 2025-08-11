import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import { AbilityKey } from "shared/catalogs";

export const AbilityRemotes = Definitions.Create({
    [SIGNAL_KEYS.ABILITY_ACTIVATE]: Definitions.ServerAsyncFunction<(abilityKey: AbilityKey) => boolean>(),
});
