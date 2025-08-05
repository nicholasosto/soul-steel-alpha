import { Definitions } from "@rbxts/net";
import { AttributeValues, AttributeKey } from "@trembus/rpg-attributes";

export const AttributeRemotes = Definitions.Create({
	// Attribute Management
	/** Server pushes complete attribute state to clients */
	AttributesUpdated: Definitions.ServerToClientEvent<[AttributeValues]>(),

	// Resource Fetching
	/** Client requests current attribute state */
	FetchAttributes: Definitions.ServerAsyncFunction<() => AttributeValues>(),

	// Attribute Modification (for abilities, admin commands, etc.)
	ModifyAttribute: Definitions.ServerAsyncFunction<(attributeType: AttributeKey, amount: number) => boolean>(),
});
