import { ResourceDTO, ResourceStateMap } from "shared/catalogs/resources-catalog";
import { AbilitiesState, AbilityDTO } from "shared/catalogs";
import { Value } from "@rbxts/fusion";

export interface PersistantPlayerData {
	Abilities: AbilityDTO; // Player's abilities and their levels
	Level: number; // Player's level
}

export interface PlayerDTO extends PersistantPlayerData {
	Resources: ResourceDTO; // Player's resources like health, mana, etc.
}

export interface PlayerStateInterface {
	Level: Value<number>; // Reactive level value
	Abilities: AbilitiesState;
	Resources: ResourceStateMap;
}
