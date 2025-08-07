# NPC System - Complete Guide

**Version**: Unified Service v2.0  
**Last Updated**: August 7, 2025  
**Status**: ✅ Production Ready

## 📖 **Table of Contents**

1. [Quick Start](#quick-start)
2. [System Overview](#system-overview)
3. [API Reference](#api-reference)
4. [Configuration Guide](#configuration-guide)
5. [Migration Guide](#migration-guide)
6. [Implementation Status](#implementation-status)

## 🚀 **Quick Start**

### Basic NPC (Lightweight)
```typescript
import { UnifiedNPCServiceInstance } from "server/services/unified-npc-service";

// Simple villager NPC
const villager = UnifiedNPCServiceInstance.SpawnNPC("guard", position, {
    mode: "basic",
    enableCombat: false,
    isHostile: false
});
```

### Combat NPC (Full Features)
```typescript
// Hostile enemy with combat capabilities
const enemy = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, {
    mode: "enhanced",
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: true,
    aggroRange: 15,
    retreatThreshold: 0.25
});
```

## 🏗️ **System Overview**

### Unified NPC Service
**File**: `src/server/services/unified-npc-service.ts`  
**Access**: `UnifiedNPCServiceInstance` (singleton)

The Unified NPC Service consolidates all NPC functionality into a single, feature-configurable system that provides both basic and enhanced functionality through configuration flags.

### Key Features
- **🎯 Configuration-Based**: Choose basic or enhanced mode per NPC
- **⚔️ Combat Integration**: Full SSEntity compatibility with combat system
- **🧠 Advanced AI**: Intelligent behaviors (idle, patrol, combat, pursuit, retreat)
- **📊 Resource Management**: Health, mana, stamina tracking with regeneration
- **📋 Template System**: Configurable NPC types (goblin, skeleton, guard)
- **🔄 Migration Support**: Backward compatible with existing services

### NPC Types Available
```typescript
export type NPCType = "goblin" | "skeleton" | "guard";
```

### AI States
```typescript
export type NPCAIState = "idle" | "patrol" | "combat" | "pursuit" | "retreat" | "dead";
```

## 🔧 **API Reference**

### Core Methods

#### `SpawnNPC(type, position, config?)`
Create a new NPC with specified configuration.

**Parameters:**
- `type: NPCType` - NPC template to use ("goblin", "skeleton", "guard")
- `position: Vector3` - World position to spawn at
- `config?: NPCConfig` - Optional configuration overrides

**Returns:** `string | undefined` - NPC ID if successful

**Example:**
```typescript
const npcId = UnifiedNPCServiceInstance.SpawnNPC("goblin", new Vector3(0, 0, 0), {
    mode: "enhanced",
    enableCombat: true,
    health: 150
});
```

#### `DespawnNPC(npcId)`
Remove an NPC and clean up all resources.

**Parameters:**
- `npcId: string` - ID of NPC to remove

**Returns:** `boolean` - Success status

#### `SetAIState(npcId, state)`
Manually control NPC AI behavior.

**Parameters:**
- `npcId: string` - Target NPC ID
- `state: NPCAIState` - New AI state

**Returns:** `boolean` - Success status

#### `GetNPC(npcId)`
Retrieve NPC entity by ID.

**Parameters:**
- `npcId: string` - NPC ID to find

**Returns:** `UnifiedNPCEntity | undefined`

#### `GetAllNPCs()`
Get all active NPCs.

**Returns:** `UnifiedNPCEntity[]`

#### `GetNPCsInRange(position, range)`
Find NPCs within specified distance.

**Parameters:**
- `position: Vector3` - Center point
- `range: number` - Search radius

**Returns:** `UnifiedNPCEntity[]`

#### `GetStats()`
Get performance and usage statistics.

**Returns:** Performance metrics object

### Enhanced Features (When Enabled)

#### `ForceNPCAttack(npcId, target)`
Force an NPC to attack a specific target.

**Parameters:**
- `npcId: string` - Attacking NPC ID
- `target: SSEntity` - Target to attack

**Returns:** `boolean` - Success status

## ⚙️ **Configuration Guide**

### NPCConfig Interface
```typescript
interface NPCConfig {
    // Core Settings
    mode?: "basic" | "enhanced";           // Complexity level
    enableCombat?: boolean;                // Combat capabilities
    enableResourceManagement?: boolean;   // Health/mana tracking
    enableAdvancedAI?: boolean;           // Complex AI behaviors
    
    // Behavior Settings
    isHostile?: boolean;                  // Attacks players on sight
    aggroRange?: number;                  // Detection distance
    patrolRadius?: number;                // Patrol area size
    retreatThreshold?: number;            // Health % to retreat at
    
    // Stats Overrides
    health?: number;                      // Override template health
    walkSpeed?: number;                   // Override movement speed
    // ... additional overrides
}
```

### Configuration Examples

#### Peaceful Villager
```typescript
{
    mode: "basic",
    enableCombat: false,
    isHostile: false,
    patrolRadius: 10
}
```

#### Elite Guard
```typescript
{
    mode: "enhanced",
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: false,        // Only attacks when attacked
    aggroRange: 20,
    health: 200,
    retreatThreshold: 0.1    // Fights to near death
}
```

#### Raid Boss
```typescript
{
    mode: "enhanced",
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: true,
    aggroRange: 30,
    health: 500,
    retreatThreshold: 0      // Never retreats
}
```

## 🔄 **Migration Guide**

### From Legacy Services

#### Phase 1: Parallel Testing
- Keep existing NPCs on old services
- Test new NPCs with unified service
- Compare performance and behavior

#### Phase 2: Gradual Migration
```typescript
// Old way (still works)
const oldNPC = NPCServiceInstance.SpawnNPC("goblin", position);

// New way (recommended)
const newNPC = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, {
    mode: "basic"  // Equivalent to old service
});
```

#### Phase 3: Full Transition
- Convert all NPCs to unified service
- Remove old service imports
- Clean up legacy code

### Backward Compatibility
- ✅ `NPCServiceInstance` still available
- ✅ `EnhancedNPCServiceInstance` still available  
- ✅ No breaking changes to existing code
- ✅ Migration helpers provided

## 📊 **Implementation Status**

### ✅ Completed Features
- **Unified Service Architecture** - Single service handles all NPC types
- **Configuration System** - Feature flags for basic/enhanced modes
- **Template System** - Goblin, skeleton, guard templates
- **Combat Integration** - Full SSEntity compatibility
- **AI System** - State machine with 6 behavioral states
- **Resource Management** - Health, mana, stamina tracking
- **Migration Support** - Backward compatibility maintained

### 🔄 Current State
- **Service**: `unified-npc-service.ts` (792 lines, production ready)
- **Demo**: `unified-npc-demo.server.ts` (comprehensive testing)
- **Documentation**: Complete API reference and guides
- **Testing**: Successfully spawns and manages mixed NPC configurations

### 🎯 Recommended Next Steps
1. **Performance Testing**: Spawn 50+ NPCs with mixed configurations
2. **Gradual Adoption**: Use unified service for new NPCs
3. **Monitor Statistics**: Use `GetStats()` to track usage
4. **Optimize Templates**: Adjust based on performance needs
5. **Plan Migration**: Set timeline for converting existing NPCs

### 📈 Performance Recommendations
- **80% Basic Mode**: For background/ambient NPCs
- **20% Enhanced Mode**: For important/combat NPCs
- **Monitor Stats**: Check performance regularly
- **Scale Appropriately**: Only enable needed features

## 🎉 **Success Metrics**

✅ **Build Status**: Successfully compiles  
✅ **Feature Parity**: Both basic and enhanced functionality  
✅ **Performance**: Configurable complexity scaling  
✅ **Compatibility**: Works with existing systems  
✅ **Documentation**: Complete guide provided  
✅ **Migration Path**: Smooth transition available  

The unified NPC service is ready for production use! 🚀

---

**Related Documentation:**
- [Unified NPC Service API](api/unified-npc-service.md) - Technical API reference
- [Enhanced NPC Service API](api/enhanced-npc-service.md) - Legacy service documentation
- [NPC Integration Guide](guides/npc-integration.md) - Usage patterns and examples
