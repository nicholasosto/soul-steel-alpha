# Combat Service Documentation

## Overview

The Combat Service is a comprehensive server-side combat management system for Soul Steel Alpha. It orchestrates all combat-related mechanics including weapon systems, combat calculations, combo chains, and integration with other game services.

## Architecture

### Service Pattern
- **Singleton Design**: Single instance managed through `CombatServiceInstance`
- **Service Integration**: Coordinates with ResourceService, AbilityService, and AnimationService
- **Event-Driven**: Reactive to player actions and game state changes

### Core Components

#### 1. Weapon System
- **Equipment Management**: Weapon equipping with stat requirements
- **Weapon Types**: Sword, Staff, Bow, Dagger, Hammer, Shield, Fists
- **Special Effects**: Status effects applied on successful attacks
- **Stat Requirements**: Attack power, defense, and other prerequisites

#### 2. Combat Calculations
- **Hit Chance**: Accuracy vs evasion calculations
- **Damage System**: Base damage + modifiers + critical hits
- **Critical Hits**: Weapon-specific critical bonuses
- **Range Validation**: Distance-based attack validation

#### 3. Combo System
- **Skill Chains**: Sequence-based ability combinations
- **Time Windows**: Limited time to continue combos
- **Bonus Multipliers**: Increased damage for successful combos
- **Pattern Matching**: Predefined combo sequences

#### 4. Combat Sessions
- **Session Types**: PvP, PvE, Duel, Raid, Training
- **Participant Tracking**: Entity registration and management
- **Turn Management**: Optional turn-based combat support
- **Session Lifecycle**: Creation, management, and cleanup

## API Reference

### Public Methods

#### Registration and Management

```typescript
// Register an entity as a combatant
CombatServiceInstance.RegisterCombatant(entity: SSEntity, weapon?: WeaponInfo): boolean

// Unregister an entity from combat
CombatServiceInstance.unregisterCombatant(entity: SSEntity): boolean

// Equip a weapon to an entity
CombatServiceInstance.EquipWeapon(entity: SSEntity, weapon: WeaponInfo): boolean

// Get currently equipped weapon
CombatServiceInstance.GetEquippedWeapon(entity: SSEntity): WeaponInfo | undefined
```

#### Combat Actions

```typescript
// Execute basic weapon attack
CombatServiceInstance.ExecuteBasicAttack(
  attacker: SSEntity, 
  target: SSEntity, 
  weaponOverride?: WeaponInfo
): boolean

// Execute weapon-specific skill
CombatServiceInstance.ExecuteWeaponSkill(
  user: SSEntity, 
  skillId: string, 
  target?: SSEntity
): boolean
```

#### Combo System

```typescript
// Start a new combo chain
CombatServiceInstance.StartComboChain(entity: SSEntity, abilityKey: AbilityKey): boolean

// Continue an existing combo
CombatServiceInstance.ContinueComboChain(entity: SSEntity, abilityKey: AbilityKey): number
```

### Data Types

#### Combat-Specific Types

```typescript
interface CombatTarget {
  entity: SSEntity;
  position: Vector3;
  isValid: boolean;
}

interface CombatAction {
  id: string;
  source: SSEntity;
  target?: CombatTarget;
  actionType: CombatActionType;
  abilityKey?: AbilityKey;
  weaponId?: string;
  timestamp: number;
  isQueued: boolean;
}

type CombatActionType = 
  | "basic_attack" 
  | "ability_cast" 
  | "weapon_skill" 
  | "dodge" 
  | "block" 
  | "counter"
  | "combo_finisher";
```

#### Session Management

```typescript
interface CombatSession {
  id: string;
  participants: Set<SSEntity>;
  sessionType: CombatSessionType;
  startTime: number;
  isActive: boolean;
  turnOrder?: SSEntity[];
  currentTurn?: SSEntity;
}

type CombatSessionType = "pvp" | "pve" | "duel" | "raid" | "training";
```

#### Combo System

```typescript
interface ComboChain {
  id: string;
  requiredSequence: AbilityKey[];
  currentSequence: AbilityKey[];
  timeWindow: number;
  lastActionTime: number;
  bonusMultiplier: number;
}
```

## Integration Points

### ResourceService Integration
- **Damage Application**: Uses ResourceService.dealDamage for damage processing
- **Stat Access**: Retrieves combat stats via ResourceService.getEntityStats
- **Resource Validation**: Checks mana/stamina costs through ResourceService

### AbilityService Integration
- **Combo Validation**: Coordinates with ability cooldowns and validation
- **Ability-Based Combat**: Supports ability-triggered combat actions
- **Shared Entity Management**: Both services track the same SSEntity instances

### AnimationService Integration
- **Attack Animations**: Triggers weapon-specific attack animations
- **Combat Feedback**: Visual feedback for hits, misses, and special effects

## Configuration

### Default Settings

```typescript
// Default weapon (always available)
DEFAULT_WEAPON: {
  id: "fists",
  name: "Fists", 
  weaponType: "fists",
  baseDamage: 5,
  attackSpeed: 1.0,
  range: 2,
  criticalBonus: 0
}

// Combat timing
COMBO_TIME_WINDOW = 3; // seconds
MAX_COMBAT_RANGE = 50; // studs
```

### Combo Patterns

```typescript
// Example combo definitions
const comboPatterns = [
  {
    id: "basic_combo",
    sequence: ["Melee", "Soul-Drain"],
    bonusMultiplier: 1.5
  },
  {
    id: "elemental_combo", 
    sequence: ["Earthquake", "Ice-Rain"],
    bonusMultiplier: 2.0
  }
];
```

## Usage Examples

### Basic Combat Setup

```typescript
import { CombatServiceInstance } from "server/services/combat-service";
import { WeaponCatalog } from "shared/catalogs/weapon-catalog";

// Register a player for combat
const character = player.Character as SSEntity;
const sword = WeaponCatalog.iron_sword;

// Register combatant with starting weapon
CombatServiceInstance.RegisterCombatant(character, sword);

// Execute attacks
CombatServiceInstance.ExecuteBasicAttack(attacker, target);
```

### Combo System Usage

```typescript
// Start a combo with first ability
const comboStarted = CombatServiceInstance.StartComboChain(character, "Melee");

if (comboStarted) {
  // Continue with second ability for bonus damage
  const multiplier = CombatServiceInstance.ContinueComboChain(character, "Soul-Drain");
  print(`Combo multiplier: ${multiplier}x`); // Should be 1.5x for basic combo
}
```

### Weapon Management

```typescript
// Check if player can use a weapon
const legendaryWeapon = WeaponCatalog.soul_reaper;
const canEquip = CombatServiceInstance.EquipWeapon(character, legendaryWeapon);

if (!canEquip) {
  print("Player doesn't meet weapon requirements");
}

// Get current weapon
const currentWeapon = CombatServiceInstance.GetEquippedWeapon(character);
print(`Currently equipped: ${currentWeapon?.name || "None"}`);
```

## Future Enhancements

### Planned Features
- **Turn-Based Combat**: Full turn-based combat system implementation
- **Environmental Effects**: Terrain bonuses and environmental hazards
- **Equipment Sets**: Weapon set bonuses and enchantments
- **AI Combat**: NPC combat behavior patterns
- **Combat Analytics**: Performance tracking and balancing data

### Extension Points
- **Custom Weapon Types**: Add new weapon categories and behaviors
- **Advanced Combos**: More complex combo patterns and conditions
- **Status Effect System**: Enhanced debuff/buff management
- **Combat Events**: Hooks for achievements, quests, and progression

## Related Documentation

- [Enhanced NPC Service API](enhanced-npc-service.md) - NPCs that integrate with combat system
- [Shared Modules](shared-modules.md) - Common types and utilities
- [NPC Integration Guide](../guides/npc-integration.md) - How to use NPCs in combat
- [Development Guide](../guides/development-guide.md) - Development best practices

*Note: Resource Service, Ability Service, Weapon Catalog, and Combat Network documentation coming soon*

---

*Last Updated: July 31, 2025*
