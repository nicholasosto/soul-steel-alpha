# AbilityButton Component

## Overview

The `AbilityButton` component is a molecule-level UI component that combines an `IconButton` with a cooldown system and ability name display. It's designed for use in ability bars and action interfaces.

## Features

- **Icon Display**: Shows the ability icon using the ability's configured image
- **Cooldown Visualization**: Red progress bar that fills from left to right during cooldown
- **Ability Name**: Text label below the icon showing the ability's display name
- **Timer Display**: Shows remaining cooldown time in seconds during cooldown
- **Z-Index Layering**: Properly layered components with icons on top, cooldown bars below
- **Click Handling**: Prevents activation during cooldown periods

## Usage Example

```typescript
import { AbilityButton } from "client-ui/molecules";
import { Value } from "@rbxts/fusion";

// Create a cooldown state (0 = ready, 1 = full cooldown)
const meleeAbilityCooldown = Value(0);

// Create the ability button
const meleeButton = AbilityButton({
    Name: "MeleeAbilityButton",
    abilityKey: "Melee",
    Position: new UDim2(0, 10, 0, 10),
    cooldownProgress: meleeAbilityCooldown,
    onAbilityClick: (abilityKey) => {
        print(`Player clicked ability: ${abilityKey}`);
        
        // Start cooldown simulation
        meleeAbilityCooldown.set(1);
        
        // Simulate cooldown countdown
        // In real usage, this would be driven by your ability system
        task.spawn(() => {
            for (let i = 100; i > 0; i--) {
                task.wait(0.05); // 0.5 second total cooldown
                meleeAbilityCooldown.set(i / 100);
            }
            meleeAbilityCooldown.set(0); // Ready again
        });
    }
});

// Add to your UI container
someParentFrame[Children] = {
    MeleeButton: meleeButton,
};
```

## Props Interface

```typescript
interface AbilityButtonProps extends Omit<IconButtonProps, "icon"> {
    abilityKey: AbilityKey;
    cooldownProgress?: Fusion.Value<number>; // 0-1, where 0 is ready and 1 is full cooldown
    onAbilityClick?: (abilityKey: AbilityKey) => void;
}
```

## Component Structure

```
AbilityButtonContainer (Frame)
├── AbilityButton (IconButton) [ZIndex: 1]
│   ├── IconImage [ZIndex: 2]
│   └── Background
├── AbilityNameLabel (TextLabel) [ZIndex: 3]
└── CooldownBackground (Frame) [ZIndex: 2]
    ├── CooldownBar (Frame) [ZIndex: 3] - Red progress bar
    └── CooldownTimer (TextLabel) [ZIndex: 4] - Time remaining
```

## Z-Index Layering

- **Container**: Base layer (ZIndex: 1)
- **Icon Button**: Main interactive element (ZIndex: 1)
- **Icon Image**: Ability icon (ZIndex: 2) 
- **Cooldown Background**: Dark background bar (ZIndex: 2)
- **Ability Name**: Text label (ZIndex: 3)
- **Cooldown Progress**: Red fill bar (ZIndex: 3)
- **Cooldown Timer**: Time text overlay (ZIndex: 4)

## Styling

- **Container Size**: 60x88 pixels (60x60 icon + 28px for name and cooldown)
- **Icon Size**: Uses `UI_SIZES.ICON_ABILITY` (60x60)
- **Name Label**: 20px height with white text and black stroke
- **Cooldown Bar**: 4px height with red fill (#FF6464)
- **Fonts**: GothamBold for all text elements

## Integration with Ability System

The component integrates with the existing ability system:

- **AbilityCatalog**: Automatically pulls display name, icon, and cooldown duration
- **AbilityKey**: Type-safe ability identification
- **ImageConstants**: Uses predefined ability icons from the asset system

## States

- **Ready**: Cooldown progress = 0, button fully interactive
- **On Cooldown**: Progress > 0, button disabled, shows progress bar and timer
- **Hover/Selection**: Inherited from underlying IconButton component
