import { Definitions } from "@rbxts/net";
import { AttributeDTO, AttributeKey } from "shared/catalogs/attribute-catalog";

export const AttributeRemotes = Definitions.Create({
	// Attribute Management
	/** Server pushes complete attribute state to clients */
	AttributesUpdated: Definitions.ServerToClientEvent<[AttributeDTO]>(),

	// Resource Fetching
	/** Client requests current attribute state */
	//FetchAttributes: Definitions.ServerAsyncFunction<() => AttributeDTO>(),

	// Attribute Modification (for abilities, admin commands, etc.)
	ModifyAttribute: Definitions.ServerAsyncFunction<(attributeType: AttributeKey, amount: number) => boolean>(),
});
