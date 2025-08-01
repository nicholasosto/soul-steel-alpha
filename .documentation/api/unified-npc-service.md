# Unified NPC Service

A flexible, feature-configurable NPC system that combines basic and enhanced NPC functionality through configuration flags.

## Quick Start

```typescript
import { UnifiedNPCServiceInstance } from "server/services/unified-npc-service";

// Basic NPC (lightweight)
const villager = UnifiedNPCServiceInstance.SpawnNPC("guard", position, {
    mode: "basic",
    enableCombat: false,
    isHostile: false
});

// Enhanced combat NPC (full features)
const enemy = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, {
    mode: "enhanced",
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: true
});
```

## Configuration Options

### Core Settings
- `mode: "basic" | "enhanced"` - Base complexity level
- `level?: number` - NPC level (affects stats)
- `health?: number` - Override base health

### Feature Flags
- `enableCombat?: boolean` - Full combat system integration
- `enableResourceManagement?: boolean` - Health/mana/stamina tracking
- `enableAdvancedAI?: boolean` - Complex AI behaviors

### Combat Settings
- `aggroRange?: number` - Detection range for hostiles
- `isHostile?: boolean` - Will attack players
- `retreatThreshold?: number` - Health % to retreat (0.0-1.0)

### AI Behavior
- `patrolRadius?: number` - Distance from spawn to patrol
- `idleTime?: number` - Seconds between idle actions
- `actionTimeout?: number` - Seconds between AI decisions

## NPC Modes

### Basic Mode
- ✅ Minimal resource usage
- ✅ Simple AI (idle, patrol, basic combat)
- ✅ Perfect for background NPCs
- ❌ No combat system integration
- ❌ No resource management
- ❌ Limited AI behaviors

### Enhanced Mode
- ✅ Full SSEntity compatibility
- ✅ Combat system integration
- ✅ Resource management (health/mana/stamina)
- ✅ Advanced AI (pursuit, retreat, target selection)
- ✅ Ability usage and combo chains
- ⚠️ Higher resource usage

## Examples

### Village NPCs (Performance Focused)
```typescript
// Merchant - non-combat, minimal features
const merchant = UnifiedNPCServiceInstance.SpawnNPC("guard", position, {
    mode: "basic",
    enableCombat: false,
    enableResourceManagement: false,
    isHostile: false,
    level: 1
});

// Guard - basic patrol, no full combat
const guard = UnifiedNPCServiceInstance.SpawnNPC("guard", position, {
    mode: "basic",
    level: 5,
    patrolRadius: 15,
    isHostile: false
});
```

### Combat Encounters
```typescript
// Regular enemy
const goblin = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, {
    mode: "enhanced",
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: true,
    level: 3,
    aggroRange: 15,
    retreatThreshold: 0.25
});

// Boss enemy
const boss = UnifiedNPCServiceInstance.SpawnNPC("skeleton", position, {
    mode: "enhanced",
    enableCombat: true,
    enableResourceManagement: true,
    enableAdvancedAI: true,
    isHostile: true,
    level: 10,
    health: 500,
    aggroRange: 30,
    retreatThreshold: 0.1 // Tough boss!
});
```

### Mixed Configurations
```typescript
// Quest NPC - interactive but not combat
const questGiver = UnifiedNPCServiceInstance.SpawnNPC("guard", position, {
    mode: "enhanced", // For interaction capabilities
    enableCombat: false, // But no combat
    enableResourceManagement: true, // For quest requirements
    enableAdvancedAI: false, // Simple behavior
    isHostile: false
});
```

## API Reference

### Core Methods
- `SpawnNPC(type, position, config?)` - Create an NPC
- `DespawnNPC(npcId)` - Remove an NPC
- `SetAIState(npcId, state)` - Change AI behavior
- `GetNPC(npcId)` - Get NPC by ID
- `GetAllNPCs()` - Get all active NPCs
- `GetNPCsInRange(position, range)` - Find nearby NPCs

### Enhanced Mode Only
- `ForceNPCAttack(npcId, target)` - Force combat
- Combat system integration
- Resource system integration
- Advanced AI behaviors

### Utility
- `GetStats()` - Service statistics

## AI States

- `idle` - Standing still, occasional look-around
- `patrol` - Moving around spawn area
- `combat` - Engaging targets
- `pursuit` - Chasing fleeing targets (enhanced only)
- `retreat` - Running away when low health (enhanced only)
- `dead` - NPC has been defeated

## Migration from Old Services

### From Basic NPC Service
```typescript
// Old way
import { NPCServiceInstance } from "server/services/npc-service";
const npc = NPCServiceInstance.SpawnNPC("goblin", position, { level: 3 });

// New way
import { UnifiedNPCServiceInstance } from "server/services/unified-npc-service";
const npc = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, { 
    mode: "basic", 
    level: 3 
});

// Or use migration helper
import { SpawnBasicNPC } from "server/services/npc-migration-helper";
const npc = SpawnBasicNPC("goblin", position, { level: 3 });
```

### From Enhanced NPC Service
```typescript
// Old way
import { EnhancedNPCServiceInstance } from "server/services/enhanced-npc-service";
const npc = EnhancedNPCServiceInstance.SpawnNPC("goblin", position, { level: 3 });

// New way
import { UnifiedNPCServiceInstance } from "server/services/unified-npc-service";
const npc = UnifiedNPCServiceInstance.SpawnNPC("goblin", position, { 
    mode: "enhanced", 
    level: 3 
});

// Or use migration helper
import { SpawnEnhancedNPC } from "server/services/npc-migration-helper";
const npc = SpawnEnhancedNPC("goblin", position, { level: 3 });
```

## Performance Considerations

### Basic Mode
- ~50-100 NPCs comfortably
- Minimal memory footprint
- Simple AI calculations only
- No system integrations

### Enhanced Mode
- ~20-30 NPCs recommended
- Full feature set
- Multiple system integrations
- Complex AI calculations

### Mixed Deployment
Recommended approach:
- 80% Basic NPCs (background, non-combat)
- 20% Enhanced NPCs (active combat, important characters)

## Best Practices

1. **Use Basic Mode by default** - Only enable enhanced features when needed
2. **Configure features granularly** - Don't enable combat for peaceful NPCs
3. **Set appropriate aggro ranges** - Avoid overlapping aggro zones
4. **Use retreat thresholds** - Prevent NPCs from fighting to death
5. **Monitor performance** - Check `GetStats()` regularly

## Integration with Other Systems

### Combat System
Enhanced NPCs automatically integrate with:
- Damage dealing/receiving
- Weapon equipping
- Ability usage
- Combo chains
- Status effects

### Resource System
Enhanced NPCs support:
- Health/mana/stamina tracking
- Resource regeneration
- Status effect monitoring
- Death/revival events

### Animation System
Both modes support:
- Movement animations
- Combat animations (enhanced mode)
- Idle animations
- Custom animation sets

## Troubleshooting

### "NPC model missing required components"
- Ensure models have Humanoid and HumanoidRootPart
- For enhanced mode, validate SSEntity structure

### "Failed to register with combat system"
- Check if combat service is running
- Verify NPC has valid SSEntity structure
- Ensure `enableCombat: true` in configuration

### Performance issues
- Reduce number of enhanced NPCs
- Disable unused features
- Check for infinite AI loops
- Monitor with `GetStats()`
