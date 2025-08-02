import { Definitions } from "@rbxts/net";
import { AttributesDTO } from "shared/dtos/AttributesDTO";
import { AttributeKey } from "shared/keys/attribute-keys";

export const AttributeRemotes = Definitions.Create({
	// Attribute Management
	/** Server pushes complete attribute state to clients */
	AttributesUpdated: Definitions.ServerToClientEvent<[AttributesDTO]>(),

	// Resource Fetching
	/** Client requests current attribute state */
	FetchAttributes: Definitions.ServerAsyncFunction<() => AttributesDTO>(),

	// Attribute Modification (for abilities, admin commands, etc.)
	ModifyAttribute: Definitions.ServerAsyncFunction<(attributeType: AttributeKey, amount: number) => boolean>(),
});
