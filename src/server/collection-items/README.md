# Collection Items System

## 🏗️ Architecture Overview

The Collection Items system has been refactored into a clean, modular architecture that separates concerns and makes it extremely easy to add new collection items without touching existing code.

### **Before (Monolithic)**
```
collection-service.ts (500+ lines)
├── Lava part logic
├── Experience orb logic  
├── Connection management
├── Instance tracking
└── Touch handlers
```

### **After (Modular)**
```
src/server/collection-items/
├── index.ts                     // Registry & exports
├── base-collection-item.ts      // Base interface/class
├── lava-part.ts                // Lava damage logic
├── experience-orb.ts           // XP collection logic
└── healing-crystal.ts          // Future: healing logic

src/server/services/collection-service.ts (Clean manager)
```

## 🎯 Key Benefits

### **1. Plugin-like Architecture**
- Each collection item is self-contained
- Adding new items doesn't require touching existing code
- Easy to enable/disable individual item types

### **2. Consistent Interface**
- All collection items implement `ICollectionItem`
- Standardized lifecycle management
- Common helper methods for touch detection, cooldowns, etc.

### **3. Easy Maintenance**
- Small, focused files instead of one massive file
- Clear separation of concerns
- Easy to test individual collection items

### **4. Scalable**
- Can easily add dozens of collection item types
- Clean registration system
- Centralized configuration

## 🛠️ How to Add New Collection Items

### **1. Create the new collection item file:**

```typescript
// src/server/collection-items/mana-spring.ts
import { BaseCollectionItem, CollectionItemConfig } from "./base-collection-item";
import { SignalServiceInstance } from "../services/signal-service";

export class ManaSpringCollectionItem extends BaseCollectionItem {
    constructor() {
        const config: CollectionItemConfig = {
            tag: "ManaSpring",
            name: "Mana Spring",
            enabled: true,
        };
        super(config);
    }

    public onTouched(part: Part, hit: BasePart): void {
        const player = this.getPlayerFromHit(hit);
        if (!player) return;

        // Your custom logic here
        const manaAmount = (part.GetAttribute("ManaAmount") as number) ?? 50;
        
        SignalServiceInstance.emit("ManaRestored", {
            player,
            amount: manaAmount,
            source: `ManaSpring:${part.Name}`,
        });
    }
}

export const ManaSpringInstance = new ManaSpringCollectionItem();
```

### **2. Register in the index file:**

```typescript
// src/server/collection-items/index.ts
export * from "./mana-spring";
import { ManaSpringInstance } from "./mana-spring";

export const COLLECTION_ITEMS_REGISTRY: ICollectionItem[] = [
    LavaPartInstance,
    ExperienceOrbInstance,
    ManaSpringInstance, // Add your new item here
    HealingCrystalInstance,
];
```

### **3. Done!** 
The CollectionService will automatically:
- ✅ Initialize your new collection item
- ✅ Set up touch handlers
- ✅ Monitor for new/removed instances
- ✅ Handle cleanup

## 📋 Available Collection Items

### **🔥 Lava Part** (`LavaPart`)
- **Functionality**: Damages players on touch
- **Attributes**:
  - `DamageAmount` (number): Damage to deal (default: 10)
  - `DamageCooldown` (number): Seconds between damage (default: 1)

### **⭐ Experience Orb** (`ExperienceOrb`)
- **Functionality**: Awards XP to players on touch
- **Attributes**:
  - `ExperienceAmount` (number): XP to award (default: 25)
  - `RespawnTime` (number): Seconds before respawn (default: 30)
  - `OncePerPlayer` (boolean): Single collection per player (default: false)

### **💎 Healing Crystal** (`HealingCrystal`) - *Future*
- **Functionality**: Heals players on touch
- **Status**: Disabled by default, ready for implementation
- **Attributes**:
  - `HealAmount` (number): Health to restore (default: 50)
  - `CooldownTime` (number): Seconds between uses (default: 10)
  - `MaxHealth` (boolean): Fully heal to max (default: false)

## 🎮 Usage in Roblox Studio

### **1. Tag any Part with the collection item tag**
- In Roblox Studio, select a Part
- Use CollectionService or a plugin to add tags
- Available tags: `LavaPart`, `ExperienceOrb`, `HealingCrystal`

### **2. Configure with Attributes (Optional)**
- Add attributes to customize behavior
- Each collection item supports different attributes
- Attributes override default values

### **3. Test in-game**
- Parts are automatically detected and initialized
- Touch parts to trigger their effects
- Check output for debug messages

## 🔧 Configuration

### **Enable/Disable Collection Items**
```typescript
// In the collection item constructor
const config: CollectionItemConfig = {
    tag: "YourTag",
    name: "Your Item",
    enabled: false, // Disable this collection item
};
```

### **Debug Status**
```typescript
// Get status of all collection items
const status = CollectionServiceManagerInstance.getStatus();
print(status);
```

## 📊 Monitoring & Debugging

The Collection Service Manager provides built-in monitoring:

```typescript
// Get status report
const status = CollectionServiceManagerInstance.getStatus();

// Get specific collection item
const lavaItem = CollectionServiceManagerInstance.getCollectionItem("LavaPart");

// Get enabled/disabled summary
const summary = CollectionServiceManagerInstance.getItemsSummary();
```

## 🚀 Future Collection Items Ideas

Easy to implement with this architecture:

- **🏺 Treasure Chest**: Awards random items/currency
- **🌪️ Wind Gust**: Pushes players in a direction  
- **🧊 Ice Patch**: Slows player movement
- **⚡ Lightning Rod**: Periodic area damage
- **🌸 Flower Patch**: Temporary buffs
- **🏃 Speed Boost**: Movement speed enhancement
- **🎯 Checkpoint**: Save player progress
- **🚪 Portal**: Teleport between locations

Each would be ~50 lines of focused, testable code!
