import { Computed, Value } from "@rbxts/fusion";
import {
	RESOURCE_KEYS,
	ResourceDTO,
	ResourceKey,
	ResourceRemotes,
	makeDefaultResourceDTO,
	makeResourceStateFromDTO,
	ResourceStateMap,
} from "shared/catalogs/resources-catalog";

const FetchResources = ResourceRemotes.Client.Get("FetchResources");
const ResourcesUpdated = ResourceRemotes.Client.Get("ResourcesUpdated");

export class PlayerResourceState {
	private static instance?: PlayerResourceState;
	public readonly Resources: ResourceStateMap = makeResourceStateFromDTO(makeDefaultResourceDTO());

	private constructor() {
		// Subscribe to server push updates
		ResourcesUpdated.Connect((dto) => this.applyDTO(dto));
		// Fetch initial snapshot
		FetchResources.CallServerAsync()
			.then((dto) => dto && this.applyDTO(dto))
			.catch((err) => warn("FetchResources failed:", err));
	}

	public static GetInstance(): PlayerResourceState {
		if (!this.instance) this.instance = new PlayerResourceState();
		return this.instance;
	}

	private applyDTO(dto: ResourceDTO) {
		for (const key of RESOURCE_KEYS) {
			const { current, max } = dto[key];
			const state = this.Resources[key];
			state.current.set(current);
			state.max.set(max);
		}
	}

	public labelFor(key: ResourceKey): Computed<string> {
		const state = this.Resources[key];
		return Computed(() => `${key}: ${math.floor(state.current.get())}/${math.floor(state.max.get())}`);
	}
}

export const PlayerResourceStateInstance = PlayerResourceState.GetInstance();
