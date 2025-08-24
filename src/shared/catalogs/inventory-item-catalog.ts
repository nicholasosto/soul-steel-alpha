import { AttributeDTO } from "./attribute-catalog";

export const INVENTORY_ITEM_TYPE_KEYS = ["Consumable", "EQ_Head", "EQ_Chest", "EQ_Accessory", "EQ_Charm"] as const;
export type InventoryItemTypeKey = (typeof INVENTORY_ITEM_TYPE_KEYS)[number];

interface InventoryItemBase {
	uuid: string; // Unique identifier for this item instance
	key: InventoryItemTypeKey; // Type of item
	generatedAt: string;
}
interface Consumable extends InventoryItemBase {
	uses: number;
}
interface EquipmentBase extends InventoryItemBase {
	attributes: AttributeDTO;
}

export interface InventoryDataInterfaces {
	Consumable: Consumable;
	EQ_Head: EquipmentBase;
	EQ_Chest: EquipmentBase;
	EQ_Accessory: EquipmentBase;
	EQ_Charm: EquipmentBase;
}
