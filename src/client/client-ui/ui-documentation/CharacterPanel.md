# CharacterPanel Component Documentation

## Overview

The `CharacterPanel` is a comprehensive UI window component that displays the player's persistent data in a clean, organized interface. It integrates with the ss-fusion component library and provides real-time updates of player statistics.

## Features

### 📊 **Real-time Data Display**
- **Player Level**: Shows current player level with prominent styling
- **Resources**: Displays all player resources (Health, Mana, Stamina, Experience) with progress bars
- **Abilities**: Lists all abilities with their current levels and icons

### 🎨 **Modern UI Design**
- **Dark Theme**: Consistent with the game's dark color scheme
- **Progress Bars**: Visual representation of current/max resource values using ss-fusion ProgressBar
- **Card Layout**: Organized sections with rounded corners and proper spacing
- **Responsive Text**: Automatically scaled text for better readability

### ⚡ **Performance**
- **Reactive Updates**: Uses Fusion's reactive system for efficient real-time updates
- **Minimal Re-renders**: Only updates when actual data changes
- **Memory Efficient**: Proper cleanup and disposal patterns

## Usage

### Basic Implementation

```typescript
import { CharacterPanel } from "client-ui/organisms/panels";
import { Value } from "@rbxts/fusion";

// Create a toggle state
const panelVisible = Value(false);

// Create the character panel
const characterPanel = CharacterPanel({
    visible: panelVisible,
    onClose: () => {
        panelVisible.set(false);
    },
});
```

### With Custom Positioning

```typescript
const characterPanel = CharacterPanel({
    visible: panelVisible,
    onClose: () => panelVisible.set(false),
    Size: new UDim2(0, 450, 0, 650),
    Position: new UDim2(0, 50, 0.5, -325),
});
```

### Demo Implementation

The `CharacterPanelDemo` component provides a complete example with a toggle button:

```typescript
import { CharacterPanelDemo } from "client-ui/organisms/panels";

// Create and parent the demo
const demo = CharacterPanelDemo({
    Name: "CharacterDemo",
    Parent: game.Players.LocalPlayer.PlayerGui,
});
```

## Component Props

### CharacterPanelProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `visible` | `Value<boolean>` | `Value(false)` | Controls panel visibility |
| `onClose` | `() => void` | `undefined` | Callback when panel is closed |
| `Position` | `UDim2` | Center screen | Panel position |
| `Size` | `UDim2` | `400x600` | Panel dimensions |

## Data Sources

The CharacterPanel automatically connects to the following data sources:

### PlayerState Integration
- **Level**: `PlayerStateInstance.Level`
- **Resources**: `PlayerStateInstance.Resources`
- **Abilities**: `PlayerStateInstance.Abilities`

### Real-time Updates
- Automatically updates when server data changes
- Uses Fusion's reactive system for efficient updates
- No manual refresh required

## Architecture

### Component Structure

```
CharacterPanel
├── PanelWindow (base window container)
│   ├── TitleBar (with close button)
│   └── Content
│       ├── LevelSection
│       │   ├── Level Title
│       │   └── Level Value
│       ├── ResourcesSection
│       │   ├── Resources Title
│       │   └── ResourceDisplay[] (for each resource)
│       │       ├── Resource Name
│       │       ├── Progress Bar (ss-fusion)
│       │       └── Current/Max Text
│       └── AbilitiesSection
│           ├── Abilities Title
│           └── AbilityDisplay[] (for each ability)
│               ├── Ability Icon
│               ├── Ability Name
│               └── Ability Level
```

### ss-fusion Integration

The component leverages several ss-fusion components:

- **ProgressBar**: For resource visualization
- **Label**: For text elements (where applicable)
- **IconButton**: In the demo for toggling

### Styling

#### Color Scheme
- **Background**: `Color3.fromRGB(44, 44, 48)` - Section backgrounds
- **Panel**: `Color3.fromRGB(28, 28, 30)` - Main panel background
- **Content**: `Color3.fromRGB(36, 36, 40)` - Content area
- **Text**: White for titles, colored for values
- **Level**: `Color3.fromRGB(100, 200, 255)` - Blue accent

#### Typography
- **Font**: Gotham and GothamBold
- **Scaling**: TextScaled for responsive text
- **Hierarchy**: Different sizes for titles, values, and captions

## Dependencies

### Required Imports
```typescript
import { Label, ProgressBar } from "@trembus/ss-fusion";
import { PanelWindow } from "./PanelWindow";
import { PlayerStateInstance } from "client/states";
import { ResourcesCatalog, RESOURCE_KEYS } from "shared/catalogs/resources-catalog";
import { AbilityCatalog, ABILITY_KEYS } from "shared/catalogs/ability-catalog";
```

### External Dependencies
- `@rbxts/fusion`: Core reactive framework
- `@trembus/ss-fusion`: UI component library
- Project's shared catalogs and state management

## Performance Considerations

### Memory Usage
- Each panel creates approximately 15-20 GUI objects
- Reactive connections are properly managed by Fusion
- No memory leaks when panel is destroyed

### Update Frequency
- Only updates when actual data changes
- Uses computed values for derived data (like percentages)
- Minimal performance impact on game

### Rendering
- Static layout with dynamic content
- No frequent layout recalculations
- Efficient text rendering with TextScaled

## Future Enhancements

### Planned Features
- **Equipment Display**: Show equipped items
- **Statistics Tab**: Detailed player statistics
- **Achievements**: Progress on achievements
- **Skill Trees**: Visual skill progression

### Potential Improvements
- **Animations**: Smooth transitions for value changes
- **Themes**: Multiple color themes
- **Accessibility**: Better contrast and text sizing options
- **Mobile Support**: Touch-friendly interactions

## Troubleshooting

### Common Issues

1. **Panel not showing**: Check that `visible` is set to `true`
2. **Data not updating**: Verify PlayerState is properly initialized
3. **Styling issues**: Ensure ss-fusion is properly installed

### Debug Tips
- Use `warn()` statements to track data flow
- Check browser console for any errors
- Verify reactive connections are working

## Integration Examples

### Menu System Integration
```typescript
// In a main menu controller
import { CharacterPanel } from "client-ui/organisms/panels";

class MenuController {
    private characterPanelVisible = Value(false);
    
    showCharacterPanel() {
        this.characterPanelVisible.set(true);
    }
    
    hideCharacterPanel() {
        this.characterPanelVisible.set(false);
    }
}
```

### Keybind Integration
```typescript
// In an input controller
import { UserInputService } from "@rbxts/services";

UserInputService.InputBegan.Connect((input) => {
    if (input.KeyCode === Enum.KeyCode.C) {
        // Toggle character panel
        characterPanelVisible.set(!characterPanelVisible.get());
    }
});
```

This CharacterPanel provides a solid foundation for displaying player data and can be easily extended with additional features as the game evolves.
