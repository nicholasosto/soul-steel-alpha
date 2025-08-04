import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import { VFXKey } from "shared/packages";

export const EffectRemotes = Definitions.Create({
	[SIGNAL_KEYS.RUN_EVENT]: Definitions.ServerAsyncFunction<(vfxKey: VFXKey) => boolean>(),
});
