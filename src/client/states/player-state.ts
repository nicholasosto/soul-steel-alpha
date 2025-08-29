import { Computed, Observer, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { PersistentPlayerData, SSEntity } from "shared";

/* Progression Imports */
import {
	ProgressionDTO,
	ProgressionState,
	makeProgressionStateFromDTO,
	makeDefaultProgressionState,
} from "shared/catalogs/progression-catalog";
/* Ability Imports */
import { AbilitiesState, makeAbilityStateFromDTO, makeDefaultAbilitiesState } from "shared/catalogs/ability-catalog";
/* Attribute Imports */
import {
	AttributeDTO,
	AttributeState,
	makeAttributeStateFromDTO,
	makeDefaultAttributeState,
} from "shared/catalogs/attribute-catalog";
/* Resource Imports */
import { ResourceStateMap, ResourceDTO, makeDefaultResourceState } from "shared/catalogs/resources-catalog";

/* Currency Imports */
import {
	CurrencyDTO,
	CurrencyState,
	makeCurrencyStateFromDTO,
	makeDefaultCurrencyState,
} from "shared/catalogs/currency-catalog";

/* Remote Imports*/
import { ProgressionRemotes, DataRemotes, CurrencyRemotes, AttributeRemotes, ResourceRemotes } from "shared/network";

/* Remotes */
const fetchPersistantData = DataRemotes.Client.Get("GET_PLAYER_DATA");
const PlayerDataUpdated = DataRemotes.Client.Get("PLAYER_DATA_UPDATED");
const ResourcesUpdated = ResourceRemotes.Client.Get("RESOURCES_UPDATED");
const ProgressionUpdated = ProgressionRemotes.Client.Get("PROGRESSION_UPDATED");
const AttributesUpdated = AttributeRemotes.Client.Get("ATTRIBUTES_UPDATED");
const CurrencyUpdated = CurrencyRemotes.Client.Get("CURRENCY_UPDATED");

class PlayerState {
	private static instance?: PlayerState;
	private player: Player = Players.LocalPlayer;
	private static PlayerStateReady = Value(false);

	public Abilities: AbilitiesState = makeDefaultAbilitiesState();
	public Attributes: AttributeState = makeDefaultAttributeState();
	public Currency: CurrencyState = makeDefaultCurrencyState();
	public Progression: ProgressionState = makeDefaultProgressionState();
	public Resources: ResourceStateMap = makeDefaultResourceState();

	// Currently selected target (locked). Reactive for UI.
	public target: Value<SSEntity | undefined> = Value<SSEntity | undefined>(undefined);
	// Current hover/candidate target (aiming). Reactive for UI.
	public hoverTarget: Value<SSEntity | undefined> = Value<SSEntity | undefined>(undefined);

	private constructor() {
		/* Register Update Handlers */
		AttributesUpdated.Connect((values) => this._updateAttributes(values));
		ProgressionUpdated.Connect((progression) => this._updateProgression(progression));
		CurrencyUpdated.Connect((currency) => this._updateCurrency(currency));
		ResourcesUpdated.Connect((resources) => this._updateResources(resources));
		PlayerDataUpdated.Connect((data) => this.SetPersistentData(data as PersistentPlayerData));
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
		const persistedDataPromise = fetchPersistantData.CallServerAsync();

		persistedDataPromise
			.then((data) => {
				const persistantPlayerData = data as PersistentPlayerData;
				if (persistantPlayerData !== undefined) {
					this.instance?.SetPersistentData(persistantPlayerData);
					print("Player data initialized:", persistantPlayerData);
					this.PlayerStateReady.set(true);
				} else {
					warn("No player data received.");
				}
			})
			.catch((err) => warn("GET_PLAYER_DATA failed:", err));

		Observer(this.PlayerStateReady).onChange(() => {
			if (this.PlayerStateReady.get()) {
				print("Player state is ready");
				//RequestSpawn.CallServerAsync();
			}
		});

		return this.GetInstance();
	}

	private _updateProgression(progressionDTO: ProgressionDTO): void {
		this.Progression.Experience.set(progressionDTO.Experience);
		this.Progression.Level.set(progressionDTO.Level);
		this.Progression.NextLevelExperience.set(progressionDTO.NextLevelExperience);
	}

	private _updateAttributes(attributesDTO: AttributeDTO): void {
		// Update individual attribute values to maintain reactivity
		for (const key of ["Strength", "Agility", "Intelligence", "Vitality", "Spirit", "Luck"] as const) {
			const attribute = this.Attributes[key];
			const dtoValue = attributesDTO[key];

			attribute.base.set(dtoValue.base);
			attribute.equipment?.set(dtoValue.equipment ?? 0);
			attribute.statusEffects?.set(dtoValue.statusEffects ?? 0);
			attribute.temporary?.set(dtoValue.temporary ?? 0);
		}
	}

	private _updateCurrency(currencyDTO: CurrencyDTO): void {
		this.Currency.Coins.set(currencyDTO.Coins);
		this.Currency.Tombs.set(currencyDTO.Tombs);
		this.Currency.AttributePoints.set(currencyDTO.AttributePoints);
	}

	public SetPersistentData(data: PersistentPlayerData): void {
		if (data !== undefined) {
			// Update progression data
			this.Abilities = makeAbilityStateFromDTO(data.Abilities);
			this.Attributes = makeAttributeStateFromDTO(data.Attributes);
			this.Currency = makeCurrencyStateFromDTO(data.Currency);
			this.Progression = makeProgressionStateFromDTO(data.Progression);

			print("Player data set:", data);
		} else {
			warn("No player data provided.");
		}
	}

	private _updateResources(resources: ResourceDTO): void {
		this.Resources.Health.max.set(resources.Health.max);
		this.Resources.Health.current.set(resources.Health.current);
		this.Resources.Mana.max.set(resources.Mana.max);
		this.Resources.Mana.current.set(resources.Mana.current);
		this.Resources.Stamina.max.set(resources.Stamina.max);
		this.Resources.Stamina.current.set(resources.Stamina.current);
	}
}
export const PlayerStateInstance = PlayerState.GetInstance();
