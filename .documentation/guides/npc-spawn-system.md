# NPC Spawn Area System - Complete Guide

## Overview

The NPC Spawn Area System provides advanced NPC management with automatic respawning, population limits, and intelligent spawning based on player presence. It integrates seamlessly with your existing UnifiedNPCService and ZoneService.

## 🎯 Key Features

- **Automatic Respawning**: NPCs respawn after death with configurable timers
- **Population Control**: Enforce minimum and maximum NPC limits per area
- **Player-Based Spawning**: Only spawn NPCs when players are nearby (optional)
- **Zone Integration**: Link spawn areas to your zone system
- **Weighted Random Selection**: Control which NPCs spawn more frequently
- **Dynamic Scaling**: Adjust spawning based on player activity
- **Statistics Monitoring**: Track spawn area performance and health

## 🏗️ Basic Setup

### 1. Initialize the Service

```typescript
import { NPCSpawnManagerInstance } from "server/services";

// In your main server script
NPCSpawnManagerInstance.initialize();
```

### 2. Create a Basic Spawn Area

```typescript
import { NPCSpawnManagerInstance } from "server/services";

```

Example output:

```typescript

NPCSpawnManagerInstance.createSpawnArea(spawnConfig);
```

## 🔧 Configuration Options

### SpawnAreaConfig Interface

```typescript
interface SpawnAreaConfig {
    id: string;                    // Unique identifier
    displayName: string;           // Human-readable name
    npcConfigs: NPCSpawnConfig[];  // What NPCs can spawn
    maxNPCs: number;              // Population cap
    minNPCs: number;              // Minimum population
    respawnTimeSeconds: number;    // Base respawn delay
    respawnVariance?: number;      // Random respawn variance
    spawnRadius: number;          // Spawn area size
    centerPosition: Vector3;       // Where to spawn around
    linkedZone?: ZoneKey;         // Optional zone integration
    requirePlayerPresence?: boolean; // Player-based spawning
    playerDetectionRange?: number;   // Player detection radius
    dynamicSpawning?: boolean;       // Zone-based activation
}
```

### NPCSpawnConfig Options

```typescript
interface NPCSpawnConfig {
    npcType: string;              // NPC template key
    config?: NPCConfig;           // Override NPC settings
    weight?: number;              // Spawn probability weight
    minPlayerLevel?: number;      // Level requirements
    maxPlayerLevel?: number;      // Level requirements
}
```

## 📋 Common Patterns

### 1. High-Activity Combat Area

```typescript
const combatZone = {
    id: "pvp_arena_spawns",
    displayName: "PvP Arena Spawns",
    npcConfigs: [
        {
            npcType: "goblin",
            weight: 50,
            config: {
                mode: "enhanced",
                enableCombat: true,
                isHostile: true,
                aggroRange: 25,
                health: 120,
            }
        },
        {
            npcType: "skeleton",
            weight: 30,
            config: {
                mode: "enhanced",
                enableCombat: true,
                enableAdvancedAI: true,
                isHostile: true,
                aggroRange: 30,
                health: 180,
            }
        }
    ],
    maxNPCs: 10,
    minNPCs: 6,
    respawnTimeSeconds: 20,    // Fast respawn for active combat
    respawnVariance: 5,
    spawnRadius: 40,
    centerPosition: new Vector3(0, 10, 0),
    requirePlayerPresence: true,
    playerDetectionRange: 80,
    dynamicSpawning: true,
};
```

### 2. Peaceful Village Guards

```typescript
const villageGuards = {
    id: "village_center_guards",
    displayName: "Village Guards",
    npcConfigs: [
        {
            npcType: "guard",
            weight: 100,
            config: {
                mode: "enhanced",
                enableCombat: true,
                isHostile: false,      // Only attack when attacked
                aggroRange: 15,
                health: 300,
                retreatThreshold: 0.1, // Fight to near death
            }
        }
    ],
    maxNPCs: 4,
    minNPCs: 2,
    respawnTimeSeconds: 180,   // Slow respawn for guards
    respawnVariance: 60,
    spawnRadius: 25,
    centerPosition: new Vector3(50, 5, 50),
    requirePlayerPresence: false, // Always active
    dynamicSpawning: false,
};
```

### 3. Training Area for New Players

```typescript
const trainingArea = {
    id: "newbie_training",
    displayName: "Training Grounds",
    npcConfigs: [
        {
            npcType: "blood_toad",
            weight: 100,
            config: {
                mode: "basic",        // Simple AI
                enableCombat: false,  // No combat abilities
                isHostile: false,
                health: 50,           // Low health for training
                patrolRadius: 10,
            }
        }
    ],
    maxNPCs: 8,
    minNPCs: 4,
    respawnTimeSeconds: 10,    // Very fast respawn
    respawnVariance: 3,
    spawnRadius: 20,
    centerPosition: new Vector3(-50, 5, -50),
    requirePlayerPresence: true,
    playerDetectionRange: 60,
    dynamicSpawning: true,
};
```

### 4. Boss Encounter Area

```typescript
const bossLair = {
    id: "skeleton_king_lair",
    displayName: "Skeleton King's Lair",
    npcConfigs: [
        {
            npcType: "skeleton",
            weight: 10,            // Rare boss
            config: {
                mode: "enhanced",
                enableCombat: true,
                enableAdvancedAI: true,
                isHostile: true,
                aggroRange: 40,
                health: 800,       // Boss-level health
                level: 20,
                retreatThreshold: 0, // Never retreats
            }
        },
        {
            npcType: "goblin",
            weight: 90,            // Common minions
            config: {
                mode: "enhanced",
                enableCombat: true,
                isHostile: true,
                aggroRange: 25,
                health: 150,
                level: 10,
            }
        }
    ],
    maxNPCs: 5,
    minNPCs: 1,
    respawnTimeSeconds: 300,   // Long respawn for boss fights
    respawnVariance: 120,
    spawnRadius: 35,
    centerPosition: new Vector3(200, 10, 200),
    linkedZone: "BossArena",   // Link to zone system
    requirePlayerPresence: true,
    playerDetectionRange: 150,
    dynamicSpawning: true,
};
```

## 🔗 Zone Integration

Link spawn areas to your zone system for dynamic activation:

```typescript
// Spawn area activates when players enter the zone
const zoneLinkedSpawns = {
    id: "dungeon_entrance",
    displayName: "Dungeon Entrance",
    // ... other config
    linkedZone: "DungeonZone",      // Must match your ZoneCatalog
    dynamicSpawning: true,          // Enable zone-based control
};

NPCSpawnManagerInstance.createSpawnArea(zoneLinkedSpawns);
```

## 🎛️ Management Functions

### Area Control

```typescript
// Activate/deactivate spawn areas
NPCSpawnManagerInstance.setSpawnAreaActive("goblin_camp_01", false);
NPCSpawnManagerInstance.setSpawnAreaActive("goblin_camp_01", true);

// Remove spawn areas
NPCSpawnManagerInstance.removeSpawnArea("goblin_camp_01");
```

### Statistics and Monitoring

```typescript
// Get stats for specific area
const areaStats = NPCSpawnManagerInstance.getSpawnAreaStats("goblin_camp_01");
print("Area Stats:", areaStats);

// Get all spawn area statistics
const allStats = NPCSpawnManagerInstance.getAllSpawnAreaStats();
print("All Spawn Areas:", allStats);
```

Example output:

```typescript
```

Example output:
```typescript
{
    totalAreas: 4,
    activeAreas: 3,
    totalActiveNPCs: 18,
    totalPendingRespawns: 5,
    areas: {
        goblin_camp_01: {
            id: "goblin_camp_01",
            displayName: "Goblin Camp",
            isActive: true,
            activeNPCs: 6,
            maxNPCs: 8,
            minNPCs: 4,
            pendingRespawns: 2,
            linkedZone: undefined
        }
        // ... other areas
    }
}
```

## 🚀 Quick Start Examples

Use the provided example configurations:

```typescript
import { initializeExampleSpawnAreas } from "server/services/npc-spawn-examples";

// Initialize with pre-configured spawn areas
initializeExampleSpawnAreas();
```

This sets up:

- Goblin camps around spawn points
- Training areas for new players  
- Village guards for protection
- Boss areas with zone integration

## 🔧 Performance Considerations

### Best Practices

1. **Limit Total NPCs**: Keep total active NPCs under 50 for best performance
2. **Use Player Presence**: Enable `requirePlayerPresence` for distant areas
3. **Appropriate Respawn Times**: Don't make respawn times too short (minimum 10 seconds)
4. **Monitor Statistics**: Check spawn area stats regularly to identify issues
5. **Basic vs Enhanced**: Use basic mode NPCs for background/ambient spawns

### Performance Settings

```typescript
// High-performance configuration
const efficientSpawns = {
    // ... basic config
    maxNPCs: 4,                    // Lower population
    minNPCs: 2,
    respawnTimeSeconds: 45,        // Longer respawn times
    requirePlayerPresence: true,    // Only spawn when needed
    playerDetectionRange: 80,      // Smaller detection range
};
```

## 🐛 Troubleshooting

### Common Issues

1. **NPCs not spawning**: Check that NPC types exist in UnifiedNPCService templates
2. **Performance problems**: Reduce maxNPCs or increase respawn times
3. **NPCs not respawning**: Verify the NPCDefeated signal is being emitted
4. **Zone integration not working**: Ensure zone keys match your ZoneCatalog

### Debug Information

Enable detailed logging by checking spawn area statistics:

```typescript
// Monitor spawn health every minute
RunService.Heartbeat.Connect(() => {
    if (tick() % 60 < 1) { // Every 60 seconds
        const stats = NPCSpawnManagerInstance.getAllSpawnAreaStats();
        print("Spawn Area Health Check:", stats);
    }
});
```

## 🎯 Integration with Your Game

This system is designed to work seamlessly with your existing:

- **UnifiedNPCService**: Uses your existing NPC templates and configurations
- **ZoneService**: Integrates with zone enter/exit events
- **SignalService**: Communicates through your existing signal system
- **Combat System**: NPCs automatically integrate with combat when defeated

The spawn manager respects all your existing NPC configurations and simply adds intelligent spawning and population management on top of your current systems.
