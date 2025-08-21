import { ResourceDTO, ResourceStateMap } from "shared/catalogs/resources-catalog";
import { AbilitiesState, AbilityDTO, ABILITY_KEYS, AbilityKey } from "shared/catalogs";
import { Value } from "@rbxts/fusion";

export interface PlayerProgression {
	Level: number; // Player's level
	Experience: number; // Player's experience points
	NextLevelExperience: number; // Experience required for the next level
}

export interface PersistantPlayerData {
	Abilities: AbilityDTO; // Player's abilities and their levels
	Progression: PlayerProgression; // Player's progression data
	Controls?: PlayerControlsData; // Optional until migration complete
}

export interface PlayerDTO extends PersistantPlayerData {
	Resources: ResourceDTO; // Player's resources like health, mana, etc.
	Progression: PlayerProgression; // Player's progression data
}

export interface PlayerStateInterface {
	Level: Value<number>; // Reactive level value
	Abilities: AbilitiesState;
	Resources: ResourceStateMap;
}

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
