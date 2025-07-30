import { ImageConstants } from "shared/asset-ids";
import { HorizontalButtonBar } from "./ButtonBar";
import { IconButton } from "client/client-ui/atoms";
import { AbilityKey } from "shared/keys";
import { ServerFunction } from "client/event-dispatcher";
import { UI_SIZES } from "shared/constants/ui-constants";
import { AbilityCatalog } from "shared/catalogs";

interface AbilityBarProps {
	keys: Array<AbilityKey>;
}

export function AbilityButtonBar(props: AbilityBarProps) {
	const buttons = props.keys.map((ability) => {
		const abilityCatalogItem = AbilityCatalog[ability];
		return IconButton({
			Name: `${ability}Button`,
			icon: abilityCatalogItem.icon,
			Size: UI_SIZES.ICON_ABILITY,
			onClick: () => {
				print(`${ability} button clicked`);
				ServerFunction("ABILITY_ACTIVATE", ability); // Call server function to activate the ability
			},
		});
	});

	return HorizontalButtonBar({
		buttons: buttons,
		Position: new UDim2(0.5, 0, 1, -50),
	});
}
