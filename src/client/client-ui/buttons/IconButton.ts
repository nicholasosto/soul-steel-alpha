import Fusion, { Value, Children, New, Computed, OnEvent, Observer } from "@rbxts/fusion";
import { ImageConstants, MenuButtonImageMap } from "shared/asset-ids";
import { UI_SIZES } from "shared/constants/ui-constants";

// Example IconButton component function
export interface IconButtonProps extends Fusion.PropertyTable<ImageButton> {
    icon: string;
    BackgroundImageId?: string;
    isSelected?: Value<boolean>;
    isHovered?: Value<boolean>;
    onClick?: () => void;
}

export function IconButton(props: IconButtonProps) {
	const isHovered = props.isHovered ?? Value(false);
    const isSelected = props.isSelected ?? Value(false);

    

    /* Background Image for IconButtons */
    const IconImage = New("ImageLabel")({
        Name: "IconImage",
        Size: UDim2.fromScale(0.75, 0.75),
        AnchorPoint: new Vector2(0.5, 0.5),
        Position: UDim2.fromScale(0.5, 0.5),
        Image: props.icon,
        ImageColor3: Computed(() => (isHovered.get() ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(200, 200, 200))),
        BackgroundTransparency: 1,
    });

    /* Main Button Component */
    const buttonComponent =  New("ImageButton")({
        Name: props.Name || "IconButton",
		Size: props.Size ?? UI_SIZES.ICON_SMALL, // Default size, can be overridden
		Image: props.BackgroundImageId ?? ImageConstants.IconButtonBackground,
		BackgroundTransparency: Computed(() => {
            if( isSelected.get() ) {
                return 0 // Semi-transparent when selected
            }
            else if (isHovered.get()) {
                return 0.5 // Semi-transparent when hovered
            } else {
                return 1; // Fully opaque otherwise
            }
        }),
        BackgroundColor3: Computed(() => (isSelected.get() ? Color3.fromRGB(46, 209, 237) : Color3.fromRGB(217, 227, 71))),
        [Children]: {
            IconImage: IconImage,
        },
		[OnEvent("MouseEnter")]: () => isHovered.set(true),
		[OnEvent("MouseLeave")]: () => isHovered.set(false),
		[OnEvent("Activated")]: () => {
            isSelected.set(!isSelected.get());
            props.onClick?.()
        }
	});

    Observer(isSelected).onChange(() => {
        print("Observer: IconButton selected state changed to", isSelected.get());
        buttonComponent.SetAttribute("IsSelected", isSelected.get());
        
    });
    return buttonComponent;
}

export const TestButtonProps = {
    MenuItem: {
        icon: MenuButtonImageMap.Settings,
        Size: UI_SIZES.ICON_LARGE,
        onClick: () => print("Settings clicked"),
    }
}
