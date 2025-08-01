import { ImageConstants } from "shared/asset-ids";
import { HorizontalButtonBar } from "./ButtonBar";
import { IconButton } from "client/client-ui/atoms";
import { AbilityKey } from "shared/keys";
import { ServerFunction } from "client/event-dispatcher";
import { UI_SIZES } from "shared/constants/ui-constants";
import { AbilityCatalog } from "shared/catalogs";
import { AbilityButton } from "client/client-ui/molecules";
import Fusion from "@rbxts/fusion";

interface AbilityBarProps {
	keys: Array<AbilityKey>;
}

export function AbilityButtonBar(props: AbilityBarProps) {
	const buttons = props.keys.map((ability) => {
		const abilityCatalogItem = AbilityCatalog[ability];
		return AbilityButton({
			abilityKey: ability,
			onAbilityClick: (key) => {
				print(`${key} button clicked`);
				ServerFunction("ABILITY_ACTIVATE", key); // Call server function to activate the ability
			},
		});
	});

	return HorizontalButtonBar({
		buttons: buttons,
		Position: new UDim2(0.5, 0, 1, -50),
	});
}
