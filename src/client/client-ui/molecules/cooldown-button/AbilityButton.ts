import Fusion, { PropertyTable } from "@rbxts/fusion";
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { UI_SIZES } from "shared/constants/ui-constants";
import { CooldownButton } from "./CooldownButton";

export interface AbilityButtonProps extends PropertyTable<Frame> {
	abilityKey: AbilityKey;
	cooldownProgress?: Fusion.Value<number>; // 0-1, where 0 is ready and 1 is full cooldown
	onAbilityClick?: (abilityKey: AbilityKey) => void;
}

export function AbilityButton(props: AbilityButtonProps) {
	const ability = AbilityCatalog[props.abilityKey];

	// Container frame to hold all components
	const containerFrame = CooldownButton({
		Name: `AbilityButton_${props.abilityKey}`,
		Size: UI_SIZES.BUTTON_COOLDOWN, // Default size if not provided
		icon: ability.icon,
		cooldown: ability.cooldown,
		onClick: () => {
			if (props.onAbilityClick) {
				props.onAbilityClick(props.abilityKey);
			} else {
				print(`AbilityButton: Clicked ability "${props.abilityKey}" but no handler provided.`);
			}
		},
	});

	return containerFrame;
}
