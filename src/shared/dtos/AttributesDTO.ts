/**
 * Data Transfer Object for player resource state
 * Represents a snapshot of all player resources at a point in time
 */
export interface AttributesDTO {
	/** Current health points */
	vitality: number;
	strength: number;
	dexterity: number;
	intelligence: number;
	luck: number;
}
