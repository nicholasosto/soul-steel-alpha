import { HorizontalButtonBar } from "./ButtonBar";
import { AbilityController } from "client/controllers";
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { AbilityButton } from "client/client-ui/molecules/cooldown-button";

interface AbilityBarProps {
	keys: Array<AbilityKey>;
}

export function AbilityButtonBar(props: AbilityBarProps) {
	const abilityController = AbilityController.getInstance();

	const buttons = props.keys.map((ability) => {
		const abilityCatalogItem = AbilityCatalog[ability];
		return AbilityButton({
			abilityKey: ability,
			onAbilityClick: (key) => {
				print(`${key} button clicked`);
				abilityController.activateAbility(key); // Use the new controller to activate the ability
			},
		});
	});

	return HorizontalButtonBar({
		buttons: buttons,
		Size: new UDim2(0, buttons[0].Size.X.Offset * buttons.size(), 0, buttons[0].Size.Y.Offset),
		Position: new UDim2(0.5, 0, 1, -50),
	});
}
