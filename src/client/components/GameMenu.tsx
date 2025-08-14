import Fusion from "@rbxts/fusion";
const { New, Children, Value, OnEvent } = Fusion as typeof import("@rbxts/fusion");

export interface GameMenuProps {
	onPlay: () => void;
	disabled?: boolean;
}

export function GameMenu(props: GameMenuProps): Frame {
	const disabled = Value(props.disabled ?? false);
	return New("Frame")({
		Name: "GameMenu",
		Size: UDim2.fromScale(1, 1),
		BackgroundColor3: new Color3(0, 0, 0),
		BackgroundTransparency: 0.25,
		[Children]: {
			PlayButton: New("TextButton")({
				Name: "PlayButton",
				Size: UDim2.fromOffset(220, 64),
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.6),
				Text: "Play",
				TextScaled: true,
				BackgroundColor3: new Color3(0.2, 0.6, 0.2),
				AutoButtonColor: true,
				[OnEvent("Activated")]: () => {
					if (disabled.get()) return;
					props.onPlay();
				},
			}),
			Title: New("TextLabel")({
				Size: UDim2.fromScale(1, 0),
				Position: UDim2.fromScale(0, 0.4),
				BackgroundTransparency: 1,
				Text: "Soul Steel Alpha",
				TextColor3: new Color3(1, 1, 1),
				TextScaled: true,
				Font: Enum.Font.GothamBold,
			}),
		},
	});
}
