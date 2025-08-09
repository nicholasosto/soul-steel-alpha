import { New } from "@rbxts/fusion";
import { MenuButtonCatalog } from "shared/catalogs/menu-catalog";
import { MenuKey } from "shared/keys/menu-keys";
import { IconButton } from "@trembus/ss-fusion";

export interface MenuButtonProps {
	menuKey: MenuKey;
}

export function MenuButton(props: MenuButtonProps): ImageButton {
	const catalog = MenuButtonCatalog[props.menuKey];
	warn(`Creating MenuButton for ${props.menuKey}`, catalog);
	const icon = catalog ? catalog.icon : "rbxassetid://defaultIcon"; // Fallback icon
	const displayName = catalog ? catalog.displayName : "Unknown Menu";

	const button = IconButton({
		icon: icon,
		onClick: () => {
			// Menu button click handler can be added here
			print(`${displayName} menu clicked`);
		},
	});

	return button;
}
