/// <reference types="@rbxts/types" />
import { Players } from "@rbxts/services";
import { SSEntity } from "shared/types/SSEntity";
import { AnimationConstants, AnimationKey } from "shared/asset-ids/animation-assets";
import { LoadCharacterAnimations } from "shared/helpers/animation-helpers";

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((characterModel) => {
		const ssEntity = characterModel as SSEntity;
		LoadCharacterAnimations(ssEntity, ["Punch_01", "Punch_02"] as AnimationKey[]);
		if (!ssEntity) {
			warn("INVALID: Character model is not a valid SSEntity for player:", player.Name);
			return;
		} else {
			warn("VALID: Character model is a valid SSEntity for player:", player.Name);
		}
	});
});
