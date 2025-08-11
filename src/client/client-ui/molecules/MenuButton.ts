// No Fusion New needed here; using ss-fusion IconButton directly
import { MenuButtonCatalog } from "shared/catalogs/menu-catalog";
import { MenuKey } from "shared/keys/menu-keys";
import { IconButton } from "@trembus/ss-fusion";
import { ImageConstants } from "shared";

export interface MenuButtonProps {
	menuKey: MenuKey;
	onClick?: () => void;
}

export function MenuButton(props: MenuButtonProps): ImageButton {
	const catalog = MenuButtonCatalog[props.menuKey];
	warn(`Creating MenuButton for ${props.menuKey}`, catalog);
	const icon = catalog ? catalog.icon : "rbxassetid://defaultIcon"; // Fallback icon
	const displayName = catalog ? catalog.displayName : "Unknown Menu";

	const button = IconButton({
		OnMouseEnter: () => {
			print(`${displayName} menu hovered`);
		},
		backgroundImage: ImageConstants.IconButtonBackground,
		toggleable: true,
		icon: icon,
		onClick: () => {
			if (props.onClick) {
				props.onClick();
			} else {
				// Default menu button click handler
				print(`${displayName} menu clicked`);
			}
		},
	});

	return button;
}
