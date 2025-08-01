import Fusion, { Observer, Value } from "@rbxts/fusion";
import { Players, UserInputService } from "@rbxts/services";
import { ForceCatalog } from "shared/catalogs";
import { ABILITY_KEYS, AbilityKey } from "shared/keys";
import { AbilityRemotes, EffectRemotes } from "shared/network";
import { SSEntity } from "shared/types";

const LocalPlayer = Players.LocalPlayer;

const RunningState = Value(false);
const RunningObserver = Observer(RunningState);

RunningObserver.onChange(() => {
	const humanoid = LocalPlayer.Character?.FindFirstChildOfClass("Humanoid");
	if (!humanoid) return;
	if (RunningState.get()) {
		humanoid.WalkSpeed = 24; // Increased speed when running
	} else {
		humanoid.WalkSpeed = 16; // Default speed when not running
	}
});

const Remotes = {
	ABILITY_ACTIVATE: AbilityRemotes.Client.Get("ABILITY_ACTIVATE"),
	RUN_EVENT: EffectRemotes.Client.Get("RUN_EVENT"),
};

function StartAbility(abilityKey: AbilityKey) {
	const success = Remotes.ABILITY_ACTIVATE.CallServerAsync(abilityKey);
	return success;
}

UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) {
		return;
	}

	if (input.UserInputType === Enum.UserInputType.Keyboard) {
		const keyCode = input.KeyCode;
		switch (keyCode) {
			case Enum.KeyCode.LeftShift:
				RunningState.set(true);
				break;
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
	}
});

UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) {
		return;
	}

	if (input.UserInputType === Enum.UserInputType.Keyboard) {
		const keyCode = input.KeyCode;
		if (keyCode === Enum.KeyCode.LeftShift) {
			RunningState.set(false);
		}
	}
});

UserInputService.JumpRequest.Connect(() => {
	const character = Players.LocalPlayer.Character as SSEntity;
	if (!character) {
		return;
	}
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	const currentHumanoidState = humanoid?.GetState();
	if (currentHumanoidState === undefined) {
		return;
	}
	if (
		currentHumanoidState === Enum.HumanoidStateType.Jumping ||
		currentHumanoidState === Enum.HumanoidStateType.FallingDown ||
		currentHumanoidState === Enum.HumanoidStateType.Freefall
	) {
		const negativeHeight = humanoid?.GetMoveVelocity().Y; // Reset vertical velocity to prevent double jump
		const force = ForceCatalog["JumpForce"].RunForce(character.HumanoidRootPart);
		if (!force || negativeHeight === undefined) {
			return;
		}
		force?.Force.add(new Vector3(0, -1 * negativeHeight, 0));
		task.delay(ForceCatalog["JumpForce"].duration, () => {
			force?.Destroy();
		});
	}
});
