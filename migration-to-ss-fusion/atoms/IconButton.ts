/**
 * @file IconButton.ts
 * @module IconButton
 * @layer Client/UI/Atoms
 * @description Enhanced icon button component with selection states, hover effects, and configurable styling.
 *
 * This button supports both simple icon display and advanced interaction states including
 * selection tracking, hover effects, and customizable background images.
 *
 * @example
 * // Simple icon button
 * const button = IconButton({
 *   icon: "rbxassetid://123456789",
 *   onClick: () => print("Clicked!")
 * });
 *
 * @example
 * // Styled button with background
 * const styledButton = IconButton({
 *   icon: "rbxassetid://123456789",
 *   backgroundImage: "rbxassetid://987654321",
 *   size: "large",
 *   onClick: handleClick
 * });
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import Fusion, { Value, Children, New, Computed, OnEvent } from "@rbxts/fusion";

export interface IconButtonProps extends Fusion.PropertyTable<ImageButton> {
	/** Icon asset ID to display */
	icon: string;

	/** Optional background image asset ID */
	backgroundImage?: string;

	/** Button size variant */
	size?: "small" | "medium" | "large";

	/** Whether the button starts selected */
	initialSelected?: boolean;

	/** Click handler */
	onClick?: () => void;

	/** Selection change handler */
	onSelectionChanged?: (selected: boolean) => void;
}

export function IconButton(props: IconButtonProps) {
	const isSelected = Value(props.initialSelected ?? false);
	const isHovered = Value(false);

	// Size configuration
	const sizeConfig =
		props.size === "large"
			? UDim2.fromOffset(64, 64)
			: props.size === "small"
				? UDim2.fromOffset(32, 32)
				: UDim2.fromOffset(48, 48); // medium default

	// Default background image (simple gray button)
	const defaultBackground = "rbxasset://textures/ui/GuiImagePlaceholder.png";

	/* Icon Image */
	const IconImage = New("ImageLabel")({
		Name: "IconImage",
		Size: UDim2.fromScale(0.75, 0.75),
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: UDim2.fromScale(0.5, 0.5),
		Image: props.icon,
		ImageColor3: Computed(() => (isHovered.get() ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(200, 200, 200))),
		BackgroundTransparency: 1,
		ZIndex: 2,
	});

	/* Main Button Component */
	const buttonComponent = New("ImageButton")({
		Name: props.Name ?? "IconButton",
		Size: props.Size ?? sizeConfig,
		Image: props.backgroundImage ?? defaultBackground,
		BackgroundTransparency: Computed(() => {
			if (isSelected.get()) {
				return 0; // Opaque when selected
			} else if (isHovered.get()) {
				return 0.5; // Semi-transparent when hovered
			} else {
				return 1; // Fully transparent by default
			}
		}),
		BackgroundColor3: Computed(() =>
			isSelected.get() ? Color3.fromRGB(46, 209, 237) : Color3.fromRGB(217, 227, 71),
		),
		[Children]: {
			IconImage: IconImage,
			AspectRatioConstraint: New("UIAspectRatioConstraint")({
				AspectRatio: 1,
			}),
		},
		[OnEvent("MouseEnter")]: () => isHovered.set(true),
		[OnEvent("MouseLeave")]: () => isHovered.set(false),
		[OnEvent("Activated")]: () => {
			const newSelected = !isSelected.get();
			isSelected.set(newSelected);
			props.onSelectionChanged?.(newSelected);
			props.onClick?.();
		},
	});

	return buttonComponent;
}
