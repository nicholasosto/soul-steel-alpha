import { Computed, Value } from "@rbxts/fusion";
import { HStack, IconButton, Label, Panel, VStack } from "@trembus/ss-fusion";
import { Dragger } from "client/components";
import { PlayerStateInstance } from "client/states";
import { ImageConstants } from "shared";

export interface CurrencyDisplayProps {
	coins: Value<number>;
	tombs: Value<number>;
}
const CELL_WIDTH = 52;
const CELL_HEIGHT = 70;

export const CurrencyDisplay = (props: CurrencyDisplayProps) => {
	/* Coin Stack */
	const coinsLabel = Computed(() => `${PlayerStateInstance.Currency.Coins.get() ?? 0}`);
	const tombsLabel = Computed(() => `${PlayerStateInstance.Currency.Tombs.get() ?? 0}`);
	const attribPointsLabel = Computed(() => `${PlayerStateInstance.Currency.AttributePoints.get() ?? 0}`);
	const CoinStack = VStack({
		Size: new UDim2(0, CELL_WIDTH, 0, CELL_HEIGHT),
		padding: 2,
		children: [
			IconButton({
				icon: ImageConstants.Currency.Coins,
				Size: new UDim2(0, 40, 0, 40),
			}),
			Label({
				Name: "CoinLabel",
				text: coinsLabel.get(),
				Size: new UDim2(0, 40, 0, 15),
			}),
		],
	});

	const TombStack = VStack({
		Size: new UDim2(0, CELL_WIDTH, 0, CELL_HEIGHT),
		padding: 2,
		children: [
			IconButton({
				icon: ImageConstants.Currency.Tombs,
				Size: new UDim2(0, 40, 0, 40),
			}),
			Label({
				Name: "TombLabel",
				text: tombsLabel.get(),
				Size: new UDim2(0, 40, 0, 15),
			}),
		],
	});

	/* Horizontal Stack for Currency Stacks */
	const currencyStack = HStack({
		padding: 0,
		Name: "CurrencyStack",
		Size: new UDim2(1, 0, 1, 0),
		children: [CoinStack, TombStack],
	});

	const panel = Panel({
		padding: 2,
		Position: new UDim2(1, -CELL_WIDTH * 2 - 14, 0, CELL_HEIGHT * 2),
		Size: new UDim2(0, CELL_WIDTH * 2 + 4, 0, CELL_HEIGHT + 4),
		children: [currencyStack],
	});
	return panel;
};
