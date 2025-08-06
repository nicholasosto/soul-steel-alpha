import { HorizontalButtonBar } from "./ButtonBar";
import { GameActionController } from "client/controllers";
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { AbilityButton } from "client/client-ui/molecules/cooldown-button";

interface AbilityBarProps {
	keys: Array<AbilityKey>;
}

export function AbilityButtonBar(props: AbilityBarProps) {
	const gameActionController = GameActionController.getInstance();

	const buttons = props.keys.map((ability) => {
		const abilityCatalogItem = AbilityCatalog[ability];
		return AbilityButton({
			abilityKey: ability,
			onAbilityClick: (key) => {
				print(`${key} button clicked`);
				gameActionController.activateAbility(key); // Use the new controller to activate the ability
			},
		});
	});

	return HorizontalButtonBar({
		buttons: buttons,
		Position: new UDim2(0.5, 0, 1, -50),
	});
}
