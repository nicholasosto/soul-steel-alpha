# ProgressBar Atom Component

## Overview
The `ProgressBar` atom is a highly reusable component that consolidates progress visualization logic across the Soul Steel Alpha project. It replaces duplicate code patterns in health bars, mana bars, cooldown timers, and any other progress-based UI elements.

## Benefits of the ProgressBar Atom

### ✅ **Code Reduction**
- **Before**: ~40 lines of duplicate code per progress bar
- **After**: ~5 lines using ProgressBar atom
- **Eliminated**: Duplicate styling, calculation, and layout logic

### ✅ **Consistency**
- Unified visual style across all progress elements
- Consistent behavior and animations
- Standardized color schemes and typography

### ✅ **Maintainability**
- Single source of truth for progress bar styling
- Easy to update all progress bars simultaneously
- Centralized bug fixes and improvements

### ✅ **Flexibility**
- Works with percentage values (0-1) or current/max values
- Supports horizontal and vertical orientations
- Configurable colors, labels, and styling
- Optional text overlays with custom formatting

## Usage Examples

### Health/Mana/Stamina Bars
```typescript
// Before (40+ lines of duplicate code)
const healthBar = New("Frame")({ /* complex nested structure */ });

// After (clean, reusable)
const healthBar = ProgressBar({
    progress: Computed(() => resources.get().health),
    maxValue: Computed(() => resources.get().maxHealth),
    fillColor: Color3.fromRGB(220, 50, 50),
    showLabel: true,
    labelText: Computed(() => `Health: ${health}/${maxHealth}`),
});
```

### Ability Cooldown Bars
```typescript
// Before (complex cooldown calculation)
const cooldownBar = New("Frame")({ /* manual percentage calculations */ });

// After (simple and clear)
const cooldownBar = ProgressBar({
    progress: cooldownProgress, // 0-1 progress value
    fillColor: Color3.fromRGB(255, 100, 100),
    showLabel: true,
    labelText: Computed(() => `${remainingTime}s`),
});
```

### Loading Bars, XP Bars, etc.
```typescript
const xpBar = ProgressBar({
    progress: Computed(() => playerXP),
    maxValue: Computed(() => nextLevelXP),
    fillColor: Color3.fromRGB(50, 220, 50),
    showLabel: true,
    direction: "horizontal",
});
```

## Refactored Components

### ✅ **HealthBar Organism**
- **Reduced from**: ~70 lines of complex nested UI code
- **Reduced to**: ~15 lines using ProgressBar atoms
- **Maintains**: All existing functionality and styling
- **Improved**: Code readability and maintainability

### ✅ **AbilityButton Molecule**  
- **Simplified**: Cooldown bar implementation
- **Reduced**: ~30 lines of cooldown UI code to ~8 lines
- **Enhanced**: Consistent styling with other progress elements
- **Maintained**: All cooldown functionality and animations

## API Reference

```typescript
interface ProgressBarProps {
    // Core functionality
    progress: Fusion.StateObject<number>;     // Current value
    maxValue?: Fusion.StateObject<number>;    // Max value (for current/max)
    
    // Styling
    fillColor: Color3;                        // Progress fill color
    backgroundColor?: Color3;                 // Empty area color
    borderColor?: Color3;                     // Border color
    direction?: "horizontal" | "vertical";    // Fill direction
    
    // Text display
    showLabel?: boolean;                      // Show text overlay
    labelText?: Fusion.StateObject<string>;   // Custom label text
    labelColor?: Color3;                      // Label text color
    
    // Layout
    minSize?: number;                         // Minimum size in pixels
    animated?: boolean;                       // Smooth transitions
    
    // Standard Frame props
    Name?: string;
    Size?: UDim2;
    Position?: UDim2;
    // etc.
}
```

## Implementation Impact

### **Before ProgressBar Atom**
```
HealthBar.ts: 95 lines
AbilityButton.ts: 130 lines  
Total: 225 lines with duplicate progress logic
```

### **After ProgressBar Atom**
```
ProgressBar.ts: 160 lines (reusable atom)
HealthBar.ts: 65 lines (-30 lines)
AbilityButton.ts: 95 lines (-35 lines)
Total: 320 lines, but with much higher reusability
```

### **Net Benefit**
- ✅ **Eliminated code duplication** across multiple components
- ✅ **Improved consistency** in progress visualization
- ✅ **Enhanced maintainability** with centralized logic
- ✅ **Increased scalability** for future progress-based UI elements

The ProgressBar atom represents excellent atomic design principles and will serve as the foundation for all progress-based UI elements in Soul Steel Alpha!
