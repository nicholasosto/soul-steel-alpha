import { Definitions } from "@rbxts/net";
import { CurrencyDTO, CurrencyKey } from "shared/catalogs/currency-catalog";
import { SIGNAL_KEYS } from "shared/keys";

export const CurrencyRemotes = Definitions.Create({
	// Currency Management
	/** Server pushes complete currency state to clients */
	[SIGNAL_KEYS.CURRENCY_UPDATED]: Definitions.ServerToClientEvent<[CurrencyDTO]>(),

	// // Resource Fetching
	// /** Client requests current currency state */
	// FetchCurrency: Definitions.ServerAsyncFunction<() => CurrencyDTO>(),

	// Attribute Modification (for abilities, admin commands, etc.)
	[SIGNAL_KEYS.MODIFY_CURRENCY]:
		Definitions.ServerAsyncFunction<(currencyType: CurrencyKey, amount: number) => boolean>(),
});
