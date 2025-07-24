import { UserInputService } from "@rbxts/services";
import { ABILITY_KEYS, AbilityKey } from "shared/keys";
import { AbilityRemotes } from "shared/network/ability-remotes";

function StartAbility(abilityKey: AbilityKey) {
	const success = AbilityRemotes.Client.Get("START_ABILITY")
		.CallServerAsync(abilityKey)
		.then((result) => {
			print(`Ability ${abilityKey} started: ${result}`);
		});
}

UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) {
		return;
	}

	if (input.UserInputType === Enum.UserInputType.Keyboard) {
		const keyCode = input.KeyCode;
		switch (keyCode) {
			case Enum.KeyCode.Q:
				StartAbility("Melee");
				break;
			case Enum.KeyCode.E:
				StartAbility("Ice-Rain");
				break;
			case Enum.KeyCode.R:
				StartAbility("Earthquake");
				break;
			default:
				print(`Key pressed: ${keyCode.Name}`);
		}
	} else if (input.UserInputType === Enum.UserInputType.MouseButton1) {
		print("Left mouse button clicked");
	} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
		print("Right mouse button clicked");
	}
});
