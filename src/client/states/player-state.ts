import Fusion, { Computed, ForKeys, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { AbilitiesState, createAbilitiesState, PersistantPlayerData, PlayerDTO } from "shared";
import {
	makeDefaultResourceDTO,
	makeResourceStateFromDTO,
	ResourceRemotes,
	ResourceStateMap,
	ResourceDTO,
} from "shared/catalogs/resources-catalog";
import { DataRemotes } from "shared/network/data-remotes";

const fetchPersistantData = DataRemotes.Client.Get("GET_PLAYER_DATA");
const FetchResources = ResourceRemotes.Client.Get("FetchResources");
const ResourcesUpdated = ResourceRemotes.Client.Get("ResourcesUpdated");

class PlayerState {
	private static instance?: PlayerState;
	private player: Player = Players.LocalPlayer;
	public Resources: ResourceStateMap = makeResourceStateFromDTO(makeDefaultResourceDTO());
	public Abilities: AbilitiesState = createAbilitiesState();
	public Level: Value<number> = Value(1); // Default level, can be adjusted

	private constructor(playerData?: PlayerDTO) {
		warn("PlayerState initialized for", this.player.Name, "with data:", playerData);

		// Setup resource update listener immediately in constructor
		ResourcesUpdated.Connect((resources) => {
			if (resources) {
				this.UpdateResources(resources);
				print("Real-time resource update received:", resources);
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

		dataPromise.then((data) => {
			if (data) {
				const playerData = data as PlayerDTO;
				this.instance?.SetPersistentData(playerData);
				print("Player data initialized:", playerData);
			} else {
				warn("No player data received.");
			}
		});
		resourcesPromise.then((resources) => {
			if (resources) {
				this.instance?.SetResources(makeResourceStateFromDTO(resources));
				print("Player resources initialized:", resources);
			} else {
				warn("No player resources received.");
			}
		});
		return this.GetInstance();
	}

	public SetPersistentData(data: PersistantPlayerData): void {
		if (data) {
			this.Level.set(data.Level);
			const abilities = data.Abilities;

			ForKeys(abilities, (key) => {
				this.Abilities[key].set(abilities[key]);
			});
			print("Player data set:", data);
		} else {
			warn("No player data provided.");
		}
	}

	public SetResources(resources: ResourceStateMap): void {
		if (resources) {
			// Important: Do NOT replace the map reference.
			// Mutate existing Value objects so any already-mounted UI keeps updating.
			ForKeys(resources, (key) => {
				const incoming = resources[key];
				const current = this.Resources[key];
				if (current !== undefined) {
					current.current.set(incoming.current.get());
					current.max.set(incoming.max.get());
				} else {
					// Fallback: if a new resource appears, adopt it
					this.Resources[key] = incoming;
				}
			});
			print("Player resources set (merged into existing state):", resources);
		} else {
			warn("No player resources provided.");
		}
	}

	public UpdateResources(resourceDTO: ResourceDTO): void {
		if (resourceDTO !== undefined) {
			print("UpdateResources called with:", resourceDTO);

			// Update existing resource states with new values from server
			if (this.Resources.Health && resourceDTO.Health) {
				print(`Setting Health: ${resourceDTO.Health.current}/${resourceDTO.Health.max}`);
				this.Resources.Health.current.set(resourceDTO.Health.current);
				this.Resources.Health.max.set(resourceDTO.Health.max);
			}
			if (this.Resources.Mana && resourceDTO.Mana) {
				print(`Setting Mana: ${resourceDTO.Mana.current}/${resourceDTO.Mana.max}`);
				this.Resources.Mana.current.set(resourceDTO.Mana.current);
				this.Resources.Mana.max.set(resourceDTO.Mana.max);
			}
			if (this.Resources.Stamina && resourceDTO.Stamina) {
				print(`Setting Stamina: ${resourceDTO.Stamina.current}/${resourceDTO.Stamina.max}`);
				this.Resources.Stamina.current.set(resourceDTO.Stamina.current);
				this.Resources.Stamina.max.set(resourceDTO.Stamina.max);
			}
			print("Player resources updated successfully");
		} else {
			warn("No resource DTO provided for update.");
		}
	}

	public getComputedLabel(key: keyof ResourceStateMap): Computed<string> {
		return Computed(() => {
			const resource = this.Resources[key];
			if (resource) {
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
		warn(`getComputedResource called for key: ${key}`);
		const resource = this.Resources[key];
		if (resource) {
			return Computed(() => resource.current.get());
		} else {
			warn(`Resource ${key} does not exist.`);
			return Computed(() => 0); // Default to 0 if resource doesn't exist
		}
	}
}
export const PlayerStateInstance = PlayerState.GetInstance();
