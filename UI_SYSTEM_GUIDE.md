# Soul Steel Alpha - UI System Guide

## Overview

The Soul Steel Alpha UI system is built using **Fusion** (a reactive UI framework for Roblox) combined with **Atomic Design** principles. This creates a scalable, maintainable, and type-safe user interface architecture.

## Architecture Pattern: Atomic Design + Fusion

### Atomic Components (`src/client/client-ui/atoms/`)

**Purpose**: Basic, reusable UI building blocks

#### MessageBox Component
```typescript
// Location: src/client/client-ui/atoms/MessageBox.ts
export const MessageBox = (messageState: MessageState) => { ... }
```

**Features**:
- Reactive message display using Fusion's `Computed()` 
- Type-based color coding:
  - `error`: Red (`Color3.fromRGB(255, 0, 0)`)
  - `warning`: Orange (`Color3.fromRGB(255, 165, 0)`)
  - `info`: Blue (`Color3.fromRGB(0, 0, 255)`)
  - `default`: White (`Color3.fromRGB(255, 255, 255)`)
- Auto-sizing and responsive layout
- Visibility controlled by reactive state

#### IconButton Component
```typescript
// Location: src/client/client-ui/atoms/IconButton.ts
export interface IconButtonProps { ... }
export function IconButton(props: IconButtonProps) { ... }
```

**Features**:
- Configurable icon and styling
- Click event handling
- Type-safe props interface
- Consistent button styling across the application

### Organism Components (`src/client/client-ui/organisms/`)

**Purpose**: Complex UI assemblies composed of atoms and molecules

#### Button Bar System
```typescript
// Base component: src/client/client-ui/organisms/button-bars/ButtonBar.ts
export interface ButtonBarProps { ... }
export function HorizontalButtonBar(props: ButtonBarProps) { ... }
```

**Specialized Button Bars**:

1. **AbilityButtonBar** (`ability-buttons.ts`)
   - Displays player abilities with icons
   - Integrates with ability system for activation
   - Shows cooldown states and resource costs

2. **MenuButtonBar** (`menu-buttons.ts`)
   - Navigation and menu options
   - Settings, inventory, character screens
   - Consistent styling with ability bars

### Helper Utilities (`src/client/client-ui/helpers/`)

#### Layout Decorators (`decorator-helpers.ts`)
```typescript
export function makePadding(padding: number): UIPadding
export function VerticalLayout(): UIListLayout  
export function HorizontalLayout(): UIListLayout
```

**Purpose**: Consistent spacing and layout utilities for UI components

## State Management System

### Message State (`src/client/states/message-state.ts`)

**Pattern**: Singleton with Fusion reactive state

```typescript
export class MessageState {
    public readonly message = Value<string>("");
    public readonly isVisible = Value(false);
    public readonly messageType = Value("info");
    // ...
}
```

**Features**:
- Singleton pattern ensures single message system
- Reactive state automatically updates UI
- Network integration for server-sent messages
- Auto-hide functionality with configurable timing

**Network Integration**:
- Connects to `MessageRemotes.Client.Get("SendMessageToPlayer")`
- Receives structured message objects with content and severity
- Automatically manages message display lifecycle

### Movement State (`src/client/states/movement-state.ts`)

Handles player input and movement state management (details to be documented based on implementation).

## Reactive Programming with Fusion

### Key Fusion Concepts Used

1. **Value()**: Reactive state containers
   ```typescript
   const message = Value<string>("");
   ```

2. **Computed()**: Derived reactive values
   ```typescript
   TextColor3: Computed(() => {
       switch (messageState.messageType.get()) {
           case "error": return Color3.fromRGB(255, 0, 0);
           // ...
       }
   })
   ```

3. **New()**: Component creation with reactive properties
   ```typescript
   const frame = New("Frame")({
       Visible: Computed(() => messageState.isVisible.get()),
       // ...
   });
   ```

4. **Children**: Parent-child relationships
   ```typescript
   [Children]: {
       Label,
       ButtonContainer,
   }
   ```

## Integration Points

### Network Layer
- **Message System**: `src/shared/network/message-remotes.ts`
- **Ability System**: `src/shared/network/ability-remotes.ts`
- **Game Cycle**: `src/shared/network/game-cycle-remotes.ts`

### Asset Management
- **Icons**: `src/shared/asset-ids/image-assets.ts`
- **Sounds**: `src/shared/asset-ids/sound-assets.ts`
- **UI Constants**: `src/shared/constants/ui-constants.ts`

### Type Definitions
- **Message Types**: `src/shared/types/message-type.ts`
- **Entity Types**: `src/shared/types/SSEntity.ts`

## Development Guidelines

### Component Creation
1. **Atoms**: Single-purpose, highly reusable components
2. **Molecules**: Simple combinations of atoms (when needed)
3. **Organisms**: Complex UI sections with business logic
4. **Templates**: Page-level layouts (future consideration)

### Naming Conventions
- **Components**: PascalCase (`MessageBox`, `IconButton`)
- **Props Interfaces**: `ComponentNameProps` (`IconButtonProps`)
- **State Classes**: PascalCase with descriptive names (`MessageState`)
- **Files**: kebab-case (`message-box.ts`, `icon-button.ts`)

### Best Practices
1. **Type Safety**: Always define proper TypeScript interfaces
2. **Reactive State**: Use Fusion's reactive primitives for dynamic updates
3. **Single Responsibility**: Each component should have one clear purpose
4. **Consistent Styling**: Use shared constants for colors, spacing, etc.
5. **Network Integration**: Connect UI state to network events where appropriate

## Future Enhancements

### Planned Components
- **Health/Mana Bars**: Player status indicators
- **Inventory UI**: Item management interface  
- **Character Panel**: Stats and progression display
- **Settings Menu**: Game configuration options

### System Improvements
- **Theme System**: Centralized color and styling management
- **Animation Library**: Consistent UI transitions and effects
- **Accessibility**: Screen reader support and keyboard navigation
- **Mobile Adaptation**: Touch-friendly layouts for mobile devices

---

*This document reflects the current UI system implementation as of July 31, 2025. Generated using project MCP analysis.*
