/**
 * @file src/server/services/SERVICE_ARCHITECTURE.md
 * @description Server Services Architecture Documentation
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

# Server Services Architecture

## 🏗️ **Core Principles**

### Singleton Pattern
All services follow consistent singleton pattern:
```typescript
export class ServiceName {
    private static instance?: ServiceName;
    
    public static getInstance(): ServiceName {
        if (!ServiceName.instance) {
            ServiceName.instance = new ServiceName();
        }
        return ServiceName.instance;
    }
    
    private constructor() {
        // Initialize service
    }
}
```

### Signal-Based Communication
Services communicate through signals, not direct dependencies:
```typescript
// GOOD - Signal-based
SignalServiceInstance.emit("HealthDamageRequested", { player, amount, source });

// BAD - Direct coupling
ResourceServiceInstance.ModifyResource(player, "health", -amount);
```

## 📋 **Service Inventory**

### **Core Services** ✅

| Service | Purpose | Status | Pattern |
|---------|---------|--------|---------|
| `SignalService` | Inter-service communication | Active | getInstance() |
| `DataService` | Player data persistence | Active | getInstance() |
| `ResourceService` | Health/mana/stamina | Active | getInstance() |
| `HumanoidMonitorService` | Roblox API bridge | Active | getInstance() |

### **Game Logic Services** ✅  

| Service | Purpose | Status | Pattern |
|---------|---------|--------|---------|
| `AbilityService` | Ability system | Active | getInstance() |
| `CombatService` | Combat mechanics | Active | getInstance() |
| `ZoneService` | Zone management | Active | getInstance() |
| `AnimationService` | Animation system | Active | getInstance() |

### **Utility Services** ✅

| Service | Purpose | Status | Pattern |
|---------|---------|--------|---------|
| `MessageService` | Player messaging | Active | getInstance() |
| `CollectionService` | Tagged objects | Active | Function export |
| `DamageService` | Signal-based damage | Active | getInstance() |

### **Deprecated/Placeholder** ❌
| Service | Status | Action Needed |
|---------|--------|---------------|
| `HumanoidServices` | Duplicate | Remove |
| `EnhancedCombatService` | Placeholder | Implement or remove |
| `SignalBasedServiceExample` | Placeholder | Remove |

## 🔄 **Service Communication Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Game Events    │    │  Signal System  │    │  Service Logic  │
│  (Humanoid,     │───▶│  (Central Hub)  │───▶│  (Resource,     │
│   Combat, etc.) │    │                 │    │   Combat, etc.) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 **Best Practices**

### ✅ **DO**
- Use signals for inter-service communication
- Follow consistent singleton patterns
- Keep services focused on single responsibility
- Handle cleanup properly in PlayerRemoving events
- Use interfaces for loose coupling

### ❌ **DON'T**
- Create direct service dependencies
- Mix different singleton patterns
- Handle Roblox API directly in game logic services
- Create services with overlapping responsibilities
- Use placeholders in production code

## 🔧 **Current Issues & Fixes**

### 1. **Inconsistent Singleton Patterns**
**Status:** � Complete - Standardized
**Action:** ✅ All services now use `getInstance()`

### 2. **Duplicate Humanoid Services**
**Status:** � Complete - Fixed
**Action:** ✅ Removed `HumanoidServices`, kept `HumanoidMonitorService`

### 3. **Missing Service Exports**
**Status:** � Complete - Fixed
**Action:** ✅ Added `DamageService` to exports

### 4. **Signal Integration**
**Status:** ✅ Complete - Enhanced
**Action:** ✅ Enhanced CombatService and AbilityService with signals

### 5. **Service Decoupling Violations**
**Status:** ✅ Complete - Fixed
**Action:** ✅ Removed all direct service dependencies:
- SpawnService: Uses ServiceRegistry for DataService access
- CombatService: Uses signals + ServiceRegistry for messaging/damage
- NPCSpawnManager: Uses signal-based NPC lifecycle management
- UnifiedNPCService: Removed ResourceService dependency, added signal handlers

## 📊 **Service Dependencies**

```
SignalService (Core Hub)
├── HumanoidMonitorService (Roblox → Signals)
├── ResourceService (Signals → Game State)
├── DamageService (Game Logic → Signals)
├── CombatService (Game Logic → Signals)
├── AbilityService (Game Logic → Signals)
└── ZoneService (Game Logic → Signals)

DataService (Independent)
└── All services can query player data

MessageService (Independent)
└── Used by services for player notifications
```

## 🚀 **Recommended Next Steps**

1. **Standardize Singleton Patterns** - Convert all to `getInstance()`
2. **Remove Placeholder Services** - Clean up codebase  
3. **Implement Service Registry** - Central service access
4. **Add Service Health Checks** - Monitor service status
5. **Create Service Tests** - Validate service behavior
