import Fusion, { Children, Computed, New, PropertyTable } from "@rbxts/fusion";
import { MessageState, MessageStateInstance } from "client/states/message-state";

export const MessageBox = (messageState: MessageState) => {
	const Label = New("TextLabel")({
		Name: "MessageLabel",
		Size: new UDim2(1, 0, 1, 0),
		BackgroundTransparency: 1,
		Text: Computed(() => messageState.message.get()),
		TextColor3: Computed(() => {
			switch (messageState.messageType.get()) {
				case "error":
					return Color3.fromRGB(255, 0, 0);
				case "warning":
					return Color3.fromRGB(255, 165, 0);
				case "info":
					return Color3.fromRGB(0, 0, 255);
				default:
					return Color3.fromRGB(255, 255, 255);
			}
		}),
		TextScaled: true,
		TextWrapped: true,
		TextXAlignment: Enum.TextXAlignment.Center,
		TextYAlignment: Enum.TextYAlignment.Center,
	});
	const messageFrame = New("Frame")({
		Name: "MessageBox",
		Size: new UDim2(0.3, 0, 0.1, 0),
		Position: new UDim2(0.35, 0, 0.45, 0),
		BackgroundColor3: Color3.fromRGB(50, 50, 50),
		BorderSizePixel: 0,
		Visible: Computed(() => messageState.isVisible.get()),
		[Children]: {
			Label,
		},
	});

	return messageFrame;
};
