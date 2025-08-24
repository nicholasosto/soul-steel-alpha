# Profile, Inventory, and Recalculation Flow

This document describes the end-to-end flow for player profile bootstrap, server↔server interactions, and client↔server sync for attributes/resources/progression, and how equipment/inventory will plug in.

## Summary

- DataService is the source of truth for persistent data (Abilities, Attributes, Currency, Progression, Controls).
- AttributesService broadcasts AttributesUpdated on join; ResourceService recomputes resource maxima using profile Attributes + Progression.
- ProgressionService owns XP/level and emits updates; clients subscribe via remotes.
- Inventory/Equipment layer will sit between DataService (persistent) and AttributesService/ResourceService (derived), applying modifiers to compute effective attributes.

## Lifecycle: Player Join → Ready

1. DataService loads/creates profile via ProfileService
   - DefaultData provides initial Abilities, Attributes, Currency, Progression, Controls
   - When bound, sends PROFILE_READY with full PersistentPlayerData to the client
2. AttributesService on PlayerAdded
   - Reads profile.Attributes
   - Emits Signal: AttributesUpdated { player, attributes }
   - Sends attributes to client via remotes
3. ResourceService on PlayerAdded / first spawn
   - Initializes ResourceDTO for player
   - recomputeMaxesFromProfile(level, attributes) → sets health/mana/stamina max; optionally fill to max
   - Sends RESOURCES_UPDATED to client and starts regen loop
4. ProgressionService sets up remotes and reacts to signals
   - Provides GET_PROGRESSION and broadcasts PROGRESSION_UPDATED/LEVEL_UP

Client receives PROFILE_READY → hydrates PlayerState slices (Abilities, Attributes, Currency, Progression) and subscribes to resource/progression update events.

## Equipment and Inventory Integration (Planned)

- Catalogs provide static definitions (item stats, slot, rarity). Instance data stores uuid, durability/uses, roll modifiers, timestamps.
- EquipmentService (server) mediates equipping/unequipping:
  - Validates ownership, slot compatibility, and conflicts.
  - Computes DerivedAttributes = BaseAttributes(profile) + Sum(EquipmentModifiers) + TemporaryEffects.
  - Emits AttributesUpdated with effective attributes; triggers ResourceService.recomputeMaxesFromProfile(setToFull=false) to adjust maxima without fully healing.
- DataService persists inventory and equipped slots separately.

## Data Shapes (contract)

- PersistentPlayerData: Abilities, Attributes, Currency, Progression, Controls (existing)
- Inventory:
  - InventoryItemDef (catalog): key, slot/consumable, base modifiers
  - InventoryItemInstance (profile): uuid, defKey, rolls, uses/durability, createdAt
  - EquippedSlots: Partial<Record<EquipmentSlotKey, uuid>>

## Server↔Server Signal/Naming

- AttributesUpdated (existing): consumed by ResourceService
- New (planned):
  - EquipmentChanged { player, equippedSlots, effectiveAttributes }
  - InventoryChanged { player, changeSet }

## Client↔Server Remotes

- Existing: ProfileRemotes.PROFILE_READY, ResourceRemotes.FETCH_RESOURCES/RESOURCES_UPDATED, ProgressionRemotes.*
- Planned:
  - InventoryRemotes.GET_INVENTORY → InventoryDTO
  - InventoryRemotes.EQUIP/UNEQUIP → boolean
  - AttributesRemotes.ATTRIBUTES_UPDATED (already mirrored by signal/remote)

## Validation Rules

- Never trust client; server validates equip/unequip, item ownership, and slot rules.
- No Promise types in ServerAsyncFunction; use explicit generics.
- Explicit undefined checks for Map/dictionary lookups and Instances.

## Recalc Triggers

- On: level up, attributes changed, equipment changed, temporary effects change, respawn.
- Flow:
  - Compute effective attributes → emit AttributesUpdated → ResourceService.recomputeMaxesFromProfile(setToFull=false)
  - If respawn or first load: setToFull=true

## Next Steps

1. Split inventory definitions vs instances and move keys into shared/keys
2. Create server EquipmentService with slot rules and attribute aggregation
3. Add InventoryRemotes and DTOs
4. Wire DataService persistence for inventory and equipped slots
5. Add zod schemas/type-guards for inventory shapes
