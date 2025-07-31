# NPC Service Architecture Design

## Overview

An NPC (Non-Player Character) service for Soul Steel Alpha that manages AI-controlled entities, their behaviors, spawning, and integration with existing game systems (combat, abilities, resources).

## Core Architecture

### Service Pattern
- **Singleton Design**: `NPCServiceInstance` following established patterns
- **Integration**: Coordinates with CombatService, AbilityService, ResourceService, AnimationService
- **Event-Driven**: Reactive AI behaviors and state management
- **Modular Behaviors**: Pluggable AI behavior patterns

## NPC Service Structure

```typescript
// Core NPC Service
class NPCService {
  // NPC Management
  public SpawnNPC(npcType: NPCType, position: Vector3, config?: NPCConfig): NPCEntity | undefined
  public DespawnNPC(npcId: string): boolean
  public RegisterNPCType(npcType: NPCTypeDefinition): boolean
  
  // Behavior Management
  public SetNPCBehavior(npcId: string, behavior: NPCBehaviorType): boolean
  public AddBehaviorPattern(npcId: string, pattern: BehaviorPattern): boolean
  public SetAIState(npcId: string, state: AIState): boolean
  
  // Combat Integration
  public SetNPCCombatRole(npcId: string, role: CombatRole): boolean
  public AssignNPCTarget(npcId: string, target: SSEntity): boolean
  public SetNPCAggroRange(npcId: string, range: number): boolean
  
  // Group Management
  public CreateNPCGroup(groupId: string, npcs: string[]): boolean
  public SetGroupBehavior(groupId: string, behavior: GroupBehaviorType): boolean
  public SetGroupFormation(groupId: string, formation: FormationType): boolean
}
```

## Data Structures

### Core NPC Types

```typescript
// Base NPC Entity (extends SSEntity)
export interface NPCEntity extends SSEntity {
  npcId: string;
  npcType: NPCType;
  aiState: AIState;
  behavior: NPCBehaviorType;
  combatRole: CombatRole;
  aggroRange: number;
  isActive: boolean;
  spawnTime: number;
  
  // AI Properties
  currentTarget?: SSEntity;
  patrolPath?: Vector3[];
  homePosition: Vector3;
  lastActionTime: number;
  
  // Behavior State
  behaviorState: BehaviorState;
  groupId?: string;
  alliances: string[];
  
  // Stats & Progression
  level: number;
  experience: number;
  difficulty: DifficultyLevel;
}

// NPC Type Definitions
export interface NPCTypeDefinition {
  id: string;
  name: string;
  category: NPCCategory;
  
  // Physical Properties
  model: Model;
  scale: number;
  speed: number;
  health: number;
  
  // Combat Properties
  defaultWeapons: string[];
  availableAbilities: AbilityKey[];
  combatStats: CombatStats;
  
  // AI Properties
  defaultBehavior: NPCBehaviorType;
  intelligence: IntelligenceLevel;
  aggroRange: number;
  patrolRadius: number;
  
  // Rewards & Drops
  experienceReward: number;
  lootTable: LootEntry[];
  
  // Special Properties
  immunities: DamageType[];
  weaknesses: DamageType[];
  specialAbilities: string[];
}

// Behavior System
export interface BehaviorPattern {
  id: string;
  name: string;
  conditions: BehaviorCondition[];
  actions: BehaviorAction[];
  priority: number;
  cooldown: number;
  duration?: number;
}

export interface BehaviorCondition {
  type: ConditionType;
  target?: "self" | "enemy" | "ally" | "environment";
  operator: "equals" | "greater" | "less" | "contains";
  value: unknown;
  weight: number;
}

export interface BehaviorAction {
  type: ActionType;
  target?: "self" | "currentTarget" | "nearestEnemy" | "group";
  parameters: Record<string, unknown>;
  delay?: number;
  animation?: string;
}
```

### Enums and Types

```typescript
// NPC Categories
export type NPCCategory = 
  | "enemy" 
  | "neutral" 
  | "ally" 
  | "merchant" 
  | "quest_giver" 
  | "boss" 
  | "minion"
  | "guard";

// AI States
export type AIState = 
  | "idle" 
  | "patrol" 
  | "combat" 
  | "pursuit" 
  | "retreat" 
  | "dead" 
  | "stunned"
  | "casting"
  | "investigating";

// Behavior Types
export type NPCBehaviorType = 
  | "aggressive" 
  | "defensive" 
  | "passive" 
  | "patrol" 
  | "guard" 
  | "support"
  | "berserker"
  | "tactical"
  | "coward";

// Combat Roles
export type CombatRole = 
  | "tank" 
  | "damage" 
  | "support" 
  | "healer" 
  | "crowd_control"
  | "assassin"
  | "ranger"
  | "caster";

// Group Behaviors
export type GroupBehaviorType = 
  | "pack" 
  | "formation" 
  | "swarm" 
  | "coordinated" 
  | "hierarchical"
  | "protective";

// Formation Types
export type FormationType = 
  | "line" 
  | "circle" 
  | "wedge" 
  | "box" 
  | "scattered"
  | "follow_leader";

// Intelligence Levels
export type IntelligenceLevel = 
  | "basic"     // Simple reactions
  | "moderate"  // Basic tactics
  | "advanced"  // Complex strategies
  | "genius";   // Adaptive learning

// Difficulty Levels
export type DifficultyLevel = 
  | "trivial"
  | "easy"
  | "normal"
  | "hard"
  | "elite"
  | "boss";

// Condition Types
export type ConditionType = 
  | "health_percentage"
  | "mana_percentage"
  | "distance_to_target"
  | "enemy_count"
  | "ally_count"
  | "ability_ready"
  | "time_since_last_action"
  | "target_has_status"
  | "environment_hazard";

// Action Types
export type ActionType = 
  | "move_to"
  | "attack_target"
  | "cast_ability"
  | "use_item"
  | "call_for_help"
  | "retreat"
  | "heal_self"
  | "heal_ally"
  | "apply_buff"
  | "remove_debuff"
  | "change_behavior"
  | "emit_signal";
```

## Behavior System Design

### Behavior Tree Structure

```typescript
// Behavior Tree Nodes
export interface BehaviorNode {
  id: string;
  type: NodeType;
  children?: BehaviorNode[];
  condition?: BehaviorCondition;
  action?: BehaviorAction;
  priority: number;
}

export type NodeType = 
  | "selector"    // OR logic - first successful child
  | "sequence"    // AND logic - all children must succeed
  | "parallel"    // Execute multiple children simultaneously
  | "decorator"   // Modify child behavior
  | "leaf";       // Terminal action/condition

// Pre-built Behavior Trees
export const BehaviorTrees = {
  AGGRESSIVE_MELEE: {
    // Aggressive close-combat NPC
    root: "selector",
    nodes: [
      {
        type: "sequence",
        children: [
          { condition: { type: "health_percentage", operator: "less", value: 0.3 } },
          { action: { type: "retreat" } }
        ]
      },
      {
        type: "sequence", 
        children: [
          { condition: { type: "distance_to_target", operator: "less", value: 10 } },
          { action: { type: "attack_target" } }
        ]
      },
      {
        action: { type: "move_to", target: "currentTarget" }
      }
    ]
  },
  
  SUPPORT_CASTER: {
    // Support/healing focused NPC
    root: "selector",
    nodes: [
      {
        type: "sequence",
        children: [
          { condition: { type: "ally_count", target: "ally", operator: "greater", value: 0 } },
          { condition: { type: "health_percentage", target: "ally", operator: "less", value: 0.5 } },
          { action: { type: "heal_ally" } }
        ]
      },
      {
        type: "sequence",
        children: [
          { condition: { type: "ability_ready", value: "Soul-Drain" } },
          { action: { type: "cast_ability", parameters: { ability: "Soul-Drain" } } }
        ]
      }
    ]
  }
};
```

## Integration with Existing Services

### Combat Service Integration

```typescript
// NPC Combat Behavior
class NPCCombatBehavior {
  // Weapon selection based on situation
  public SelectOptimalWeapon(npc: NPCEntity, target: SSEntity): WeaponInfo
  
  // Ability usage strategy
  public ChooseAbility(npc: NPCEntity, context: CombatContext): AbilityKey | undefined
  
  // Combo execution for NPCs
  public ExecuteNPCCombo(npc: NPCEntity, comboPattern: string): boolean
  
  // Target selection logic
  public SelectTarget(npc: NPCEntity, availableTargets: SSEntity[]): SSEntity | undefined
  
  // Positioning strategy
  public CalculateOptimalPosition(npc: NPCEntity, target: SSEntity, role: CombatRole): Vector3
}
```

### Resource Service Integration

```typescript
// NPC Resource Management
class NPCResourceManager {
  // Resource monitoring and management
  public MonitorNPCResources(npc: NPCEntity): void
  
  // Automatic resource regeneration scaling
  public ScaleRegeneration(npc: NPCEntity, difficulty: DifficultyLevel): void
  
  // Dynamic stat scaling based on player level
  public ScaleNPCStats(npc: NPCEntity, playerLevel: number): void
}
```

### Ability Service Integration

```typescript
// NPC Ability Usage
class NPCAbilityManager {
  // Intelligent ability selection
  public SelectAbilityForSituation(npc: NPCEntity, situation: CombatSituation): AbilityKey | undefined
  
  // Cooldown management for NPCs
  public ManageAbilityCooldowns(npc: NPCEntity): void
  
  // Ability combo planning
  public PlanAbilitySequence(npc: NPCEntity, target: SSEntity): AbilityKey[]
}
```

## Advanced Features

### Learning AI System

```typescript
export interface LearningSystem {
  // Player behavior analysis
  analyzePlayerPatterns(playerId: string): PlayerBehaviorProfile;
  
  // Adaptive difficulty
  adjustDifficulty(npc: NPCEntity, playerPerformance: PerformanceMetrics): void;
  
  // Strategy evolution
  evolveStrategies(npc: NPCEntity, combatResults: CombatResult[]): void;
}

export interface PlayerBehaviorProfile {
  preferredAbilities: AbilityKey[];
  combatStyle: CombatStyle;
  reactionTime: number;
  commonMistakes: string[];
  skillLevel: number;
}
```

### Group Coordination

```typescript
export interface GroupCoordination {
  // Formation management
  maintainFormation(groupId: string, formation: FormationType): void;
  
  // Coordinated attacks
  executeGroupAbility(groupId: string, ability: GroupAbilityType): void;
  
  // Communication between NPCs
  broadcastSignal(senderId: string, signal: NPCSignal): void;
  
  // Role assignment within groups
  assignRoles(groupId: string, strategy: GroupStrategy): void;
}
```

### Spawning System

```typescript
export interface SpawningSystem {
  // Dynamic spawning based on player activity
  evaluateSpawnConditions(area: GameArea): SpawnDecision;
  
  // Balanced encounter generation
  generateEncounter(playerLevel: number, encounterType: EncounterType): EncounterDefinition;
  
  // Resource-aware spawning (don't overload server)
  manageSpawnLimits(area: GameArea): SpawnLimits;
}
```

## Configuration System

### NPC Templates

```typescript
export const NPCTemplates = {
  GOBLIN_WARRIOR: {
    id: "goblin_warrior",
    name: "Goblin Warrior",
    category: "enemy",
    health: 80,
    defaultWeapons: ["rusty_sword"],
    availableAbilities: ["Melee"],
    combatRole: "damage",
    behavior: "aggressive",
    intelligence: "basic",
    level: 5
  },
  
  SKELETON_MAGE: {
    id: "skeleton_mage",
    name: "Skeleton Mage", 
    category: "enemy",
    health: 60,
    defaultWeapons: ["bone_staff"],
    availableAbilities: ["Soul-Drain", "Ice-Rain"],
    combatRole: "caster",
    behavior: "tactical",
    intelligence: "moderate",
    level: 8
  },
  
  VILLAGE_GUARD: {
    id: "village_guard",
    name: "Village Guard",
    category: "ally",
    health: 120,
    defaultWeapons: ["guard_spear", "town_shield"],
    availableAbilities: ["Melee"],
    combatRole: "tank",
    behavior: "defensive",
    intelligence: "moderate",
    level: 10
  }
};
```

## Usage Examples

### Basic NPC Spawning

```typescript
import { NPCServiceInstance } from "server/services/npc-service";
import { NPCTemplates } from "shared/catalogs/npc-catalog";

// Spawn a basic enemy
const goblin = NPCServiceInstance.SpawnNPC(
  "goblin_warrior",
  new Vector3(100, 0, 100),
  { level: 5, difficulty: "normal" }
);

// Set up combat behavior
if (goblin) {
  NPCServiceInstance.SetNPCBehavior(goblin.npcId, "aggressive");
  NPCServiceInstance.SetNPCAggroRange(goblin.npcId, 15);
}
```

### Group Combat Setup

```typescript
// Create a coordinated enemy group
const enemies = [
  NPCServiceInstance.SpawnNPC("goblin_warrior", pos1),
  NPCServiceInstance.SpawnNPC("goblin_warrior", pos2), 
  NPCServiceInstance.SpawnNPC("skeleton_mage", pos3)
];

const groupId = "goblin_raid_party";
NPCServiceInstance.CreateNPCGroup(groupId, enemies.map(e => e!.npcId));
NPCServiceInstance.SetGroupBehavior(groupId, "coordinated");
NPCServiceInstance.SetGroupFormation(groupId, "wedge");
```

### Dynamic Encounter Generation

```typescript
// Generate level-appropriate encounter
const playerLevel = DataServiceInstance.getPlayerLevel(player);
const encounter = NPCServiceInstance.GenerateEncounter(playerLevel, "combat");

for (const npcDef of encounter.npcs) {
  const npc = NPCServiceInstance.SpawnNPC(npcDef.type, npcDef.position, npcDef.config);
  // Configure based on encounter requirements
}
```

## Benefits of This Design

### 1. **Seamless Integration**
- Uses existing SSEntity type system
- Leverages current combat and ability services
- Follows established singleton patterns

### 2. **Scalable AI**
- Modular behavior system
- Configurable intelligence levels
- Learning and adaptation capabilities

### 3. **Rich Combat Integration**
- Full weapon and ability support
- Combo system integration
- Role-based combat behaviors

### 4. **Group Dynamics**
- Coordinated group behaviors
- Formation management
- Strategic group abilities

### 5. **Performance Optimized**
- Resource-aware spawning
- Behavior tree efficiency
- Configurable update rates

This NPC service would provide a comprehensive foundation for AI-driven gameplay while maintaining perfect integration with your existing architecture!
