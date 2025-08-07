# AGENTS.md

## Project Agents Overview

This document describes the various agents, systems, and automated entities within the Soul Steel Alpha project. These agents work together to create a cohesive game experience with reactive state management and modular architecture.

## State Management Agents

### ResourceState Agent
**File:** `src/client/states/resource-state.ts`
**Type:** Singleton State Manager
**Responsibilities:**
- Manages all player resources (health, mana, stamina)
- Provides reactive state updates using Fusion
- Handles network synchronization with server
- Offers utility methods for resource checks and percentage calculations

**Key Methods:**
- `hasEnoughResources()` - Check if player can afford actions
- `getResourcePercentage()` - Get normalized resource values (0-1)
- `getCurrentResources()` - Get current resource snapshot

### MessageState Agent
**File:** `src/client/states/message-state.ts`
**Type:** Message Management System
**Responsibilities:**
- Handles UI messaging and notifications
- Manages message queuing and display timing
- Provides reactive message state for UI components

### MovementState Agent
**File:** `src/client/states/movement-state.ts`
**Type:** Player Movement Controller
**Responsibilities:**
- Tracks player movement state (running, jumping)
- Manages movement-related reactive values
- Handles input processing for movement actions

## Service Agents (Server-Side)

### AbilityService Agent
**File:** `src/server/services/ability-service.ts`
**Type:** Game Logic Controller
**Responsibilities:**
- Manages player abilities and cooldowns
- Handles ability execution and validation
- Coordinates with resource systems for cost management

### CombatService Agent
**File:** `src/server/services/combat-service.ts`
**Type:** Combat System Manager
**Responsibilities:**
- Processes combat interactions
- Manages damage calculations
- Handles combat state transitions

### EnhancedCombatService Agent
**File:** `src/server/services/enhanced-combat-service.ts`
**Type:** Advanced Combat Flow Manager
**Responsibilities:**
- Implements damage container system for traceability
- Manages enhanced combat flow: AbilityActivateAttempt→ValidateAbility→DamageContainerCreated→Applied→RecordedForRewards
- Provides combat analytics and performance metrics
- Handles reward calculation and distribution
- Manages combat sessions and environmental modifiers

**Key Methods:**
- `createDamageContainer()` - Creates traceable damage containers
- `applyDamageContainer()` - Processes damage with full analytics
- `handleEnhancedBasicAttack()` - Enhanced basic attack flow
- `handleAbilityWithContext()` - Context-aware ability execution

### DataService Agent
**File:** `src/server/services/data-service.ts`
**Type:** Data Persistence Manager
**Responsibilities:**
- Handles player data saving/loading
- Manages data validation and migration
- Provides data access layer for other services

### NPCService Agent
**File:** `src/server/services/npc-service.ts`
**Type:** AI Entity Manager
**Responsibilities:**
- Manages NPC spawning and behavior
- Handles NPC AI state machines
- Coordinates NPC interactions with players

### ZoneService Agent
**File:** `src/server/services/zone-service.ts`
**Type:** World Area Manager
**Responsibilities:**
- Manages game world zones and boundaries
- Handles zone transitions and events
- Coordinates zone-specific game logic

## Manager Agents (Client-Side)

### ClientAbilityManager
**File:** `src/client/managers/ClientAbilityManager.ts`
**Type:** Client Ability Coordinator
**Responsibilities:**
- Manages client-side ability predictions
- Handles ability input processing
- Coordinates with server ability validation

### ClientZoneManager
**File:** `src/client/managers/ClientZoneManager.ts`
**Type:** Client Zone Coordinator
**Responsibilities:**
- Tracks current player zone
- Handles zone-specific client logic
- Manages zone transition effects

## UI Component Agents

### Event Dispatcher Agent
**File:** `src/client/event-dispatcher.ts`
**Type:** Event Coordination System
**Responsibilities:**
- Manages cross-component communication
- Handles event routing and filtering
- Provides reactive event streams for UI updates

## Network Agents

### Network Remotes
**Location:** `src/shared/network/`
**Type:** Communication Layer
**Responsibilities:**
- Handles client-server communication
- Manages remote function calls and events
- Provides type-safe network interfaces

## Design Patterns Used

### Singleton Pattern
- **State Managers** (ResourceState, MessageState, MovementState)
- Ensures single source of truth for global state

### Observer Pattern
- **Fusion Reactive System** throughout client states
- Enables automatic UI updates when state changes

### Service Locator Pattern
- **Server Services** centralized through service index
- Provides modular, testable architecture

### Event-Driven Architecture
- **Event Dispatcher** and network remotes
- Enables loose coupling between systems

## Agent Communication Flow

```
User Input → MovementState/AbilityManager → Network → Server Services → Data/Game Logic → Network → Client States → UI Updates
```

## Adding New Agents

When adding new agents to the system:

1. **State Agents**: Extend the pattern used in `resource-state.ts`
2. **Service Agents**: Follow the pattern in existing services
3. **Manager Agents**: Coordinate between state and external systems
4. **UI Agents**: Use Fusion reactive patterns for component communication

## Best Practices

- Keep agents focused on single responsibilities
- Use reactive patterns for state management
- Implement proper cleanup in destroy() methods
- Follow TypeScript strict typing
- Document public APIs with JSDoc comments
- Use consistent naming conventions (Agent suffix for clarity)

## Contributing

When modifying agents:
1. Update this documentation
2. Ensure backward compatibility
3. Add appropriate tests
4. Follow the established architectural patterns
