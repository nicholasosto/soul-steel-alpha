import { UserInputService } from "@rbxts/services";
import { ABILITY_KEYS, AbilityKey } from "shared/keys";
import { AbilityRemotes } from "shared/network/ability-remotes";

function StartAbility(abilityKey: AbilityKey) {
	const success = AbilityRemotes.Client.Get("ABILITY_ACTIVATE").CallServerAsync(abilityKey).andThen((result: boolean) => {
		if (result) {
			print(`Ability ${abilityKey} activated successfully!`);
		} else {
			warn(`Failed to activate ability ${abilityKey}`);
		}
	}).catch((err: string) => {
		warn(`,error activating ability ${abilityKey}: ${err}`);
	});
	return success;
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
