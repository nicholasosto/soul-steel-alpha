import {
	AbilityServiceInstance,
	AnimationServiceInstance,
	DataServiceInstance,
	HumanoidMonitorServiceInstance,
	MessageServiceInstance,
	ResourceServiceInstance,
	UnifiedNPCServiceInstance,
	RunLavaParts,
} from "./services";
import { Players } from "@rbxts/services";
import { AbilityKey } from "shared";
import { SSEntity } from "shared/types";

const Services = {
	AbilityService: AbilityServiceInstance,
	AnimationService: AnimationServiceInstance,
	Collection_Service: RunLavaParts(),
	DataService: DataServiceInstance,
	HumanoidMonitorService: HumanoidMonitorServiceInstance, // Use signal-based approach
	MessageService: MessageServiceInstance,
	ResourceService: ResourceServiceInstance,
	UnifiedNPCService: UnifiedNPCServiceInstance,
};

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		const entity = character as SSEntity; // Assuming SSEntity is the type for characters
		const testAbilityKeys: AbilityKey[] = ["Melee", "Ice-Rain"]; // Example ability keys
		print(`Player ${player.Name} added character ${entity.Name}. Registering abilities...`);
		Services.AbilityService.RegisterModel(entity, testAbilityKeys); // Register the character with the AbilityService
		//	Services.ResourceService.initializeEntityHealth(entity); // Initialize health for the entity
	});
});

warn("Services initialized:", Services);
Players.GetPlayers().forEach((player) => {
	const character = player.Character || player.CharacterAdded.Wait()[0];
	MessageServiceInstance.SendInfoToPlayer(player, `Welcome ${player.Name}! Your character is ready.`);
});
