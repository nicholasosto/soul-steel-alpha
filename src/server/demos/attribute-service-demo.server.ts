/**
 * @file src/server/demos/attribute-service-demo.server.ts
 * @description Demo showing how to use the new AttributeService with @trembus/rpg-attributes
 */

import { Players } from "@rbxts/services";
import { AttributeService } from "server/server-services/attribute-service";

// Get the service instance
const attributeService = AttributeService.GetInstance();

Players.PlayerAdded.Connect((player) => {
	// player.CharacterAdded.Connect(() => {
	// 	// Wait a moment for the attribute service to initialize
	// 	task.wait(2);

	// 	// Get player's current attributes
	// 	const attributes = attributeService.getPlayerAttributes(player);
	// 	if (attributes) {
	// 		print(`${player.Name}'s initial attributes:`, attributes);
	// 	}

	// 	// Demo: Modify some attributes
	// 	task.wait(1);

	// 	// Increase vitality by 5 points
	// 	attributeService.modifyAttribute(player, "vitality", 5);
	// 	print(`Increased ${player.Name}'s vitality by 5`);

	// 	// Increase strength by 3 points
	// 	attributeService.modifyAttribute(player, "strength", 3);
	// 	print(`Increased ${player.Name}'s strength by 3`);

	// 	// Demo: Add equipment bonuses (new functionality from the package)
	// 	attributeService.modifyEquipmentBonus(player, "agility", 10);
	// 	print(`Added equipment bonus: +10 agility`);

	// 	// Demo: Add temporary effect bonuses
	// 	attributeService.modifyEffectBonus(player, "intellect", 5);
	// 	print(`Added temporary effect: +5 intellect`);

	// 	// Show final attributes
	// 	const finalAttributes = attributeService.getPlayerAttributes(player);
	// 	if (finalAttributes) {
	// 		print(`${player.Name}'s final attributes:`, finalAttributes);
	// 	}

	// 	// Demo: Access attribute metadata from the package
	// 	const vitalityMeta = attributeService.getAttributeMeta("vitality");
	// 	if (vitalityMeta) {
	// 		print(`Vitality info - Name: ${vitalityMeta.displayName}, Description: ${vitalityMeta.description}`);
	// 	}
	// });
});
