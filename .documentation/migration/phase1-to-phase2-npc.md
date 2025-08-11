# Phase 1 NPC Service - Quick Start Guide

## Overview

The Phase 1 NPC Service provides **basic NPC spawning and simple AI behaviors** to get your Soul Steel Alpha game up and running with AI characters immediately. This is the foundation that we'll expand upon in future phases.

## ✅ What's Included in Phase 1

### Core Features
- **Basic NPC Spawning**: Spawn goblins, skeletons, and guards
- **Simple AI States**: Idle, patrol, and combat modes
- **Player Detection**: NPCs react when players are nearby
- **Movement System**: Basic patrolling and positioning
- **NPC Management**: Spawn, despawn, and query NPCs

### Available NPC Types
- **Goblin**: Low-level enemy (Level 3, 60 HP)
- **Skeleton**: Medium enemy (Level 5, 80 HP)  
- **Guard**: Strong ally (Level 8, 120 HP)

## 🚀 Quick Start

### 1. Import the Service
```typescript
import { NPCServiceInstance } from "server/services/npc-service";
```

### 2. Spawn Your First NPC
```typescript
// Spawn a goblin at position (0, 5, 0)
const goblin = NPCServiceInstance.SpawnNPC("goblin", new Vector3(0, 5, 0), {
    level: 5,
    health: 80
});

if (goblin) {
    print(`Spawned: ${goblin.npcId}`);
}
```

### 3. Control AI Behavior
```typescript
// Set the NPC to patrol mode
NPCServiceInstance.SetAIState(goblin.npcId, "patrol");

// Or set to idle mode
NPCServiceInstance.SetAIState(goblin.npcId, "idle");

// Combat mode (currently just stands still)
NPCServiceInstance.SetAIState(goblin.npcId, "combat");
```

### 4. Query NPCs
```typescript
// Get all active NPCs
const allNPCs = NPCServiceInstance.GetAllNPCs();
print(`Total NPCs: ${allNPCs.size()}`);

// Find NPCs near a player
const playerPos = player.Character.HumanoidRootPart.Position;
const nearbyNPCs = NPCServiceInstance.GetNPCsInRange(playerPos, 20);
print(`NPCs within 20 studs: ${nearbyNPCs.size()}`);

// Get specific NPC
const npc = NPCServiceInstance.GetNPC("npc_goblin_1");
if (npc) {
    print(`Found: ${npc.npcType}, Level ${npc.level}`);
}
```

## AI Behavior Details

### Idle State

### Patrol State

### Combat State

## 🔧 Current Limitations (Phase 1)

- **No Combat**: NPCs don't actually fight yet
- **Simple Models**: Basic colored blocks instead of detailed models
- **Basic AI**: Simple state machine, no complex behaviors
- **No Groups**: Each NPC acts independently
- **No Abilities**: NPCs can't use weapons or abilities yet

## 🚀 What's Coming Next

### Phase 2: Combat Integration

- NPCs will use your existing combat service
- Weapon selection and usage
- Ability casting (Melee, Soul-Drain, etc.)
- Health/damage integration

### Phase 3: Smart Behaviors

- Behavior trees for complex decision making
- Target selection and combat tactics
- Formation fighting and group coordination

### Phase 4: Advanced AI

- Learning AI that adapts to player behavior
- Dynamic difficulty scaling
- Complex group strategies

## 🛠️ Extending Phase 1

### Adding New NPC Types

```typescript
// In npc-service.ts, add to BASIC_NPC_TEMPLATES:
orc: {
    name: "Orc Warrior",
    baseHealth: 100,
    baseLevel: 6,
    walkSpeed: 8,
},
```

### Custom Spawn Configurations

```typescript
const powerfulGoblin = NPCServiceInstance.SpawnNPC("goblin", position, {
    level: 15,      // Much higher level
    health: 200     // Extra health
});
```

### Hooking into AI States

You can listen for AI state changes by modifying the `SetAIState` method to trigger events that your game systems can respond to.

## 🎉 Success

You now have working NPCs in your game! Players can walk around and see AI characters that react to their presence. This gives you a solid foundation to build upon as we add more sophisticated features in future phases.

**Ready for Phase 2?** The combat integration will make these NPCs actually dangerous! 🗡️
