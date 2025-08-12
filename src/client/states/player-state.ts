import { Computed, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import {
	ABILITY_KEYS,
	AbilitiesState,
	createAbilitiesState,
	PersistantPlayerData,
	PlayerDTO,
	SSEntity,
	PlayerProgression,
	makeDefaultPlayerProgression,
} from "shared";
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
import { ProgressionRemotes } from "shared/network/progression-remotes";

const fetchPersistantData = DataRemotes.Client.Get("GET_PLAYER_DATA");
const PlayerDataUpdated = DataRemotes.Client.Get("PLAYER_DATA_UPDATED");
const FetchResources = ResourceRemotes.Client.Get("FetchResources");
const ResourcesUpdated = ResourceRemotes.Client.Get("ResourcesUpdated");

// Progression remotes
const FetchProgression = ProgressionRemotes.Client.Get("GET_PROGRESSION");
const ProgressionUpdated = ProgressionRemotes.Client.Get("PROGRESSION_UPDATED");
const LevelUp = ProgressionRemotes.Client.Get("LEVEL_UP");

class PlayerState {
	private static instance?: PlayerState;
	private player: Player = Players.LocalPlayer;
	public Resources: ResourceStateMap = makeResourceStateFromDTO(makeDefaultResourceDTO());
	public Abilities: AbilitiesState = createAbilitiesState();

	// Progression state - separated from resources
	public Progression: {
		Level: Value<number>;
		Experience: Value<number>;
		NextLevelExperience: Value<number>;
	};

	// Currently selected target (locked). Reactive for UI.
	public target: Value<SSEntity | undefined> = Value<SSEntity | undefined>(undefined);
	// Current hover/candidate target (aiming). Reactive for UI.
	public hoverTarget: Value<SSEntity | undefined> = Value<SSEntity | undefined>(undefined);

	// Legacy Level accessor for backwards compatibility
	public Level: Value<number>;

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
		// Initialize progression state with defaults
		const defaultProgression = makeDefaultPlayerProgression();
		this.Progression = {
			Level: Value(defaultProgression.Level),
			Experience: Value(defaultProgression.Experience),
			NextLevelExperience: Value(defaultProgression.NextLevelExperience),
		};

		// Legacy Level accessor points to Progression.Level
		this.Level = this.Progression.Level;

		warn("PlayerState initialized for", this.player.Name, "with data:", playerData);

		// Setup resource update listener immediately in constructor
		ResourcesUpdated.Connect((resources) => {
			if (resources !== undefined) {
				this.UpdateResources(resources);
			}
		});

		// Setup progression update listeners
		ProgressionUpdated.Connect((progression) => {
			if (progression !== undefined) {
				this.SetProgression(progression);
			}
		});

		LevelUp.Connect((newLevel, progression) => {
			this.SetProgression(progression);
			print(`🎉 Level Up! You are now level ${newLevel}!`);
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
		const progressionPromise = FetchProgression.CallServerAsync();

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

		progressionPromise
			.then((progression) => {
				if (progression !== undefined) {
					this.instance?.SetProgression(progression);
					print("Player progression initialized:", progression);
				} else {
					warn("No player progression received.");
				}
			})
			.catch((err) => warn("FetchProgression failed:", err));

		return this.GetInstance();
	}

	public SetPersistentData(data: PersistantPlayerData): void {
		if (data !== undefined) {
			// Update progression data
			this.SetProgression(data.Progression);

			// Update abilities
			const abilities = data.Abilities;
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

	public SetProgression(progression: PlayerProgression): void {
		if (progression !== undefined) {
			this.Progression.Level.set(progression.Level);
			this.Progression.Experience.set(progression.Experience);
			this.Progression.NextLevelExperience.set(progression.NextLevelExperience);
			print("Player progression set:", progression);
		} else {
			warn("No progression data provided.");
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

	// Progression-related computed properties
	public getComputedProgressionLabel(): Computed<string> {
		return Computed(() => {
			const level = this.Progression.Level.get();
			const exp = this.Progression.Experience.get();
			const nextLevelExp = this.Progression.NextLevelExperience.get();
			return `Level ${level} (${exp}/${nextLevelExp} XP)`;
		});
	}

	public getComputedExperienceProgress(): Computed<number> {
		return Computed(() => {
			const exp = this.Progression.Experience.get();
			const nextLevelExp = this.Progression.NextLevelExperience.get();
			return nextLevelExp > 0 ? exp / nextLevelExp : 0;
		});
	}
}
export const PlayerStateInstance = PlayerState.GetInstance();
