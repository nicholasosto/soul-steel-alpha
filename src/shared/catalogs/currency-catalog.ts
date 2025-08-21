import { Value } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";
export const CURRENCY_KEYS = ["Coins", "Tombs", "AttributePoints"] as const;
export type CurrencyKey = (typeof CURRENCY_KEYS)[number];
export interface CurrencyMeta {
	displayName: string; // User-friendly name for the currency
	description: string; // Detailed description of the currency
	icon: string; // Roblox asset ID for the currency icon
	color: Color3; // Color used for the currency display
}
export type CurrencyDTO = {
	[key in CurrencyKey]: number; // Maps each currency key to its current amount
};
export type CurrencyState = {
	[key in CurrencyKey]: Value<number>; // Reactive value for each currency
};

export function makeDefaultCurrencyDTO(): CurrencyDTO {
	return {
		Coins: 140,
		Tombs: 2,
		AttributePoints: 14,
	};
}
export function makeCurrencyStateFromDTO(dto: CurrencyDTO): CurrencyState {
	const state: CurrencyState = {} as CurrencyState;
	for (const key of CURRENCY_KEYS) {
		state[key] = Value(dto[key]);
	}
	return state;
}
export function makeDefaultCurrencyState(): CurrencyState {
	return makeCurrencyStateFromDTO(makeDefaultCurrencyDTO());
}

export const CurrencyCatalog: Record<CurrencyKey, CurrencyMeta> = {
	Coins: {
		displayName: "Coins",
		description: "The primary currency used for transactions.",
		icon: ImageConstants.Currency.Coins,
		color: Color3.fromRGB(255, 215, 0),
	},
	Tombs: {
		displayName: "Tombs",
		description: "A currency used for purchasing special items.",
		icon: ImageConstants.Currency.Tombs,
		color: Color3.fromRGB(128, 0, 128),
	},
	AttributePoints: {
		displayName: "Attribute Points",
		description: "Points used to upgrade player attributes.",
		icon: ImageConstants.Ability.Melee, //TODO: create Attribute point icon
		color: Color3.fromRGB(0, 255, 0),
	},
};
