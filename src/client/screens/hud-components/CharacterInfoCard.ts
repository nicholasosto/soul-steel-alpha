import { CharacterInfoCard } from "@trembus/ss-fusion";
import { ResourcesCatalog, ResourceKey } from "shared";
import { PlayerStateInstance } from "client/states";
import { Players } from "@rbxts/services";
import { Computed } from "@rbxts/fusion";

const localPlayer = Players.LocalPlayer;
/* ---------------------------------- TEXT BOXES ---------------------------------- */
const playerResources = PlayerStateInstance.Resources;
const playerProgression = PlayerStateInstance.Progression;

const resourceLabel = (key: ResourceKey) => {
	const attributeLabel = ResourcesCatalog[key].displayName;
	const label = Computed(() => {
		const current = PlayerStateInstance.Resources[key].current.get() ?? 0;
		const max = PlayerStateInstance.Resources[key].max.get() ?? 0;
		return `${attributeLabel}: ${math.floor(current)} / ${math.floor(max)}`;
	});
	return label;
};

export const CharacterCardInstance = CharacterInfoCard({
	userId: localPlayer.UserId,
	bar1: {
		currentValue: playerResources.Health.current,
		maxValue: playerResources.Health.max,
		labelText: resourceLabel("Health"),
	},
	bar2: {
		currentValue: playerResources.Mana.current,
		maxValue: playerResources.Mana.max,
		labelText: resourceLabel("Mana"),
	},
	bar3: {
		currentValue: playerResources.Stamina.current,
		maxValue: playerResources.Stamina.max,
		labelText: resourceLabel("Stamina"),
	},
	levelBar: {
		currentValue: playerProgression.Experience,
		maxValue: playerProgression.NextLevelExperience,
		labelText: Computed(() => `Level: ${PlayerStateInstance.Progression.Level.get()}`),
	},
	nameLabel: localPlayer.Name,
});
