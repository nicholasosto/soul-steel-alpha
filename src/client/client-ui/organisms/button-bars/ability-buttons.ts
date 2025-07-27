import { ImageConstants } from "shared/asset-ids";
import { HorizontalButtonBar } from "./ButtonBar";
import { IconButton } from "client/client-ui/atoms";
import { AbilityKey } from "shared/keys";
import { ServerFunction } from "client/event-dispatcher";

interface AbilityBarProps {
	abilities: Array<AbilityKey>;
}

export function AbilityButtonBar(props: AbilityBarProps) {
	const buttons = props.abilities.map((ability) => {
		return IconButton({
			Name: `${ability}Button`,
			icon: ImageConstants.Ability[ability],
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
