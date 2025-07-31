import { IconButton, IconButtonProps, ProgressBar } from "../atoms";
import Fusion, { Value, New, Computed, OnEvent, Children } from "@rbxts/fusion";
import { AbilityKey, ABILITY_KEYS } from "shared/keys";
import { AbilityCatalog } from "shared/catalogs";
import { UI_SIZES, UI_SPACING } from "shared/constants/ui-constants";
import { ImageConstants } from "shared/asset-ids";
import { VerticalLayout } from "../helpers";

export interface AbilityButtonProps extends Omit<IconButtonProps, "icon"> {
	abilityKey: AbilityKey;
	cooldownProgress?: Fusion.Value<number>; // 0-1, where 0 is ready and 1 is full cooldown
	onAbilityClick?: (abilityKey: AbilityKey) => void;
}

export function AbilityButton(props: AbilityButtonProps) {
	const ability = AbilityCatalog[props.abilityKey];
	const cooldownProgress = props.cooldownProgress ?? Value(0);
	const isOnCooldown = Computed(() => cooldownProgress.get() > 0);

	// Cooldown text showing remaining time
	const cooldownText = Computed(() => {
		const progress = cooldownProgress.get();
		if (progress <= 0) return "";
		const remainingTime = math.ceil(ability.cooldown * progress);
		return `${remainingTime}s`;
	});

	// Ability name label
	const abilityNameLabel = New("TextLabel")({
		Name: "AbilityNameLabel",
		Size: new UDim2(1, 0, 0, 20),
		Position: new UDim2(0, 0, 1, 2), // Below the icon button with 2px spacing
		AnchorPoint: new Vector2(0, 0),
		BackgroundTransparency: 1,
		Text: ability.displayName,
		TextColor3: Color3.fromRGB(255, 255, 255),
		TextScaled: true,
		TextStrokeTransparency: 0.5,
		TextStrokeColor3: Color3.fromRGB(0, 0, 0),
		Font: Enum.Font.GothamBold,
		ZIndex: 3,
	});

	// Cooldown progress bar using ProgressBar atom
	const cooldownProgressBar = ProgressBar({
		Name: "CooldownProgressBar",
		Size: new UDim2(1, 0, 0, 4),
		Position: new UDim2(0, 0, 1, 24), // Below ability name with spacing
		progress: cooldownProgress,
		fillColor: Color3.fromRGB(255, 100, 100), // Red cooldown color
		BackgroundColor3: Color3.fromRGB(40, 40, 40),
		BorderColor3: Color3.fromRGB(60, 60, 60),
		showLabel: true,
		labelText: cooldownText,
		labelColor: Color3.fromRGB(255, 255, 255),
	});

	// Main ability icon button
	const abilityIconButton = IconButton({
		Name: props.Name ?? `AbilityButton_${ability.abilityKey}`,
		Size: props.Size ?? UI_SIZES.ICON_ABILITY,
		Position: props.Position,
		AnchorPoint: props.AnchorPoint,
		icon: ability.icon,
		BackgroundImageId: ImageConstants.Ability.Background,
		onClick: () => {
			if (!isOnCooldown.get()) {
				props.onAbilityClick?.(props.abilityKey);
			}
		},
		ZIndex: 1,
	});

	// Default container size - ability icon + name + cooldown bar
	const defaultContainerSize = new UDim2(0, 60, 0, 88); // 60x88 for default ability button with extras

	// Container frame to hold all components
	const containerFrame = New("Frame")({
		Name: `AbilityButtonContainer_${ability.abilityKey}`,
		Size: defaultContainerSize,
		Position: props.Position ?? new UDim2(0, 0, 0, 0),
		AnchorPoint: props.AnchorPoint ?? new Vector2(0, 0),
		BackgroundTransparency: 1,
		ZIndex: props.ZIndex ?? 1,
		[Children]: {
			AbilityButton: abilityIconButton,
			AbilityNameLabel: abilityNameLabel,
			CooldownProgressBar: cooldownProgressBar,
		},
	});

	return containerFrame;
}
