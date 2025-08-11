import { Computed, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { ABILITY_KEYS, AbilitiesState, createAbilitiesState, PersistantPlayerData, PlayerDTO } from "shared";
import {
	makeDefaultResourceDTO,
	makeResourceStateFromDTO,
	ResourceRemotes,
	ResourceStateMap,
	ResourceDTO,
	RESOURCE_KEYS,
	ResourceKey,
} from "shared/catalogs/resources-catalog";
import { DataRemotes } from "shared/network/data-remotes";

const fetchPersistantData = DataRemotes.Client.Get("GET_PLAYER_DATA");
const PlayerDataUpdated = DataRemotes.Client.Get("PLAYER_DATA_UPDATED");
const FetchResources = ResourceRemotes.Client.Get("FetchResources");
const ResourcesUpdated = ResourceRemotes.Client.Get("ResourcesUpdated");

class PlayerState {
	private static instance?: PlayerState;
	private player: Player = Players.LocalPlayer;
	public Resources: ResourceStateMap = makeResourceStateFromDTO(makeDefaultResourceDTO());
	public Abilities: AbilitiesState = createAbilitiesState();
	public Level: Value<number> = Value(1); // Default level, can be adjusted

	// Helper: apply a single resource update safely
	private applyResource(key: ResourceKey, dto?: { current: number; max: number }): void {
		if (dto === undefined) return;
		const state = this.Resources[key];
		if (state !== undefined) {
			state.current.set(dto.current);
			state.max.set(dto.max);
		}
	}

	private constructor(playerData?: PlayerDTO) {
		warn("PlayerState initialized for", this.player.Name, "with data:", playerData);
		// Setup resource update listener immediately in constructor
		ResourcesUpdated.Connect((resources) => {
			if (resources !== undefined) {
				this.UpdateResources(resources);
			}
		});
		// Listen for server-pushed player data updates (level, abilities)
		PlayerDataUpdated.Connect((data) => {
			if (data !== undefined) {
				this.SetPersistentData(data);
				print("Player data updated (push):", data);
			}
		});
	}
	public static GetInstance(): PlayerState {
		if (this.instance === undefined) {
			this.instance = new PlayerState();
			this._initializeData();
		}
		return this.instance;
	}

	private static _initializeData(): PlayerState {
		// Initialize any necessary connections or listeners here
		const dataPromise = fetchPersistantData.CallServerAsync();
		const resourcesPromise = FetchResources.CallServerAsync();

		dataPromise
			.then((data) => {
				if (data !== undefined) {
					const playerData = data as PlayerDTO;
					this.instance?.SetPersistentData(playerData);
					print("Player data initialized:", playerData);
				} else {
					warn("No player data received.");
				}
			})
			.catch((err) => warn("GET_PLAYER_DATA failed:", err));
		resourcesPromise
			.then((resources) => {
				if (resources !== undefined) {
					this.instance?.SetResources(makeResourceStateFromDTO(resources));
					print("Player resources initialized:", resources);
				} else {
					warn("No player resources received.");
				}
			})
			.catch((err) => warn("FetchResources failed:", err));
		return this.GetInstance();
	}

	public SetPersistentData(data: PersistantPlayerData): void {
		if (data !== undefined) {
			this.Level.set(data.Level);
			const abilities = data.Abilities;

			// Iterate known ability keys for type-safe updates
			for (const abilityKey of ABILITY_KEYS) {
				const value = abilities[abilityKey];
				const abilityState = this.Abilities[abilityKey];
				if (value !== undefined && abilityState !== undefined) {
					abilityState.set(value);
				}
			}
			print("Player data set:", data);
		} else {
			warn("No player data provided.");
		}
	}

	public SetResources(resources: ResourceStateMap): void {
		if (resources !== undefined) {
			// Do NOT replace the map reference; mutate existing Values using known keys
			for (const key of RESOURCE_KEYS) {
				const incoming = resources[key];
				const current = this.Resources[key];
				if (incoming !== undefined && current !== undefined) {
					current.current.set(incoming.current.get());
					current.max.set(incoming.max.get());
				} else if (incoming !== undefined && current === undefined) {
					// Fallback: if a new resource appears, adopt it
					this.Resources[key] = incoming;
				}
			}
			print("Player resources set (merged into existing state):", resources);
		} else {
			warn("No player resources provided.");
		}
	}

	public UpdateResources(resourceDTO: ResourceDTO): void {
		if (resourceDTO === undefined) return;

		for (const key of RESOURCE_KEYS) {
			const dto = resourceDTO[key];
			if (dto !== undefined) this.applyResource(key, dto);
		}
	}

	public getComputedLabel(key: keyof ResourceStateMap): Computed<string> {
		return Computed(() => {
			const resource = this.Resources[key];
			if (resource !== undefined) {
				const current = math.floor(resource.current.get());
				const max = math.floor(resource.max.get());
				// Ensure values are valid numbers
				const safeCurrent = current >= 0 ? current : 0;
				const safeMax = max > 0 ? max : 1;
				return `${key}: ${safeCurrent}/${safeMax}`;
			} else {
				warn(`Resource ${key} does not exist.`);
				return `${key}: 0/1`; // Default fallback
			}
		});
	}

	public getComputedResource(key: keyof ResourceStateMap): Computed<number> {
		const resource = this.Resources[key];
		if (resource !== undefined) {
			return Computed(() => resource.current.get());
		} else {
			warn(`Resource ${key} does not exist.`);
			return Computed(() => 0); // Default to 0 if resource doesn't exist
		}
	}
}
export const PlayerStateInstance = PlayerState.GetInstance();
