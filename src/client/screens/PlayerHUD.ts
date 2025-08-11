import { Children, New, OnEvent } from "@rbxts/fusion";
import { AbilityController } from "client/controllers";
import { CooldownButton } from "@trembus/ss-fusion";
import { AbilityCatalog } from "shared";
const abilityController = AbilityController.getInstance();
/* ---------------------------------- TEXT BOXES ---------------------------------- */

const meleeMeta = AbilityCatalog["Melee"];
export function createPlayerHUD(parent: Instance): ScreenGui {
	return New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		Enabled: true,
		DisplayOrder: 10,
		[Children]: {
			AbilityButton: CooldownButton({
				cooldown: meleeMeta.cooldown,
				icon: meleeMeta.icon,
				onClick: () => {
					abilityController.activateAbility("Melee");
				},
			}),
		},
	});
}
