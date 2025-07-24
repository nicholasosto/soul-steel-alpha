import { UserInputService } from "@rbxts/services";

UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
	if (gameProcessedEvent) {
		return;
	}

	if (input.UserInputType === Enum.UserInputType.Keyboard) {
		const keyCode = input.KeyCode;
		print(`Key pressed: ${keyCode.Name}`);
	} else if (input.UserInputType === Enum.UserInputType.MouseButton1) {
		print("Left mouse button clicked");
	} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
		print("Right mouse button clicked");
	}
});
