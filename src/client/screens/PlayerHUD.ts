import { Children, New, OnEvent } from "@rbxts/fusion";
import { AbilityController } from "client/controllers";
import { CooldownButton, CharacterInfoCard } from "@trembus/ss-fusion";
import { AbilityCatalog } from "shared";

import { PlayerStateInstance } from "client/states";
import { Players } from "@rbxts/services";
const abilityController = AbilityController.getInstance();
const localPlayer = Players.LocalPlayer;
/* ---------------------------------- TEXT BOXES ---------------------------------- */
const playerResources = PlayerStateInstance.Resources;
const meleeMeta = AbilityCatalog["Melee"];
const characterInfoCard = CharacterInfoCard({
	userId: localPlayer.UserId,
	bar1: { currentValue: playerResources.Health.current, maxValue: playerResources.Health.max },
	bar2: { currentValue: playerResources.Mana.current, maxValue: playerResources.Mana.max },
	bar3: { currentValue: playerResources.Stamina.current, maxValue: playerResources.Stamina.max },
	levelBar: { currentValue: playerResources.Experience.current, maxValue: playerResources.Experience.max },
	nameLabel: localPlayer.Name,
});
export function createPlayerHUD(parent: Instance): ScreenGui {
	return New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		Enabled: true,
		DisplayOrder: 10,
		[Children]: {
			CharacterInfoCard: characterInfoCard,
		},
	});
}
