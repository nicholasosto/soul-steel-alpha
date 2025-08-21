import { Value, Computed } from "@rbxts/fusion";
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
	meta: CurrencyMeta; // Metadata for the currency
	current: Value<number>; // Current amount of the currency
	percentage: Computed<number>; // Percentage of current/max (0-1)
};
export function makeDefaultCurrencyDTO(): CurrencyDTO {
	return {
		Coins: 0,
		Tombs: 0,
		AttributePoints: 0,
	};
}
