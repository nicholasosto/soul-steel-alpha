import { New, Children } from "@rbxts/fusion";

export interface LoadingScreenProps {
	message?: string;
}

export function LoadingScreen(props?: LoadingScreenProps): Frame {
	const message = props?.message ?? "Loading...";
	return New("Frame")({
		Name: "LoadingScreen",
		Size: UDim2.fromScale(1, 1),
		BackgroundColor3: new Color3(0, 0, 0),
		BackgroundTransparency: 0.1,
		[Children]: {
			Label: New("TextLabel")({
				Size: UDim2.fromScale(1, 0),
				Position: UDim2.fromScale(0, 0.45),
				BackgroundTransparency: 1,
				Text: message,
				TextColor3: new Color3(1, 1, 1),
				TextScaled: true,
				Font: Enum.Font.GothamBold,
			}),
			Spinner: New("TextLabel")({
				Size: UDim2.fromScale(1, 0),
				Position: UDim2.fromScale(0, 0.52),
				BackgroundTransparency: 1,
				Text: "⏳",
				TextColor3: new Color3(1, 1, 1),
				TextScaled: true,
				Font: Enum.Font.GothamBold,
			}),
		},
	});
}
