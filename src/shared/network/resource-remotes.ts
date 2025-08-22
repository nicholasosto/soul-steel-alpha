import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import { AbilityKey, ResourceDTO } from "shared/catalogs";

export const ResourceRemotes = Definitions.Create({
	[SIGNAL_KEYS.RESOURCES_UPDATED]: Definitions.ServerToClientEvent<[ResourceDTO]>(),
	[SIGNAL_KEYS.FETCH_RESOURCES]: Definitions.ServerAsyncFunction<() => ResourceDTO>(),
});
