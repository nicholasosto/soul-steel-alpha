import Fusion, { Children, Computed, New, OnEvent, Value } from "@rbxts/fusion";
import { ProgressBar } from "@trembus/ss-fusion";
import { AbilityKey, AbilityCatalog } from "shared";
import { AbilityStateInstance } from "client/states";

export interface AbilityButtonProps extends Fusion.PropertyTable<Frame> {
	abilityKey: AbilityKey;
	icon: string;
	cooldown: number; // seconds
	labelText?: Fusion.Value<string> | Fusion.Computed<string>;
	onActivate?: () => void;
}

export function AbilityButton(props: AbilityButtonProps): Frame {
	const progressFraction = AbilityStateInstance.getProgressValue(props.abilityKey);
	const remainingSeconds = Computed(() => props.cooldown * progressFraction.get());
	const remainingSecondsValue = Value(0);
	// Keep Value in sync with Computed for components that require Value<number>
	const _sync = Computed(() => {
		remainingSecondsValue.set(remainingSeconds.get());
		return 0;
	});
	const canClick = Computed(() => remainingSeconds.get() <= 0);

	const size = new UDim2(0, 72, 0, 90);
	const buttonSize = new UDim2(1, 0, 0, 64);
	const barHeight = 10;

	const IconButton = New("ImageButton")({
		Size: buttonSize,
		BackgroundColor3: Computed(() => (canClick.get() ? Color3.fromRGB(60, 60, 60) : Color3.fromRGB(40, 40, 40))),
		BackgroundTransparency: 0.1,
		AutoButtonColor: true,
		ImageTransparency: 1,
		[Children]: {
			Icon: New("ImageLabel")({
				Size: UDim2.fromScale(0.8, 0.8),
				Position: UDim2.fromScale(0.5, 0.5),
				AnchorPoint: new Vector2(0.5, 0.5),
				BackgroundTransparency: 1,
				Image: props.icon,
				ImageTransparency: Computed(() => (canClick.get() ? 0 : 0.3)),
			}),
		},
		[OnEvent("Activated")]: () => {
			if (canClick.get()) props.onActivate?.();
		},
	});

	const CooldownBar = ProgressBar({
		Size: new UDim2(1, 0, 0, barHeight),
		Position: new UDim2(0, 0, 1, -barHeight - 2),
		currentValue: remainingSecondsValue,
		maxValue: Value(props.cooldown),
		fillColor: Color3.fromRGB(180, 220, 255),
		showLabel: true,
		labelText: props.labelText,
	});

	return New("Frame")({
		Size: props.Size ?? size,
		Position: props.Position,
		AnchorPoint: props.AnchorPoint,
		LayoutOrder: props.LayoutOrder,
		BackgroundTransparency: 1,
		[Children]: {
			IconButton,
			CooldownBar,
		},
	});
}
