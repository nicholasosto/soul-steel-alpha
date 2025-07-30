import { Players, UserInputService } from "@rbxts/services";
import { ABILITY_KEYS, AbilityKey } from "shared/keys";
import { AbilityRemotes, EffectRemotes } from "shared/network";

const Remotes = {
	ABILITY_ACTIVATE: AbilityRemotes.Client.Get("ABILITY_ACTIVATE"),
	RUN_EVENT: EffectRemotes.Client.Get("RUN_EVENT"),
};

function StartAbility(abilityKey: AbilityKey) {
	const success = Remotes.ABILITY_ACTIVATE.CallServerAsync(abilityKey)
		.andThen((result: boolean) => {
			if (result) {
				print(`Ability ${abilityKey} activated successfully!`);
			} else {
				warn(`Failed to activate ability ${abilityKey}`);
			}
		})
		.catch((err: string) => {
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
			case Enum.KeyCode.KeypadOne:
				Remotes.RUN_EVENT.CallServerAsync("Animal_Cast");
				break;
			case Enum.KeyCode.KeypadTwo:
				Remotes.RUN_EVENT.CallServerAsync("Frost_Cast");
				break;
			case Enum.KeyCode.KeypadThree:
				Remotes.RUN_EVENT.CallServerAsync("Shadow_Cast");
				break;
			case Enum.KeyCode.KeypadFour:
				Remotes.RUN_EVENT.CallServerAsync("Void_Cast");
				break;
			case Enum.KeyCode.KeypadFive:
				Remotes.RUN_EVENT.CallServerAsync("Shrine_Cast");
				break;
			default:
				print(`Key pressed: ${keyCode.Name}`);
		}
	} else if (input.UserInputType === Enum.UserInputType.MouseButton1) {
		print("Left mouse button clicked");
	} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
		print("Right mouse button clicked");
		const humanoid = Players.LocalPlayer.Character?.FindFirstChildOfClass("Humanoid");
		const RocketForce = new Instance("VectorForce");
		RocketForce.Name = "RocketForce";

		RocketForce.Parent = Players.LocalPlayer.Character?.PrimaryPart;
		RocketForce.Force = new Vector3(0, 4000, 0); // Example force vector
		RocketForce.Attachment0 = Players.LocalPlayer.Character?.PrimaryPart?.FindFirstChildWhichIsA("Attachment");
		RocketForce.RelativeTo = Enum.ActuatorRelativeTo.World;
		RocketForce.Enabled = true;
		task.delay(0.5, () => {
			if (RocketForce) {
				RocketForce.Enabled = false;
				RocketForce.Destroy();
			}
		});
	}
});
