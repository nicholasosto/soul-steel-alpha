import { Definitions } from "@rbxts/net";
import { AttributeDTO, AttributeKey } from "shared/catalogs/attribute-catalog";
import { SIGNAL_KEYS } from "shared/keys";

export const AttributeRemotes = Definitions.Create({
	// Attribute Management
	/** Server pushes complete attribute state to clients */
	[SIGNAL_KEYS.ATTRIBUTES_UPDATED]: Definitions.ServerToClientEvent<[AttributeDTO]>(),

	// Resource Fetching
	/** Client requests current attribute state */
	//FetchAttributes: Definitions.ServerAsyncFunction<() => AttributeDTO>(),

	// Attribute Modification (for abilities, admin commands, etc.)
	ClientSaveAttributes: Definitions.ServerAsyncFunction<(attributes: AttributeDTO) => boolean>(),
	ModifyAttribute: Definitions.ServerAsyncFunction<(attributeType: AttributeKey, amount: number) => boolean>(),
});
