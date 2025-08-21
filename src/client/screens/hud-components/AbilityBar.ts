import { HStack } from "@trembus/ss-fusion";
import { Value } from "@rbxts/fusion";
import { AbilityCatalog, AbilityKey } from "shared";
import { AbilityController } from "client/controllers";
import { AbilityButton } from "./AbilityButton";

export const AbilityBar = (keys: AbilityKey[]) => {
	const buttons = keys.map((key) =>
		AbilityButton({
			abilityKey: key,
			icon: AbilityCatalog[key].icon,
			cooldown: AbilityCatalog[key].cooldown,
			onActivate: () => AbilityController.getInstance().activateAbility(key),
			labelText: Value(AbilityCatalog[key].displayName),
		}),
	);
	const hStack = HStack({
		Position: UDim2.fromScale(0.5, 1),
		AnchorPoint: new Vector2(0.5, 1),
		align: "center",
		justify: "center",
		gap: 5,
		children: buttons,
	});

	return hStack;
};
