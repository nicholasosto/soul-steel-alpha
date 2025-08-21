import { Computed, Value } from "@rbxts/fusion";
import { HStack, IconButton, Label, Panel, VStack } from "@trembus/ss-fusion";
import { ImageConstants } from "shared";

export interface CurrencyDisplayProps {
	coins: Value<number>;
	tombs: Value<number>;
}

export const CurrencyDisplay = (props: CurrencyDisplayProps) => {
	const coinIcon = IconButton({
		icon: ImageConstants.Currency.Coins,
		size: "medium",
	});
	const tombsIcon = IconButton({
		icon: ImageConstants.Currency.Tombs,
		size: "medium",
	});
	const coinLabel = Label({
		text: Computed(() => `Coins: ${props.coins.get()}`) as unknown as Value<string>,
	});
	const tombsLabel = Label({
		text: Computed(() => `Tombs: ${props.tombs.get()}`) as unknown as Value<string>,
	});
	const coinStack = VStack({
		children: [coinIcon, coinLabel],
	});
	const tombsStack = VStack({
		children: [tombsIcon, tombsLabel],
	});
	const currencyStack = HStack({
		children: [coinStack, tombsStack],
	});

	return Panel({
		Size: UDim2.fromOffset(200, 50),

		children: [currencyStack],
	});
};
