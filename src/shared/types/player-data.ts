import { ResourceDTO, ResourceStateMap } from "shared/catalogs/resources-catalog";
import { AbilitiesState, AbilityDTO } from "shared/catalogs";
import { Value } from "@rbxts/fusion";

export interface PlayerProgression {
	Level: number; // Player's level
	Experience: number; // Player's experience points
	NextLevelExperience: number; // Experience required for the next level
}

export interface PersistantPlayerData {
	Abilities: AbilityDTO; // Player's abilities and their levels
	Progression: PlayerProgression; // Player's progression data
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
