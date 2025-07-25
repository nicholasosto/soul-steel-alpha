# Event Keys and Signal Keys Guide

## Overview

This guide explains how to use event keys and signal keys in your Roblox TypeScript project to create type-safe client-to-server communication with Fusion components.

## Key Concepts

### Signal Keys vs Event Keys

1. **Signal Keys (`SignalKey`)** - For client-to-server remote **functions** that expect responses
   - Used with `Definitions.ServerAsyncFunction`
   - Client waits for server response
   - Examples: ability activation, data requests, validation checks

2. **Event Keys (`EventKey`)** - For fire-and-forget client-to-server **events**
   - Used with `Definitions.ClientToServerEvent`
   - No response expected from server
   - Examples: notifications, status updates, simple triggers

## Project Structure

```
src/shared/keys/
├── event-keys.ts          # SIGNAL_KEYS and EVENT_KEYS definitions
├── ability-keys.ts        # Available abilities
└── player-data-keys.ts    # Player data field names

src/shared/network/
├── ability-remotes.ts     # Signal-based remote functions
└── game-cycle-remotes.ts  # Event-based remotes

src/client/client-ui/buttons/
├── EventButton.ts         # Reusable event button component
└── EventButtonExamples.ts # Usage examples
```

## Current Available Keys

### Signal Keys (Remote Functions)
```typescript
SIGNAL_KEYS = {
    ABILITY_ACTIVATE: 'ABILITY_ACTIVATE',     // Activate an ability
    GET_PLAYER_DATA: 'GET_PLAYER_DATA',       // Request player data
    SET_PLAYER_DATA: 'SET_PLAYER_DATA'        // Update player data
}
```

### Event Keys (Fire-and-Forget Events)
```typescript
EVENT_KEYS = {
    RESOURCE_UPDATED: 'RESOURCE_UPDATED',         // Resource change notification
    PLAYER_DATA_UPDATED: 'PLAYER_DATA_UPDATED',   // Player data change notification
    ABILITY_INTERRUPTED: 'ABILITY_INTERRUPTED',   // Ability was interrupted
    CLIENT_READY: 'CLIENT_READY',                 // Client finished loading
    SERVER_READY: 'SERVER_READY'                  // Server ready for client
}
```

### Ability Keys
```typescript
ABILITY_KEYS = ["Melee", "Soul-Drain", "Earthquake", "Ice-Rain"]
```

## Using EventButton Component

### Basic Usage

```typescript
import { EventButton } from "client/client-ui/buttons";
import { SignalKey, AbilityKey } from "shared/keys";

// Signal-based button (expects response)
const abilityButton = EventButton({
    text: "Ice Rain",
    signalKey: "ABILITY_ACTIVATE" as SignalKey,
    eventParams: ["Ice-Rain" as AbilityKey],
    onSignalResponse: (success: boolean) => {
        print("Ability result:", success);
    },
    onSignalError: (err: string) => {
        warn("Ability failed:",err);
    }
});

// Event-based button (fire-and-forget)
const readyButton = EventButton({
    text: "Ready!",
    eventKey: "CLIENT_READY" as EventKey,
    eventParams: [],
    onClick: () => print("Marked as ready")
});
```

### Advanced Examples

#### 1. Player Data Management
```typescript
// Get player data
const getDataButton = EventButton({
    text: "Get My Stats",
    signalKey: "GET_PLAYER_DATA",
    eventParams: [tostring(Players.LocalPlayer.UserId)],
    onSignalResponse: (data: PlayerData | undefined) => {
        if (data) {
            print(`Health: ${data.health}, Mana: ${data.mana}`);
        }
    }
});

// Set player data
const healButton = EventButton({
    text: "Heal to Full",
    signalKey: "SET_PLAYER_DATA",
    eventParams: [
        tostring(Players.LocalPlayer.UserId),
        { health: 100 } // Partial PlayerData
    ],
    onSignalResponse: (success: boolean) => {
        print(success ? "Healed!" : "Heal failed");
    }
});
```

#### 2. Dynamic Ability Buttons
```typescript
import { ABILITY_KEYS, AbilityKey } from "shared/keys";

function createAbilityButtons() {
    return ABILITY_KEYS.map((ability, index) => 
        EventButton({
            text: ability,
            signalKey: "ABILITY_ACTIVATE",
            eventParams: [ability],
            Position: UDim2.fromScale(0, index * 0.1),
            onSignalResponse: (success: boolean) => {
                print(`${ability} ${success ? "activated" : "failed"}`);
            }
        })
    );
}
```

#### 3. Reactive Button States
```typescript
const isAbilityReady = Fusion.Value(true);
const cooldownTime = Fusion.Value(0);

const abilityButton = EventButton({
    text: "Earthquake",
    signalKey: "ABILITY_ACTIVATE",
    eventParams: ["Earthquake"],
    isDisabled: Fusion.Computed(() => !isAbilityReady.get()),
    onSignalResponse: (success: boolean) => {
        if (success) {
            // Start cooldown
            isAbilityReady.set(false);
            cooldownTime.set(5); // 5 second cooldown
            
            // Countdown timer
            const countdown = setInterval(() => {
                const current = cooldownTime.get();
                if (current <= 1) {
                    clearInterval(countdown);
                    isAbilityReady.set(true);
                    cooldownTime.set(0);
                } else {
                    cooldownTime.set(current - 1);
                }
            }, 1000);
        }
    }
});
```

## Best Practices

### 1. Type Safety
- Always cast keys to their proper types: `"ABILITY_ACTIVATE" as SignalKey`
- Use proper parameter types for eventParams
- Handle response types correctly in callbacks

### 2. Error Handling
```typescript
const robustButton = EventButton({
    text: "Risky Action",
    signalKey: "ABILITY_ACTIVATE",
    eventParams: ["Ice-Rain"],
    onSignalResponse: (result: unknown) => {
        // Always validate server responses
        if (typeof result === "boolean" && result) {
            print("Success!");
        } else {
            warn("Unexpected response:", result);
        }
    },
    onSignalError: (err: string) => {
        // Handle network errors, validation failures, etc.
        warn("Network error:",err);
        // Show user-friendly error message
        showErrorToast("Action failed. Please try again.");
    }
});
```

### 3. Performance Considerations
- Use `isDisabled` to prevent spam clicking
- Implement cooldowns for abilities
- Batch multiple parameter updates when possible

### 4. User Experience
```typescript
const smartButton = EventButton({
    text: "Cast Spell",
    signalKey: "ABILITY_ACTIVATE",
    eventParams: ["Ice-Rain"],
    isDisabled: Fusion.Value(false),
    onClick: () => {
        // Immediate feedback
        showCastingAnimation();
    },
    onSignalResponse: (success: boolean) => {
        hideCastingAnimation();
        if (success) {
            showSuccessEffect();
        } else {
            showFailureEffect();
        }
    },
    onSignalError: () => {
        hideCastingAnimation();
        showNetworkErrorMessage();
    }
});
```

## Adding New Keys

### 1. Add to Keys Definition
```typescript
// In src/shared/keys/event-keys.ts
export const SIGNAL_KEYS = {
    // ... existing keys
    NEW_SIGNAL: 'NEW_SIGNAL'
} as const;

export const EVENT_KEYS = {
    // ... existing keys  
    NEW_EVENT: 'NEW_EVENT'
} as const;
```

### 2. Define Remote
```typescript
// In appropriate remote file
export const MyRemotes = Definitions.Create({
    [SIGNAL_KEYS.NEW_SIGNAL]: Definitions.ServerAsyncFunction<(param: string) => boolean>(),
});
```

### 3. Update EventButton
Add new case to the `handleActivation` function in `EventButton.ts`.

### 4. Implement Server Handler
Create server-side handlers for your new remotes in the appropriate service files.

## Debugging Tips

1. **Use print statements** in callbacks to track event flow
2. **Check network tab** in Developer Console for remote call failures
3. **Validate parameter types** before sending to server
4. **Test edge cases** like rapid clicking, network failures, invalid parameters
5. **Use TypeScript strict mode** to catch type errors early

## Security Considerations

1. **Never trust client data** - always validate on server
2. **Implement rate limiting** for frequently-called remotes
3. **Sanitize user inputs** before processing
4. **Use proper authentication** for sensitive operations
5. **Log suspicious activity** for monitoring

This system provides a robust, type-safe foundation for client-server communication in your Roblox TypeScript project while maintaining clean separation of concerns and excellent developer experience.
