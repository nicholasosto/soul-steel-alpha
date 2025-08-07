# Client Controller Architecture Guidelines

## 🏗️ **Controller Responsibilities Matrix**

| Controller | **Primary Purpose** | **What It Should Handle** | **What It Should NOT Handle** |
|------------|-------------------|---------------------------|-------------------------------|
| **InputController** | Raw input mapping | • Keyboard/mouse events<br>• Input validation<br>• Action emission | • Game logic<br>• Business rules<br>• UI updates |
| **MovementController** | Player movement mechanics | • Running state<br>• Jump mechanics<br>• Walk speed changes | • Abilities<br>• Network calls<br>• UI state |
| **AbilityController** | Ability system management | • Ability activation<br>• Cooldown management<br>• Effect triggering<br>• UI integration | • Movement<br>• Input handling<br>• Zone logic |
| **ZoneController** | Zone management | • Zone creation<br>• Zone events<br>• Player zone tracking | • Abilities<br>• Movement<br>• Input processing |
| **ClientController** | Central coordination | • Controller initialization<br>• Action routing<br>• System integration | • Direct game logic<br>• UI rendering<br>• Data processing |

## 🚫 **Anti-Patterns to Avoid**

### ❌ **Don't Create These:**
- `GameActionController` - Too vague, overlaps with AbilityController
- `PlayerController` - Too broad, would overlap with multiple controllers
- `UIController` - UI should be reactive, not controlled
- `NetworkController` - Network calls should be in domain-specific controllers

### ❌ **Don't Add These Responsibilities:**
- **InputController**: Don't add cooldown checking, ability validation, or game state
- **MovementController**: Don't add ability casting, zone interactions, or network calls
- **AbilityController**: Don't add movement logic, input handling, or zone management
- **ZoneController**: Don't add ability logic, movement handling, or input processing

## ✅ **Decision Framework**

Before adding new functionality, ask:

1. **Does this belong in an existing controller?**
   - If yes → Add to existing controller
   - If no → Continue to #2

2. **Is this a new domain with 3+ distinct responsibilities?**
   - If yes → Create new controller
   - If no → Extend existing controller

3. **Would this create overlap with existing controllers?**
   - If yes → Refactor to eliminate overlap
   - If no → Proceed with implementation

## 🎯 **Single Responsibility Examples**

### ✅ **Good Additions:**
```typescript
// AbilityController - ability-related
public getAbilityCooldownPercent(key: AbilityKey): number
public cancelAllCooldowns(): void
public getActiveAbilities(): AbilityKey[]

// MovementController - movement-related  
public setCustomWalkSpeed(speed: number): void
public enableFlying(): void
public getMovementState(): MovementState

// ZoneController - zone-related
public getPlayerZones(): ZoneKey[]
public createTempZone(region: Region3): void
public destroyZone(key: ZoneKey): void
```

### ❌ **Bad Additions:**
```typescript
// DON'T: AbilityController handling movement
public teleportPlayer(position: Vector3): void  // → MovementController

// DON'T: MovementController handling abilities  
public castAbilityWhileMoving(key: AbilityKey): void  // → AbilityController

// DON'T: InputController handling game logic
public activateAbilityIfNotOnCooldown(key: AbilityKey): void  // → AbilityController
```

## 📋 **Code Review Checklist**

When reviewing PRs, check:

- [ ] Does new functionality fit the controller's single responsibility?
- [ ] Are we creating duplicate logic across controllers?
- [ ] Is the controller getting too large (>300 lines = consider splitting)?
- [ ] Are we mixing concerns (input + game logic, network + UI, etc.)?
- [ ] Does this follow the established patterns?

## 🔄 **Refactoring Triggers**

Refactor when you notice:

1. **Duplicate code** across controllers
2. **Controllers calling each other** excessively (beyond ClientController routing)
3. **Controllers growing beyond 300 lines**
4. **Unclear naming** or responsibilities
5. **New developers struggling** to understand where code belongs

## 🎪 **Extension Points**

For future growth, consider these bounded contexts:

- **CombatController** - When combat becomes complex enough (damage calculation, targeting)
- **InventoryController** - When item management is needed
- **ChatController** - When chat/communication features are added
- **SettingsController** - When user preferences/keybinds become complex

Each should have **3+ distinct responsibilities** before creation.
