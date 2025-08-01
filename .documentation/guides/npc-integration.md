# NPC Service Integration Guide

## Overview

**Important**: As of August 2025, we now have a **Unified NPC Service** that combines both basic and enhanced functionality. For new projects, use the Unified NPC Service for better performance and flexibility.

### Service Options

1. **✅ Unified NPC Service** (Recommended) - Feature-configurable with basic/enhanced modes
2. **🔄 Enhanced NPC Service** (Legacy) - Full-featured combat NPCs  
3. **🔄 Basic NPC Service** (Legacy) - Simple lightweight NPCs

See: **[Unified NPC Service API](.documentation/api/unified-npc-service.md)** for complete documentation.

## Quick Start - Unified Service

```typescript
import { UnifiedNPCServiceInstance } from "server/services";

// Lightweight village NPC
const villager = UnifiedNPCServiceInstance.SpawnNPC("guard", position, {
    mode: "basic",
    enableCombat: false,
    isHostile: false
});

// Full combat enemy
const enemy = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, {
    mode: "enhanced", 
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: true
});
```

## Legacy Enhanced NPC Service

The **Enhanced NPC Service** (Phase 2) provides combat-ready NPCs with full SSEntity compatibility and deep integration with your game's combat and ability systems.

## Key Features

- ✅ **Full SSEntity Compatibility**: NPCs are proper SSEntity objects with all body parts
- ✅ **Combat System Integration**: NPCs register as combatants and can participate in combat
- ✅ **Resource System Integration**: NPCs have health, mana, and stamina management
- ✅ **Enhanced AI**: Intelligent behaviors including ability usage and combat tactics
- ✅ **Model Catalog Integration**: Easy spawning using the centralized model catalog

## Usage

### Basic NPC Spawning

```typescript
import { EnhancedNPCServiceInstance } from "server/services";

// Spawn a basic NPC
const npc = EnhancedNPCServiceInstance.SpawnNPC(
    "goblin", 
    new Vector3(100, 5, 100)
);

// Spawn with custom configuration
const configuredNPC = EnhancedNPCServiceInstance.SpawnNPC(
    "skeleton", 
    new Vector3(100, 5, 120),
    {
        health: 150,        // Custom health (overrides template default)
        aggroRange: 25,     // Larger detection area
        isHostile: true,    // Override template hostility
        level: 10           // Higher level NPC
    }
);
```

### Available NPC Types

- **Goblin**: "goblin" - Basic damage dealer with melee attacks
- **Skeleton**: "skeleton" - Mage with Soul-Drain ability
- **Guard**: "guard" - Tank with high health, typically non-hostile

### NPC Management

```typescript
// Check if NPC exists
const npcExists = EnhancedNPCServiceInstance.NPCExists("npc_001");

// Get NPC by ID
const npc = EnhancedNPCServiceInstance.GetNPC("npc_001");

// Force NPC to attack a target
const player = Players.GetPlayerFromCharacter(someCharacter);
if (player) {
    EnhancedNPCServiceInstance.ForceNPCAttack("npc_001", player.Character as SSEntity);
}

// Change NPC AI state
EnhancedNPCServiceInstance.SetAIState("npc_001", "combat");

// Remove NPC
EnhancedNPCServiceInstance.DespawnNPC("npc_001");

// Get all NPCs
const allNPCs = EnhancedNPCServiceInstance.GetAllNPCs();
```

### AI States

NPCs automatically transition between these states:

- **"idle"**: Standing and occasionally looking around
- **"patrol"**: Walking around within wander radius
- **"combat"**: Actively attacking detected targets
- **"pursuit"**: Chasing targets that moved out of attack range
- **"retreat"**: Moving away when health is low
- **"dead"**: NPC has died and will be cleaned up

### Combat Integration Benefits

#### For Player Abilities

- NPCs now work properly as targets for player abilities
- All ability types (Melee, Soul-Drain, Ice-Rain, Earthquake) can affect NPCs
- NPCs take proper damage and respond to combat effects

#### NPC Combat Capabilities

- NPCs can use abilities against players and other NPCs
- Intelligent targeting and ability selection
- Proper resource management (mana/stamina usage)
- Retreat behavior when health is low

### Configuration Options

```typescript
interface NPCConfig {
    health?: number;           // Override base health
    aggressionLevel?: number;  // 0.0 (passive) to 1.0 (very aggressive)
    wanderRadius?: number;     // How far NPC will patrol
    detectionRadius?: number;  // How far NPC can detect targets
    attackRadius?: number;     // How close NPC must be to attack
}
```

### Integration with Existing Services

#### With Combat Service

```typescript
// NPCs automatically register with combat system
// They can be targeted by combat abilities
// They participate in combat mechanics
```

#### With Resource Service

```typescript
// NPCs have health/mana/stamina automatically managed
// They can use abilities that cost resources
// Health regeneration and resource management work
```

#### With Ability Service

```typescript
// NPCs can cast abilities from the ability catalog
// Ability cooldowns and resource costs are enforced
// Smart ability selection based on range and situation
```

## Upgrading from Phase 1

### Replace Basic NPCs

If you were using the basic `NPCService`, replace with:

**Old:**

```typescript
import { NPCServiceInstance } from "server/services";
const npc = NPCServiceInstance.SpawnNPC("BloodTunic", position);
```

**New:**

```typescript
import { EnhancedNPCServiceInstance } from "server/services";
const npc = EnhancedNPCServiceInstance.SpawnNPC("BloodTunic", position);
```

### Benefits of Upgrading

1. **Player abilities now work on NPCs** - Major functionality gain
2. **NPCs can fight back with abilities** - More engaging gameplay
3. **Proper resource management** - More realistic NPC behavior
4. **Better AI and combat tactics** - Smarter NPCs

## Debugging and Monitoring

### Console Output

Enhanced NPCs provide detailed console logging with emojis:

- 🏗️ NPC creation and model loading
- ⚔️ Combat registrations and attacks
- 💙 Resource system integration
- 🧠 AI state changes
- 💀 NPC death and cleanup

### Common Issues

1. **NPCs not taking damage**: Ensure they're registered with ResourceService
2. **Abilities not working**: Check combat system registration
3. **Poor AI behavior**: Adjust aggression and radius settings
4. **Model loading failures**: Verify model exists in ReplicatedStorage

## Performance Considerations

- Enhanced NPCs use more resources than basic NPCs due to full SSEntity structure
- AI behaviors run on heartbeat connections - monitor performance with many NPCs
- Combat integration adds network traffic for ability effects
- Consider spawning limits based on server capacity

## Next Steps

- Test NPC spawning and basic AI behavior
- Verify player abilities now work against NPCs
- Experiment with different NPC configurations
- Monitor performance with multiple NPCs
- Consider implementing NPC groups and formations for advanced scenarios
