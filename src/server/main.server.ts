/// <reference types="@rbxts/types" />
import { Players } from "@rbxts/services";
import { AnimationKey } from "shared/asset-ids/animation-assets";
import { LoadCharacterAnimations } from "shared/helpers/animation-helpers";
import { validateSSEntity } from "shared/helpers/type-guards";

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((characterModel) => {
		const ssEntity = validateSSEntity(characterModel, player.Name);
		if (!ssEntity) {
			warn("INVALID: Character model is not a valid SSEntity for player:", player.Name);
			return;
		}

		// Load animations for the validated entity
		LoadCharacterAnimations(ssEntity, ["Punch_01", "Punch_02"] as AnimationKey[]);
		warn("VALID: Character model is a valid SSEntity for player:", player.Name);
	});
});
