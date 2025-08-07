# AttributeService Integration with @trembus/rpg-attributes

## Installation Summary

✅ **Package Installed**: `@trembus/rpg-attributes@1.0.0-alpha.1`
✅ **TypeScript Configuration**: Added `@trembus` to typeRoots in `tsconfig.json`
✅ **Rojo Configuration**: Added `@trembus` scope to `default.project.json`
✅ **Build Success**: Project compiles without errors

## How to Use

### 1. Basic AttributeService Usage

```typescript
import { AttributeService } from "server/services/attribute-service";

const attributeService = AttributeService.GetInstance();

// Get player attributes
const attributes = attributeService.getPlayerAttributes(player);

// Modify base attributes (persisted to DataStore)
attributeService.modifyAttribute(player, "vitality", 5);

// Add equipment bonuses (temporary, not persisted)
attributeService.modifyEquipmentBonus(player, "agility", 10);

// Add effect bonuses (temporary, not persisted)
attributeService.modifyEffectBonus(player, "intellect", 5);
```

### 2. Client State Integration

Your existing `PlayerAttributeSlice` will automatically receive updates:

```typescript
// Client-side - your existing code still works
const attributeSlice = new PlayerAttributeSlice();
const attributes = await attributeSlice.fetch();
// Reactive updates via AttributesUpdated event
```

### 3. Package Benefits

- **Structured Attribute Values**: Each attribute now has `baseValue`, `equipmentBonus`, and `effectBonus`
- **Metadata Access**: Get display names, descriptions, and icons from `AttributeCatalog`
- **Type Safety**: Full TypeScript support with the package's types
- **Extensibility**: Easy to add new attribute types or modify existing ones

### 4. Key Features

1. **Persistent Storage**: Base attribute values are saved to DataStore via ProfileService
2. **Temporary Bonuses**: Equipment and effect bonuses are runtime-only
3. **Automatic Broadcasting**: Changes are automatically sent to clients
4. **Backward Compatibility**: Existing client code continues to work

### 5. Architecture

```
[Client PlayerAttributeSlice] ↔ [AttributeRemotes] ↔ [AttributeService] ↔ [DataService]
                                                            ↓
                                                [@trembus/rpg-attributes Package]
```

The service acts as a bridge between your existing DTO-based communication system and the rich attribute management features provided by the package.

## Next Steps

1. **Test the Integration**: Use the demo file to test attribute modifications
2. **Customize Equipment System**: Extend the equipment bonus functionality for your items
3. **UI Integration**: Use the attribute metadata for rich UI tooltips and displays
4. **Effect System**: Build temporary effect system using the effect bonuses

## Demo

See `src/server/demos/attribute-service-demo.server.ts` for a complete example of how to use all the new features.
