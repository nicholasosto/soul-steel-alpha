import { ResourceDTO, ResourceStateMap } from "shared/catalogs/resources-catalog";
import { AbilitiesState, AbilityDTO, AbilityKey } from "shared/catalogs";
import { AttributeDTO } from "shared/catalogs/attribute-catalog";
import { Value } from "@rbxts/fusion";
import { CurrencyDTO } from "shared/catalogs/currency-catalog";

export interface PlayerProgression {
	Level: number; // Player's level
	Experience: number; // Player's experience points
	NextLevelExperience: number; // Experience required for the next level
}

export interface PersistentPlayerData {
	Abilities: AbilityDTO; // Player's abilities and their levels
	Attributes: AttributeDTO; // Core attributes (Strength, Agility, etc.)
	Currency: CurrencyDTO;
	Progression: PlayerProgression; // Player's progression data
	Controls?: PlayerControlsData; // Optional until migration complete
}

export interface PlayerDTO extends PersistentPlayerData {
	Resources: ResourceDTO; // Player's resources like health, mana, etc.
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

/**
 * Creates default player progression data for new players
 * @returns Default PlayerProgression object
 */
export function makeDefaultPlayerProgression(): PlayerProgression {
	return {
		Level: 1,
		Experience: 0,
		NextLevelExperience: 100, // XP needed to reach level 2
	};
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
