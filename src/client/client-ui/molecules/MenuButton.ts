import { New } from "@rbxts/fusion";
import { MenuButtonCatalog } from "shared/catalogs/menu-catalog";
import { MenuKey } from "shared/keys/menu-keys";
import { IconButton } from "../atoms";

export interface MenuButtonProps {
	menuKey: MenuKey;
}

export function MenuButton(props: MenuButtonProps): ImageButton {
	const catalog = MenuButtonCatalog[props.menuKey];
	warn(`Creating MenuButton for ${props.menuKey}`, catalog);
	const icon = catalog ? catalog.icon : "rbxassetid://defaultIcon"; // Fallback icon
	const displayName = catalog ? catalog.displayName : "Unknown Menu";

	const button = IconButton({
		Name: `${displayName}Button`,
		icon: icon,
	});

	return button;
}
