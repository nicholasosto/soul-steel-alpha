# Service Decoupling Violations Analysis

## Overview

This document identifies services that violate the signal-based decoupling architecture described in `SERVICE_ARCHITECTURE.md`. The Soul Steel Alpha project uses a signal system for inter-service communication to maintain loose coupling.

## Architecture Principles

### ✅ Correct Pattern
```typescript
// GOOD - Signal-based communication
SignalServiceInstance.emit("HealthDamageRequested", { player, amount, source });
```

### ❌ Violation Pattern
```typescript
// BAD - Direct service coupling
ResourceServiceInstance.ModifyResource(player, "health", -amount);
```

## Violation Summary

| Service | Violations | Severity | Dependencies |
|---------|------------|----------|--------------|
| SpawnService | 1 | 🔴 High | DataServiceInstance |
| CombatService | 2 | 🔴 High | MessageServiceInstance, DamageServiceInstance |
| NPCSpawnManager | 2 | 🟡 Medium | UnifiedNPCServiceInstance, ZoneServiceInstance |
| UnifiedNPCService | 1 | 🟡 Medium | ResourceServiceInstance |

## Detailed Violations

### 🔴 SpawnService
**File**: `src/server/services/spawn-service.ts`

**Violations**:
1. **Line 11**: `import { DataServiceInstance } from "./data-service";`
2. **Line 61**: `const profile = DataServiceInstance.GetProfile(player);`

**Impact**: Direct coupling to data layer violates separation of concerns.

**Recommended Fix**: Use ServiceRegistry for data operations:
```typescript
// Replace
const profile = DataServiceInstance.GetProfile(player);

// With
const dataOps = ServiceRegistryInstance.getDataOperations();
const profile = dataOps.getProfile(player);
```

### 🔴 CombatService  
**File**: `src/server/services/combat-service.ts`

**Violations**:
1. **Line 58**: `import { MessageServiceInstance } from "./message-service";`
2. **Line 59**: `import { DamageServiceInstance } from "./damage-service";`
3. **Line 647**: `DamageServiceInstance.RequestHealthDamage(target, damage, "Combat");`
4. **Multiple lines**: `MessageServiceInstance.SendMessageToPlayer(...)`

**Impact**: High coupling to messaging and damage systems.

**Recommended Fix**: Use signals and ServiceRegistry:
```typescript
// Replace damage calls
DamageServiceInstance.RequestHealthDamage(target, damage, "Combat");

// With signal emission
SignalServiceInstance.emit("HealthDamageRequested", { 
    player: target, 
    amount: damage, 
    source: "Combat" 
});

// Replace message calls with ServiceRegistry
const messageOps = ServiceRegistryInstance.getMessageOperations();
messageOps.sendMessageToPlayer(player, message);
```

### 🟡 NPCSpawnManager
**File**: `src/server/services/npc-spawn-manager.ts`

**Violations**:
1. **Line 26**: `import { UnifiedNPCServiceInstance } from "./unified-npc-service";`
2. **Line 27**: `import { ZoneServiceInstance } from "./zone-service";`
3. **Line 356**: `UnifiedNPCServiceInstance.SpawnNPC(...)`
4. **Line 167**: `UnifiedNPCServiceInstance.DespawnNPC(...)`

**Impact**: Medium coupling to NPC and zone management.

**Recommended Fix**: Use signals for NPC lifecycle:
```typescript
// Replace direct spawning
UnifiedNPCServiceInstance.SpawnNPC(npcConfig.npcType, position, npcConfig.config);

// With signal emission
SignalServiceInstance.emit("NPCSpawnRequested", {
    npcType: npcConfig.npcType,
    position,
    config: npcConfig.config,
    areaId: area.config.id
});
```

### 🟡 UnifiedNPCService
**File**: `src/server/services/unified-npc-service.ts`

**Violations**:
1. **Line 28**: `import { ResourceServiceInstance } from "./resource-service";`
2. **Usage throughout**: Direct resource management calls

**Impact**: Medium coupling to resource system.

**Recommended Fix**: Use signals for resource operations:
```typescript
// Replace direct resource calls
ResourceServiceInstance.ModifyResource(player, "health", amount);

// With signal emission
SignalServiceInstance.emit("HealthDamageRequested", { 
    player, 
    amount: -amount, 
    source: "NPC Combat" 
});
```

## Compliant Services

### ✅ Well-Architected Services

1. **SignalService** - Core communication hub
2. **ZoneService** - Only emits signals, no direct dependencies
3. **TargetingService** - Pure validation service  
4. **DamageService** - Acts as signal facade
5. **ResourceService** - Listens to signals, acceptable direct dependencies

### ✅ Acceptable Dependencies

These services can use direct dependencies:
- **DataService** access for player data operations
- **MessageService** access for user notifications
- **ServiceRegistry** access for interface-based operations

## Remediation Plan

### Phase 1: Critical Violations (High Priority)
1. **SpawnService**: Replace DataService direct access with ServiceRegistry
2. **CombatService**: Replace direct service calls with signals/ServiceRegistry

### Phase 2: Medium Violations
3. **NPCSpawnManager**: Add NPC lifecycle signals
4. **UnifiedNPCService**: Replace resource calls with signals

### Phase 3: Enhancement
5. Add signal validation and error handling
6. Update service documentation
7. Add integration tests for signal flows

## Testing Strategy

1. **Unit Tests**: Verify signal emissions replace direct calls
2. **Integration Tests**: Ensure signal flows work end-to-end
3. **Performance Tests**: Verify signal overhead is acceptable
4. **Regression Tests**: Ensure existing functionality unchanged

## Implementation Guidelines

### Signal Naming Convention
- Use descriptive past tense: `HealthDamageRequested`, `NPCSpawnRequested`
- Include context: `CombatDamageApplied`, `AbilityManaConsumed`

### Error Handling
```typescript
// Emit with error handling
try {
    SignalServiceInstance.emit("HealthDamageRequested", data);
} catch (error) {
    warn(`Failed to emit HealthDamageRequested: ${error}`);
    // Fallback or error recovery
}
```

### ServiceRegistry Pattern
```typescript
// Register interface implementations
const ops: IResourceOperations = {
    modifyResource: (player, type, amount) => {
        // Implementation
    }
};
ServiceRegistryInstance.registerService("ResourceOperations", ops);

// Use via ServiceRegistry
const resourceOps = ServiceRegistryInstance.getResourceOperations();
resourceOps.modifyResource(player, "health", -damage);
```

## Benefits of Fixing Violations

1. **Improved Testability**: Services can be tested in isolation
2. **Better Maintainability**: Changes don't cascade through direct dependencies  
3. **Enhanced Flexibility**: New services can hook into existing flows via signals
4. **Clearer Architecture**: Explicit communication boundaries
5. **Reduced Coupling**: Services become more modular and reusable

## Conclusion

Fixing these 6 major violations will significantly improve the architecture's adherence to the signal-based decoupling pattern. The remediation can be done incrementally with proper testing to ensure no functionality is lost.