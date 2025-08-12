import { CooldownButton, HStack } from "@trembus/ss-fusion";
import { Value } from "@rbxts/fusion";
import { AbilityCatalog, AbilityKey } from "shared";
import { AbilityController } from "client/controllers";

export const AbilityBar = (keys: AbilityKey[]) => {
	const buttons = keys.map((key) =>
		CooldownButton({
			size: "large",
			icon: AbilityCatalog[key].icon,
			cooldown: AbilityCatalog[key].cooldown,
			onClick: () => AbilityController.getInstance().activateAbility(key),
			showCooldownLabel: true,
			cooldownLabelText: Value(AbilityCatalog[key].displayName),
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
