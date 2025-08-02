/**
 * Data Transfer Object for player resource state
 * Represents a snapshot of all player resources at a point in time
 */
import { AttributeKey } from "shared/keys";
export type AttributesDTO = {
	/** Current health points */
	[key in AttributeKey]: number;
};
