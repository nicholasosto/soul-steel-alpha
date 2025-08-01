# Zone System Setup Guide

This guide explains how to set up and use the configured zone system with @rbxts/zone-plus in your Soul Steel Alpha project.

## Overview

The zone system follows your existing catalog pattern with:
- **Zone Keys**: Type-safe identifiers for zones
- **Zone Meta**: Configuration interfaces and types  
- **Zone Catalog**: Centralized zone configurations
- **Zone Service**: Server-side zone management
- **Client Zone Manager**: Client-side zone management

## Quick Start

### 1. Basic Workspace Setup

Create the following folder structure in your Roblox Studio workspace:

```
Workspace
├── ZoneContainers (Folder)
│   ├── PlayerSpawn (Model/Folder with parts)
│   ├── SafeZone (Model/Folder with parts)
│   ├── ArenaZone (Model/Folder with parts)
│   └── ShopZone (Model/Folder with parts)
└── ClientZoneContainers (Folder)
    ├── AmbientZone (Model/Folder with parts)
    ├── MusicZone (Model/Folder with parts)
    └── LightingZone (Model/Folder with parts)
```

### 2. Server Setup

In your main server script, initialize the zones:

```typescript
import { ZoneServiceInstance } from "server/services";

// Initialize all zones from workspace containers
ZoneServiceInstance.initializeWorldZones();

// Or create specific zones programmatically
ZoneServiceInstance.createZoneFromRegion(
    "BuffZone", 
    new CFrame(0, 50, 0), 
    new Vector3(30, 20, 30)
);
```

### 3. Client Setup

The client zone manager initializes automatically when imported:

```typescript
import { ClientZoneManagerInstance } from "client/managers/ClientZoneManager";

// Check if local player is in a zone
if (ClientZoneManagerInstance.isInZone("MusicZone")) {
    print("In music zone!");
}

// Get all current zones
const currentZones = ClientZoneManagerInstance.getCurrentZones();
```

## Zone Configuration

### Adding New Zones

1. **Add to Zone Keys** (`src/shared/keys/zone-keys.ts`):
```typescript
export const ZONE_KEYS = [
    // ... existing zones
    "MyCustomZone",
] as const;
```

2. **Add to Zone Catalog** (`src/shared/catalogs/zone-catalog.ts`):
```typescript
export const ZoneCatalog: Record<ZoneKey, ZoneMeta> = {
    // ... existing zones
    MyCustomZone: {
        zoneKey: "MyCustomZone",
        displayName: "My Custom Zone",
        description: "A custom zone for special effects",
        category: "special",
        accuracy: "High",
        enterDetection: "Centre",
        exitDetection: "Centre",
        priority: 5,
        onPlayerEnter: (player: Player, zone: IZone) => {
            print(`${player.Name} entered custom zone`);
            // Add your custom logic here
        },
        onPlayerExit: (player: Player, zone: IZone) => {
            print(`${player.Name} left custom zone`);
            // Add your custom logic here
        },
    },
};
```

3. **Create the physical zone** in Roblox Studio workspace under `ZoneContainers/MyCustomZone`

## Zone Categories

- **`safe`**: Protected areas (spawn, safe zones, town centers)
- **`combat`**: Combat areas (arenas, PvP zones)
- **`interactive`**: Areas with NPCs or special functions
- **`environment`**: Client-side atmospheric zones
- **`special`**: Unique mechanics (teleport, buff/debuff zones)
- **`admin`**: Administrative or debug zones

## Zone Properties

### Detection Settings
- **`accuracy`**: `"High"` | `"Medium"` | `"Low"` | `"Automatic"`
- **`enterDetection`**: `"Centre"` | `"WholeBody"` | `"Automatic"`
- **`exitDetection`**: `"Centre"` | `"WholeBody"` | `"Automatic"`

### Zone Grouping
- **`settingsGroup`**: Groups zones for coordinated behavior
- **`priority`**: Higher priority zones take precedence when overlapping

### Visibility
- **`serverOnly`**: Only exists on server (default for most zones)
- **`clientOnly`**: Only exists on client (environment zones)

## Event Handlers

### Server Events
```typescript
onPlayerEnter?: (player: Player, zone: IZone) => void;
onPlayerExit?: (player: Player, zone: IZone) => void;
onItemEnter?: (item: BasePart | Model, zone: IZone) => void;
onItemExit?: (item: BasePart | Model, zone: IZone) => void;
```

### Client Events
```typescript
onLocalPlayerEnter?: (zone: IZone) => void;
onLocalPlayerExit?: (zone: IZone) => void;
```

## Advanced Usage

### Dynamic Zone Management

```typescript
// Create zone at runtime
ZoneServiceInstance.createZoneFromRegion(
    "DynamicZone",
    somePosition,
    someSize
);

// Enable/disable zones
ZoneServiceInstance.setZoneActive("PvPZone", false);

// Get zone statistics
const stats = ZoneServiceInstance.getZoneStats();

// Monitor player zones
const playerZones = ZoneServiceInstance.getPlayerZones(player);
```

### Custom Properties

Add custom data to zone configurations:

```typescript
MyZone: {
    // ... standard properties
    customProperties: {
        musicId: "rbxassetid://1234567890",
        volume: 0.5,
        buffMultiplier: 1.5,
        teleportDestination: new Vector3(0, 100, 0),
    },
},
```

Access in event handlers:

```typescript
onPlayerEnter: (player: Player, zone: IZone) => {
    const config = getZoneConfig("MyZone");
    const musicId = config?.customProperties?.musicId as string;
    // Play music with musicId
},
```

## Zone Groups

Group related zones for coordinated behavior:

```typescript
// All safe zones share the same group
SafeZone: {
    settingsGroup: "SafeZones",
    // ... other properties
},

PlayerSpawn: {
    settingsGroup: "SafeZones", 
    // ... other properties
},
```

Benefits:
- `onlyEnterOnceExitedAll`: Prevents entering multiple zones in the group simultaneously
- Coordinated zone transitions
- Shared zone behaviors

## Performance Tips

1. **Use appropriate accuracy**: `"Low"` for environment zones, `"High"` for important gameplay zones
2. **Limit client zones**: Only use client-only zones for atmospheric effects
3. **Group related zones**: Use settings groups for coordinated behavior
4. **Monitor zone statistics**: Use `getZoneStats()` to track performance

## Troubleshooting

### Zone not triggering
- Check that zone parts are in the "Default" collision group
- Verify zone accuracy and detection settings
- Ensure zone is active: `ZoneServiceInstance.setZoneActive(zoneKey, true)`

### Performance issues
- Reduce zone accuracy if possible
- Minimize the number of active zones
- Use client zones only for atmosphere, not gameplay

### Zone conflicts
- Use priority values to handle overlapping zones
- Consider using settings groups for coordinated zones
- Check zone categories and ensure proper separation

## Integration with Game Systems

### Combat System
```typescript
// In combat zones, enable PvP
onPlayerEnter: (player: Player, zone: IZone) => {
    CombatServiceInstance.enablePvP(player);
},
```

### Health System  
```typescript
// In rest zones, start healing
onPlayerEnter: (player: Player, zone: IZone) => {
    HealthServiceInstance.startRegeneration(player);
},
```

### Message System
```typescript
// Show zone entry messages
onPlayerEnter: (player: Player, zone: IZone) => {
    MessageServiceInstance.sendMessage(player, "Entered Safe Zone", "info");
},
```

This zone system provides a powerful, configurable foundation for location-based gameplay mechanics that scales with your game's complexity.
