import { ResourceDTO, ResourceStateMap } from "shared/catalogs/resources-catalog";
import { AttributeDTO, AttributesState } from "@trembus/rpg-attributes";
import { AbilitiesState, AbilityDTO } from "shared/catalogs";
import { Value } from "@rbxts/fusion";

export interface PlayerData {
	level: number; // Player's level
	abilities: AbilityDTO;
	attributes: AttributeDTO; // Strength, Agility, Intelligence, etc.
	resources: ResourceDTO; // Health, Mana, Stamina, Experience, etc.
}

export interface PlayerStateInterface {
	level: Value<number>; // Reactive level value
	abilities: AbilitiesState;
	attributes: AttributesState;
	resources: ResourceStateMap;
}
