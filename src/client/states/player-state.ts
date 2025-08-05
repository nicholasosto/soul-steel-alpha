import Fusion, { ForKeys, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { AbilitiesState, createAbilitiesState, PersistantPlayerData, PlayerDTO } from "shared";
import {
	makeDefaultResourceDTO,
	makeResourceStateFromDTO,
	ResourceRemotes,
	ResourceStateMap,
} from "shared/catalogs/resources-catalog";
import { DataRemotes } from "shared/network/data-remotes";

const fetchPersistantData = DataRemotes.Client.Get("GET_PLAYER_DATA");
const FetchResources = ResourceRemotes.Client.Get("FetchResources");

class PlayerState {
	private static instance?: PlayerState;
	private player: Player = Players.LocalPlayer;
	public Resources: ResourceStateMap = makeResourceStateFromDTO(makeDefaultResourceDTO());
	public Abilities: AbilitiesState = createAbilitiesState();
	public Level: Value<number> = Value(1); // Default level, can be adjusted
	private constructor(playerData?: PlayerDTO) {
		warn("PlayerState initialized for", this.player.Name, "with data:", playerData);
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
			this.Resources = resources;
			print("Player resources set:", resources);
		} else {
			warn("No player resources provided.");
		}
	}
}
export const PlayerStateInstance = PlayerState.GetInstance();
