/// <reference types="@rbxts/types" />
import { New, Children, Value, ForKeys, Computed } from "@rbxts/fusion";
import { AttributeCatalog, AttributeKey } from "@trembus/rpg-attributes";
import {
	AttributeControl,
	AttributeControlProps,
} from "@trembus/rpg-attributes/out/fusion-components/attribute-controller";
import { AttributesState } from "client/states";

export function AttributePanel(state: AttributesState) {
	const AgilityMeta = AttributeCatalog["agility"];
	const AgilityState = Computed(() => state.agility.get());

	const attributeProps: AttributeControlProps = {
		icon: Computed(() => AgilityMeta.icon),
		label: Computed(() => AgilityMeta.displayName),
		value: AgilityState,
		onIncrease: () => state.agility.set(AgilityState.get() + 1),
		onDecrease: () => state.agility.set(AgilityState.get() - 1),
		iconSize: new UDim2(0, 50, 0, 50),
	};

	const panel = New("Frame")({
		Size: new UDim2(0.5, 0, 0.5, 0),
		Position: new UDim2(0.25, 0, 0.25, 0),
		BackgroundColor3: new Color3(0.1, 0.1, 0.1),
		BorderSizePixel: 0,
		ClipsDescendants: true,
		[Children]: [
			New("UIListLayout")({
				SortOrder: Enum.SortOrder.LayoutOrder,
				FillDirection: Enum.FillDirection.Vertical,
				Padding: new UDim(0, 10),
			}),
			AttributeControl(attributeProps),
		],
	});

	return panel;
}
