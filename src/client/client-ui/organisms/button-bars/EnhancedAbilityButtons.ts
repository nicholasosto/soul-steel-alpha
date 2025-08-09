/**
 * @file Enhanced Ability Button Bar
 * @description Modern ability button bar leveraging ss-fusion components for better UX
 * @author GitHub Copilot
 */

import Fusion, { Children, Computed, New, Value } from "@rbxts/fusion";
import { AbilityController } from "client/controllers";
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { UI_SIZES } from "shared/constants/ui-constants";
import { CooldownButton, IconButton, Label, ProgressBar } from "@trembus/ss-fusion";
import { HorizontalLayout, makePadding } from "../../helpers";

/**
 * Enhanced Ability Button with improved styling and ss-fusion integration
 */
interface EnhancedAbilityButtonProps {
	abilityKey: AbilityKey;
	cooldownProgress?: Fusion.Value<number>;
	onAbilityClick?: (abilityKey: AbilityKey) => void;
	showLabel?: boolean;
	variant?: "compact" | "standard" | "large";
}

/**
 * Enhanced Ability Button Bar Props
 */
interface EnhancedAbilityBarProps {
	keys: Array<AbilityKey>;
	variant?: "compact" | "standard" | "large";
	showLabels?: boolean;
	position?: UDim2;
	spacing?: number;
	backgroundColor?: Color3;
	backgroundTransparency?: number;
}

/**
 * Creates an enhanced ability button with better ss-fusion integration
 */
function EnhancedAbilityButton(props: EnhancedAbilityButtonProps): Frame {
	const ability = AbilityCatalog[props.abilityKey];
	const cooldownProgress = props.cooldownProgress ?? Value(0);
	const variant = props.variant ?? "standard";

	// Size based on variant
	const buttonSize =
		variant === "compact" ? UI_SIZES.ICON_SMALL : variant === "large" ? UI_SIZES.ICON_LARGE : UI_SIZES.ICON_ABILITY;

	// Calculate container height (button + label if enabled)
	const containerHeight =
		props.showLabel !== false
			? buttonSize.Y.Offset + 24 // Add space for label
			: buttonSize.Y.Offset;

	// Main ability button using ss-fusion CooldownButton
	const abilityButton = CooldownButton({
		Size: buttonSize,
		icon: ability.icon,
		cooldown: ability.cooldown,
		onClick: () => {
			if (props.onAbilityClick) {
				props.onAbilityClick(props.abilityKey);
			}
		},
	});

	// Ability name label using ss-fusion Label
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

	// Container frame
	return New("Frame")({
		Name: `EnhancedAbilityButton_${props.abilityKey}`,
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

/**
 * Enhanced Ability Button Bar with modern styling and features
 */
export function EnhancedAbilityButtonBar(props: EnhancedAbilityBarProps): Frame {
	const abilityController = AbilityController.getInstance();
	const variant = props.variant ?? "standard";
	const spacing = props.spacing ?? 8;
	const showLabels = props.showLabels ?? true;

	// Create enhanced ability buttons
	const buttons = props.keys.map((abilityKey) => {
		return EnhancedAbilityButton({
			abilityKey: abilityKey,
			onAbilityClick: (key) => {
				print(`Enhanced: ${key} button clicked`);
				abilityController.activateAbility(key);
			},
			showLabel: showLabels,
			variant: variant,
		});
	});

	// Calculate bar dimensions
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

	const barWidth = buttons.size() * buttonWidth + (buttons.size() - 1) * spacing + 16; // 8px padding each side
	const barHeight = buttonHeight + 16; // 8px padding top/bottom

	// Enhanced container with ss-fusion styling
	return New("Frame")({
		Name: "EnhancedAbilityButtonBar",
		Size: UDim2.fromOffset(barWidth, barHeight),
		Position: props.position ?? new UDim2(0.5, -barWidth / 2, 1, -barHeight - 20),
		AnchorPoint: new Vector2(0.5, 1),
		BackgroundColor3: props.backgroundColor ?? Color3.fromRGB(25, 25, 25),
		BackgroundTransparency: props.backgroundTransparency ?? 0.3,
		BorderSizePixel: 0,
		[Children]: {
			// Background styling using ss-fusion principles
			Corner: New("UICorner")({
				CornerRadius: new UDim(0, 8),
			}),

			// Subtle border glow
			Stroke: New("UIStroke")({
				Color: Color3.fromRGB(100, 100, 100),
				Transparency: 0.7,
				Thickness: 1,
			}),

			// Button container
			ButtonContainer: New("Frame")({
				Name: "ButtonContainer",
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				[Children]: [
					...buttons,
					makePadding(8), // Consistent padding
					HorizontalLayout(spacing), // Configurable spacing
				],
			}),
		},
	});
}

/**
 * Compact variant for minimal space usage
 */
export function CompactAbilityButtonBar(props: Omit<EnhancedAbilityBarProps, "variant" | "showLabels">): Frame {
	return EnhancedAbilityButtonBar({
		...props,
		variant: "compact",
		showLabels: false,
		spacing: 4,
	});
}

/**
 * Large variant for enhanced visibility
 */
export function LargeAbilityButtonBar(props: Omit<EnhancedAbilityBarProps, "variant">): Frame {
	return EnhancedAbilityButtonBar({
		...props,
		variant: "large",
		spacing: 12,
	});
}

/**
 * Quick setup with ability progress tracking (example integration)
 */
export function AbilityButtonBarWithProgress(props: { keys: Array<AbilityKey> }): Frame {
	// This would integrate with your cooldown system
	// For now, showing the enhanced structure

	return EnhancedAbilityButtonBar({
		keys: props.keys,
		variant: "standard",
		showLabels: true,
		backgroundColor: Color3.fromRGB(20, 30, 40),
		backgroundTransparency: 0.2,
	});
}
