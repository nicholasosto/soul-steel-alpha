import { CharacterInfoCard } from "@trembus/ss-fusion";

import { PlayerStateInstance } from "client/states";
import { Players } from "@rbxts/services";

const localPlayer = Players.LocalPlayer;
/* ---------------------------------- TEXT BOXES ---------------------------------- */
const playerResources = PlayerStateInstance.Resources;

export const CharacterCardInstance = CharacterInfoCard({
	userId: localPlayer.UserId,
	bar1: { currentValue: playerResources.Health.current, maxValue: playerResources.Health.max },
	bar2: { currentValue: playerResources.Mana.current, maxValue: playerResources.Mana.max },
	bar3: { currentValue: playerResources.Stamina.current, maxValue: playerResources.Stamina.max },
	levelBar: { currentValue: playerResources.Experience.current, maxValue: playerResources.Experience.max },
	nameLabel: localPlayer.Name,
});
