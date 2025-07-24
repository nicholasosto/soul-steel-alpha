import { AbilityServiceInstance } from "./ability-service";
import { Players } from "@rbxts/services";
import { AbilityKey } from "shared/keys";
import { SSEntity } from "shared/types";

const Services = {
	AbilityService: AbilityServiceInstance,
};

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		const entity = character as SSEntity; // Assuming SSEntity is the type for characters
		const testAbilityKeys: AbilityKey[] = ["Melee", "Ice-Rain"]; // Example ability keys
		print(`Player ${player.Name} added character ${entity.Name}. Registering abilities...`);
		Services.AbilityService.RegisterModel(entity, testAbilityKeys); // Register the character with the AbilityService
	});
});

warn("Services initialized:", Services);
