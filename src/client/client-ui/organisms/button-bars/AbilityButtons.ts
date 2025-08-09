/**
 * @file AbilityButtons.ts
 * @description Ability button bar using ss-fusion components (consolidated from EnhancedAbilityButtons)
 */

import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { AbilityController } from "client/controllers";
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { UI_SIZES } from "shared/constants/ui-constants";
import { CooldownButton, Label } from "@trembus/ss-fusion";
import { HorizontalLayout, makePadding } from "../../helpers";

interface AbilityButtonPropsInternal {
	abilityKey: AbilityKey;
	cooldownProgress?: Fusion.Value<number>;
	onAbilityClick?: (abilityKey: AbilityKey) => void;
	showLabel?: boolean;
	variant?: "compact" | "standard" | "large";
}

interface AbilityBarProps {
	keys: Array<AbilityKey>;
	variant?: "compact" | "standard" | "large";
	showLabels?: boolean;
	position?: UDim2;
	spacing?: number;
	backgroundColor?: Color3;
	backgroundTransparency?: number;
}

function AbilityButtonInternal(props: AbilityButtonPropsInternal): Frame {
	const ability = AbilityCatalog[props.abilityKey];
	const variant = props.variant ?? "standard";

	const buttonSize =
		variant === "compact" ? UI_SIZES.ICON_SMALL : variant === "large" ? UI_SIZES.ICON_LARGE : UI_SIZES.ICON_ABILITY;

	const containerHeight = props.showLabel !== false ? buttonSize.Y.Offset + 24 : buttonSize.Y.Offset;

	const abilityButton = CooldownButton({
		Size: buttonSize,
		icon: ability.icon,
		cooldown: ability.cooldown,
		onClick: () => props.onAbilityClick?.(props.abilityKey),
	});

	const abilityLabel =
		props.showLabel !== false
			? Label({
					Size: new UDim2(1, 0, 0, 20),
					Position: new UDim2(0, 0, 1, 2),
					AnchorPoint: new Vector2(0, 0),
					text: ability.displayName,
					variant: "caption",
					TextColor3: Color3.fromRGB(255, 255, 255),
					TextStrokeColor3: Color3.fromRGB(0, 0, 0),
					TextStrokeTransparency: 0.5,
					TextScaled: true,
					Font: Enum.Font.GothamBold,
				})
			: undefined;

	return New("Frame")({
		Name: `AbilityButton_${props.abilityKey}`,
		Size: UDim2.fromOffset(buttonSize.X.Offset, containerHeight),
		BackgroundTransparency: 1,
		[Children]: abilityLabel
			? {
					Button: abilityButton,
					Label: abilityLabel,
				}
			: {
					Button: abilityButton,
				},
	});
}

export function AbilityButtonBar(props: AbilityBarProps): Frame {
	const abilityController = AbilityController.getInstance();
	const variant = props.variant ?? "standard";
	const spacing = props.spacing ?? 8;
	const showLabels = props.showLabels ?? true;

	const buttons = props.keys.map((abilityKey) =>
		AbilityButtonInternal({
			abilityKey,
			onAbilityClick: (key) => abilityController.activateAbility(key),
			showLabel: showLabels,
			variant,
		}),
	);

	const buttonWidth = variant === "compact" ? 50 : variant === "large" ? 90 : 60;
	const buttonHeight = showLabels
		? variant === "compact"
			? 74
			: variant === "large"
				? 114
				: 84
		: variant === "compact"
			? 50
			: variant === "large"
				? 90
				: 60;

	const barWidth = buttons.size() * buttonWidth + (buttons.size() - 1) * spacing + 16;
	const barHeight = buttonHeight + 16;

	return New("Frame")({
		Name: "AbilityButtonBar",
		Size: UDim2.fromOffset(barWidth, barHeight),
		Position: props.position ?? new UDim2(0.5, -barWidth / 2, 1, -barHeight - 20),
		AnchorPoint: new Vector2(0.5, 1),
		BackgroundColor3: props.backgroundColor ?? Color3.fromRGB(25, 25, 25),
		BackgroundTransparency: props.backgroundTransparency ?? 0.3,
		BorderSizePixel: 0,
		[Children]: {
			Corner: New("UICorner")({ CornerRadius: new UDim(0, 8) }),
			Stroke: New("UIStroke")({ Color: Color3.fromRGB(100, 100, 100), Transparency: 0.7, Thickness: 1 }),
			ButtonContainer: New("Frame")({
				Name: "ButtonContainer",
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				[Children]: [...buttons, makePadding(8), HorizontalLayout(spacing)],
			}),
		},
	});
}

export function CompactAbilityButtonBar(props: Omit<AbilityBarProps, "variant" | "showLabels">): Frame {
	return AbilityButtonBar({ ...props, variant: "compact", showLabels: false, spacing: 4 });
}

export function LargeAbilityButtonBar(props: Omit<AbilityBarProps, "variant">): Frame {
	return AbilityButtonBar({ ...props, variant: "large", spacing: 12 });
}

export function AbilityButtonBarWithProgress(props: { keys: Array<AbilityKey> }): Frame {
	return AbilityButtonBar({
		keys: props.keys,
		variant: "standard",
		showLabels: true,
		backgroundColor: Color3.fromRGB(20, 30, 40),
		backgroundTransparency: 0.2,
	});
}
