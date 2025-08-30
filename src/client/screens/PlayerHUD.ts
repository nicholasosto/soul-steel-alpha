import { Children, New } from "@rbxts/fusion";
import { PlayerDataPanel } from "./panels";
import { CurrencyDisplay, CharacterCardInstance, AbilityBar } from "./hud-components";
import { PlayerStateInstance } from "client/states";
import { AttributeRow } from "./hud-components/AttributeRow";
import { AttributeRemotes, attributeStateToDTO } from "shared";
import { AttributesPanel } from "./panels/AttributesPanel";

function onIncrement() {
	warn(`Incrementing attribute: ${PlayerStateInstance.Attributes["Agility"].base.get()}`);
	const dto = attributeStateToDTO(PlayerStateInstance.Attributes);
	dto.Agility.base = math.min(100, dto.Agility.base + 1);
	AttributeRemotes.Client.Get("ClientSaveAttributes").CallServerAsync(dto);
}

function onDecrement() {
	warn(`Decrementing attribute: ${PlayerStateInstance.Attributes["Agility"].base.get()}`);
	const dto = attributeStateToDTO(PlayerStateInstance.Attributes);
	dto.Agility.base = math.max(0, dto.Agility.base - 1);
	AttributeRemotes.Client.Get("ClientSaveAttributes").CallServerAsync(dto);
}

export function createPlayerHUD(parent: Instance): ScreenGui {
	const abilityBar = AbilityBar(["Earthquake", "Melee", "Ice-Rain", "Soul-Drain"]);
	const currencyDisplay = CurrencyDisplay({
		coins: PlayerStateInstance.Currency["Coins"],
		tombs: PlayerStateInstance.Currency["Tombs"],
	});

	const playerHudComponent = New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		Enabled: true,
		DisplayOrder: 10,
		[Children]: {
			AbilityBar: abilityBar,
			//CharacterCard: CharacterCardInstance,
			CurrencyDisplay: currencyDisplay,
			RowTest: AttributesPanel({
				playerAttributesState: PlayerStateInstance.Attributes,
				attributePoints: PlayerStateInstance.Currency.AttributePoints,
			}),
		},
	});

	return playerHudComponent;
}
