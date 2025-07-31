# Quick Reference: Common Pitfalls

## 🚨 Critical Pitfalls to Avoid

### 1. Undefined Checks
```typescript
// ✅ DO THIS
if (value === undefined) return;
if (value !== undefined) { /* use value */ }

// ❌ NOT THIS
if (!value) return; // Wrong for 0, "", false
```

### 2. @rbxts/net ServerAsyncFunction
```typescript
// ✅ DO THIS
Definitions.ServerAsyncFunction<(param: Type) => ReturnType>()

// ❌ NOT THIS  
Definitions.ServerAsyncFunction<(param: Type) => Promise<ReturnType>>()
```

### 3. Client Data Validation
```typescript
// ✅ DO THIS - Always validate on server
if (!ABILITY_KEYS.includes(abilityKey)) {
    warn(`Invalid ability: ${abilityKey}`);
    return false;
}

// ❌ NOT THIS - Trusting client data
return startAbility(player, abilityKey);
```

### 4. Type Safety
```typescript
// ✅ DO THIS - Explicit types
function process(data: PlayerData): boolean

// ❌ NOT THIS - Any types
function process(data: any): any
```

---
Keep this handy while coding! 🎯
