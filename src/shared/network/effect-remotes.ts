import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import { VFXKey } from "shared/packages";
import { SSEntity } from "shared/types";

export const EffectRemotes = Definitions.Create({
	[SIGNAL_KEYS.RUN_EVENT]: Definitions.ServerAsyncFunction<(vfxKey: VFXKey) => boolean>(),
	// New, typed effect broadcast that includes the target entity and optional duration
	RunEffectOnEntity: Definitions.ServerToClientEvent<[effectKey: VFXKey, entity: SSEntity, duration?: number]>(),
});
