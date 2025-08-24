import { ResourceDTO, ResourceStateMap } from "shared/catalogs/resources-catalog";
import { AbilityDTO, AbilityKey, ProgressionDTO } from "shared/catalogs";
import { AttributeDTO } from "shared/catalogs/attribute-catalog";
import { CurrencyDTO } from "shared/catalogs/currency-catalog";

export const PLAYER_DATA_KEYS = ["Abilities", "Attributes", "Currency", "Progression", "Controls"] as const;
export type PlayerDataKey = (typeof PLAYER_DATA_KEYS)[number];

export interface PersistentPlayerData {
	Abilities: AbilityDTO; // Player's abilities and their levels
	Attributes: AttributeDTO; // Core attributes (Strength, Agility, etc.)
	Currency: CurrencyDTO;
	Progression: ProgressionDTO; // Player's progression data
	Controls?: PlayerControlsData; // Optional until migration complete
}

export interface CalculatedPlayerData extends PersistentPlayerData {
	Resource: ResourceDTO;
}
// Note: Client state shape lives in client/state; avoid shared coupling

/** Mapping from keyboard key name (Enum.KeyCode.Name) to an AbilityKey */
export type AbilityHotkeyMap = Partial<Record<string, AbilityKey>>;

/** DTO for hotkey bindings saved in profile */
export interface HotkeyBindingsDTO {
	abilities: AbilityHotkeyMap;
}

/** Controls payload saved under profile.Controls */
export interface PlayerControlsData {
	bindings: HotkeyBindingsDTO;
}

/** Default ability bindings: Q, E, R → Melee, Ice-Rain, Earthquake */
export function makeDefaultHotkeyBindings(): HotkeyBindingsDTO {
	// Only include known defaults; client/server will sanitize at runtime
	return { abilities: { Q: "Melee", E: "Ice-Rain", R: "Earthquake" } };
}

/** Default controls wrapper */
export function makeDefaultPlayerControls(): PlayerControlsData {
	return { bindings: makeDefaultHotkeyBindings() };
}
