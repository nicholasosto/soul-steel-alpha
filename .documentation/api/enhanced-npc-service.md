# Enhanced NPC Service API Reference

**Version**: Phase 2  
**Last Updated**: July 31, 2025  
**Service**: `EnhancedNPCServiceInstance`

## Overview

The Enhanced NPC Service provides combat-ready NPCs with full SSEntity compatibility, advanced AI behaviors, and seamless integration with the game's combat and resource systems.

## Classes

### EnhancedNPCService

Singleton service class that manages all NPCs in the game.

**Access**: `EnhancedNPCServiceInstance` (exported singleton)

## Types and Interfaces

### NPCType

```typescript
export type NPCType = "goblin" | "skeleton" | "guard";
```

Available NPC types with distinct behaviors and abilities.

### NPCAIState

```typescript
export type NPCAIState = "idle" | "patrol" | "combat" | "pursuit" | "retreat" | "dead";
```

AI states that NPCs transition between based on conditions and player interactions.

### NPCEntity

```typescript
export interface NPCEntity extends SSEntity {
    // NPC-specific properties
    npcId: string;
    npcType: NPCType;
    aiState: NPCAIState;
    level: number;
    isActive: boolean;
    spawnTime: number;
    homePosition: Vector3;
    lastActionTime: number;

    // Combat integration
    isCombatant: boolean;
    currentTarget?: SSEntity;
    aggroRange: number;

    // AI behavior
    behaviorState: {
        lastDamageTime: number;
        lastAbilityTime: number;
        retreatThreshold: number;
    };
}
```

Complete NPC entity that extends SSEntity for full combat compatibility.

### NPCConfig

```typescript
export interface NPCConfig {
    level?: number;
    health?: number;
    aggroRange?: number;
    isHostile?: boolean;
}
```

Configuration options for customizing NPC spawning behavior.

## Public Methods

### SpawnNPC

```typescript
public SpawnNPC(npcType: NPCType, position: Vector3, config?: NPCConfig): NPCEntity | undefined
```

Spawns an enhanced NPC with full combat integration.

**Parameters:**
- `npcType`: Type of NPC to spawn ("goblin", "skeleton", "guard")
- `position`: World position for NPC spawn
- `config`: Optional configuration overrides

**Returns:** NPCEntity if successful, undefined if failed

**Example:**
```typescript
// Basic spawn
const goblin = EnhancedNPCServiceInstance.SpawnNPC("goblin", new Vector3(100, 5, 100));

// Custom configuration
const toughSkeleton = EnhancedNPCServiceInstance.SpawnNPC("skeleton", new Vector3(0, 5, 0), {
    health: 200,
    level: 10,
    aggroRange: 30
});
```

### DespawnNPC

```typescript
public DespawnNPC(npcId: string): boolean
```

Removes an NPC from the game and cleans up all references.

**Parameters:**
- `npcId`: Unique identifier of the NPC to remove

**Returns:** true if successful, false if NPC not found

### SetAIState

```typescript
public SetAIState(npcId: string, state: NPCAIState): boolean
```

Manually sets the AI state of an NPC.

**Parameters:**
- `npcId`: Unique identifier of the NPC
- `state`: New AI state to set

**Returns:** true if successful, false if NPC not found

### GetNPC

```typescript
public GetNPC(npcId: string): NPCEntity | undefined
```

Retrieves an NPC by its unique identifier.

**Parameters:**
- `npcId`: Unique identifier of the NPC

**Returns:** NPCEntity if found, undefined if not found

### GetAllNPCs

```typescript
public GetAllNPCs(): NPCEntity[]
```

Gets all active NPCs in the game.

**Returns:** Array of all active NPCEntity objects

### GetNPCsInRange

```typescript
public GetNPCsInRange(position: Vector3, range: number): NPCEntity[]
```

Gets all NPCs within a specified range of a position.

**Parameters:**
- `position`: Center position for range search
- `range`: Maximum distance to include NPCs

**Returns:** Array of NPCEntity objects within range

### ForceNPCAttack

```typescript
public ForceNPCAttack(npcId: string, target: SSEntity): boolean
```

Forces an NPC to attack a specific target (useful for testing/admin commands).

**Parameters:**
- `npcId`: Unique identifier of the NPC
- `target`: Target entity to attack

**Returns:** true if successful, false if failed

## NPC Templates

### Goblin

```typescript
{
    modelKey: "goblin",
    displayName: "Goblin Warrior",
    baseHealth: 80,
    baseMana: 40,
    baseLevel: 3,
    walkSpeed: 12,
    aggroRange: 15,
    isHostile: true,
    availableAbilities: ["Melee"],
    combatRole: "damage",
    retreatThreshold: 0.2
}
```

Fast, aggressive melee fighter that retreats at 20% health.

### Skeleton

```typescript
{
    modelKey: "skeleton",
    displayName: "Skeleton Mage",
    baseHealth: 120,
    baseMana: 80,
    baseLevel: 5,
    walkSpeed: 10,
    aggroRange: 20,
    isHostile: true,
    availableAbilities: ["Melee", "Soul-Drain"],
    combatRole: "caster",
    retreatThreshold: 0.15
}
```

Magical caster with both melee and ranged abilities.

### Guard

```typescript
{
    modelKey: "guard",
    displayName: "Steam Guard",
    baseHealth: 200,
    baseMana: 60,
    baseLevel: 8,
    walkSpeed: 14,
    aggroRange: 12,
    isHostile: false,
    availableAbilities: ["Melee"],
    combatRole: "tank",
    retreatThreshold: 0.1
}
```

Durable tank unit, typically non-hostile unless configured otherwise.

## AI State Machine

### State Transitions

```
idle → combat (when target detected)
combat → pursuit (when target moves out of range)
pursuit → combat (when close enough to target)
combat → retreat (when health below threshold)
retreat → idle (when health recovers)
any → dead (when health reaches 0)
```

### State Behaviors

**idle**: Occasional looking around, waiting for targets
**patrol**: Moving around within home area
**combat**: Active combat with abilities and attacks
**pursuit**: Chasing targets that moved away
**retreat**: Moving away from danger when low on health
**dead**: Inactive, scheduled for cleanup

## Integration Points

### CombatService Integration

NPCs automatically register with CombatService when marked as hostile, enabling:
- Basic attack execution through `CombatServiceInstance.ExecuteBasicAttack()`
- Damage calculation and health management
- Combat session participation

### ResourceService Integration

NPCs use ResourceService for:
- Health, mana, stamina tracking
- Resource initialization via `ResourceServiceInstance.initializeEntityHealth()`
- Automatic resource management and regeneration

### AbilityService Integration

NPCs can use abilities from the ability catalog:
- Melee attacks for close combat
- Soul-Drain for ranged magical attacks
- Proper resource consumption and cooldown management

## Event Handling

### Death Handling

When an NPC dies:
1. AI state set to "dead"
2. Unregistered from CombatService
3. 3-second cleanup delay
4. Automatic despawning

### Combat Events

NPCs respond to:
- Taking damage (potential retreat trigger)
- Target detection (combat state activation)
- Target loss (return to patrol/idle)
- Health recovery (return from retreat)

## Performance Considerations

### Resource Usage

- Enhanced NPCs use RunService.Heartbeat for AI updates
- Each NPC maintains combat and resource state
- Model cloning from NPC_MODEL_CATALOG

### Scalability

- Recommended limit: 10-20 NPCs for optimal performance
- Monitor server memory usage with large NPC counts
- Consider batching AI updates for many NPCs

## Error Handling

### Common Failure Points

1. **Model Loading**: Invalid model keys or missing models
2. **SSEntity Validation**: Missing required body parts
3. **Service Registration**: Combat or Resource service failures
4. **Network Issues**: Model parenting or position problems

### Debugging Features

Console logging with emojis for:
- 🏗️ NPC creation and model loading
- ⚔️ Combat registrations and attacks
- 💙 Resource system integration
- 🧠 AI state changes
- 💀 NPC death and cleanup
- 🗑️ Cleanup and despawning

## Usage Examples

### Basic NPC Spawning

```typescript
import { EnhancedNPCServiceInstance } from "server/services";

// Spawn different NPC types
const goblin = EnhancedNPCServiceInstance.SpawnNPC("goblin", new Vector3(100, 5, 100));
const skeleton = EnhancedNPCServiceInstance.SpawnNPC("skeleton", new Vector3(150, 5, 100));
const guard = EnhancedNPCServiceInstance.SpawnNPC("guard", new Vector3(200, 5, 100));
```

### Custom Configuration

```typescript
// High-level hostile guard
const eliteGuard = EnhancedNPCServiceInstance.SpawnNPC("guard", new Vector3(0, 5, 0), {
    health: 300,
    level: 15,
    aggroRange: 25,
    isHostile: true
});
```

### NPC Management

```typescript
// Check all NPCs
const allNPCs = EnhancedNPCServiceInstance.GetAllNPCs();
print(`Active NPCs: ${allNPCs.length}`);

// Find NPCs near a position
const nearbyNPCs = EnhancedNPCServiceInstance.GetNPCsInRange(new Vector3(100, 5, 100), 50);

// Force combat for testing
if (nearbyNPCs.length > 0 && Players.LocalPlayer.Character) {
    EnhancedNPCServiceInstance.ForceNPCAttack(
        nearbyNPCs[0].npcId, 
        Players.LocalPlayer.Character as SSEntity
    );
}
```

### AI State Management

```typescript
// Manually control NPC behavior
const npc = EnhancedNPCServiceInstance.GetNPC("npc_goblin_1");
if (npc) {
    // Make NPC patrol
    EnhancedNPCServiceInstance.SetAIState(npc.npcId, "patrol");
    
    // Force retreat
    EnhancedNPCServiceInstance.SetAIState(npc.npcId, "retreat");
}
```

## Migration from Phase 1

### API Changes

**Old Phase 1:**
```typescript
import { NPCServiceInstance } from "server/services";
const npc = NPCServiceInstance.SpawnNPC("BloodTunic", position);
```

**New Phase 2:**
```typescript
import { EnhancedNPCServiceInstance } from "server/services";
const npc = EnhancedNPCServiceInstance.SpawnNPC("goblin", position);
```

### Breaking Changes

1. **NPC Type Names**: Changed from model names to semantic types
2. **Configuration Structure**: Simplified config interface
3. **Service Registration**: Automatic combat/resource registration
4. **AI Behaviors**: More sophisticated state machine

### Benefits of Migration

1. **Combat Compatibility**: Player abilities now work on NPCs
2. **Enhanced AI**: Smarter behaviors and tactical decisions
3. **Resource Management**: Proper health/mana/stamina systems
4. **Better Performance**: Optimized update loops and state management
