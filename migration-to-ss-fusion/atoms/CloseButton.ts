import Fusion, { New, OnEvent, Value, Computed } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";

export interface CloseButtonProps extends Fusion.PropertyTable<ImageButton> {
	onClick?: () => void;
	size?: UDim2;
	tooltip?: string;
}

/**
 * CloseButton - minimalist image-only close control using project image assets
 * - Hover highlight
 * - Click calls onClick
 * - Keeps styling simple for transplant to ss-fusion
 */
export function CloseButton(props: CloseButtonProps): ImageButton {
	const isHovered = Value(false);

	return New("ImageButton")({
		Name: props.Name ?? "CloseButton",
		Size: props.Size ?? props.size ?? new UDim2(0, 35, 0, 35),
		Position: props.Position ?? new UDim2(1, 0, 0, 0),
		AnchorPoint: props.AnchorPoint ?? new Vector2(0.5, 0.5),
		BackgroundTransparency: 1,
		AutoButtonColor: false,
		Image: ImageConstants.Control.Close,
		ImageColor3: Computed(() => (isHovered.get() ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(220, 220, 220))),
		ImageTransparency: 0,
		ZIndex: props.ZIndex,
		[OnEvent("MouseEnter")]: () => isHovered.set(true),
		[OnEvent("MouseLeave")]: () => isHovered.set(false),
		[OnEvent("Activated")]: () => props.onClick?.(),
	});
}
