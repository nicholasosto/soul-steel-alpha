import { Definitions } from "@rbxts/net";
import { CurrencyDTO, CurrencyKey } from "shared/catalogs/currency-catalog";

export const CurrencyRemotes = Definitions.Create({
	// Currency Management
	/** Server pushes complete currency state to clients */
	CurrencyUpdated: Definitions.ServerToClientEvent<[CurrencyDTO]>(),

	// Resource Fetching
	/** Client requests current currency state */
	FetchCurrency: Definitions.ServerAsyncFunction<() => CurrencyDTO>(),

	// Attribute Modification (for abilities, admin commands, etc.)
	ModifyCurrency: Definitions.ServerAsyncFunction<(currencyType: CurrencyKey, amount: number) => boolean>(),
});
