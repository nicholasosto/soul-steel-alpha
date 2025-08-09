# Migration to @trembus/ss-fusion Package
## Component Transfer Plan

**Date**: August 9, 2025  
**Strategy**: Move reusable atoms/molecules to ss-fusion package, keep game-specific organisms in Soul Steel Alpha

---

## 📦 **Components for Migration**

### **Atoms (Foundational Components)**
| Component | Status | Game-Specific? | Action |
|-----------|--------|----------------|--------|
| `IconButton` | ✅ Ready | No | **MIGRATE** - Enhanced button with selection states |
| `ProgressBar` | ✅ Ready | No | **MIGRATE** - Improved version of existing |
| `MessageBox` | ✅ Ready | No | **MIGRATE** - Notification system |
| `CloseButton` | ✅ Ready | No | **MIGRATE** - Simple close control |
| `SliceImageFrame` | ⚠️ Check | Possibly | **EVALUATE** - May be game-specific |
| `Layout` helpers | ✅ Ready | No | **MIGRATE** - Utility components |

### **Molecules (Composite Components)**
| Component | Status | Game-Specific? | Action |
|-----------|--------|----------------|--------|
| `CooldownButton` | ✅ Ready | No | **MIGRATE** - Universal cooldown system |
| `MenuButton` | ⚠️ Depends | Partial | **EVALUATE** - Uses game catalogs |
| `TitleBar` | ✅ Ready | No | **MIGRATE** - Generic title component |

### **Game-Specific (Keep in Soul Steel Alpha)**
| Component | Reason | Action |
|-----------|--------|--------|
| `AbilityButton` | Uses `AbilityCatalog`, `AbilityKey` | **KEEP** - Game-specific logic |
| `ResourceBars` | Uses `ResourcesCatalog`, player state | **KEEP** - Game data integration |
| `ButtonBar` organisms | Uses game-specific sizing/layout | **KEEP** - Game UI logic |

---

## 🎯 **Migration Strategy**

### **Phase 1: Prepare Components for Package**
1. **Remove Game Dependencies**: Strip out Soul Steel Alpha specific imports
2. **Standardize Interfaces**: Ensure consistent prop patterns
3. **Add Package Documentation**: JSDoc for external consumption
4. **Theme Abstraction**: Make colors/styling configurable

### **Phase 2: Package Integration**  
1. **Add to @trembus/ss-fusion**: Integrate components into package
2. **Update Package Exports**: Add new components to package index
3. **Version Bump**: Update package version for new components

### **Phase 3: Soul Steel Alpha Refactor**
1. **Update Imports**: Point to package versions
2. **Remove Custom Components**: Delete migrated files
3. **Update Organisms**: Adapt game-specific components to use package versions

---

## 🔧 **Component Modifications Needed**

### **IconButton Enhancements**
- ✅ Already has selection states and hover effects
- ✅ Configurable sizing and styling
- ⚠️ **Need**: Remove `ImageConstants` dependency
- ⚠️ **Need**: Make background images configurable

### **ProgressBar Improvements**  
- ✅ Already supports horizontal/vertical
- ✅ Has percentage and current/max modes
- ⚠️ **Need**: Better interface consistency with existing package version
- ⚠️ **Need**: Remove game-specific font references

### **CooldownButton Polish**
- ✅ Good cooldown logic and animation
- ✅ Integrates with IconButton
- ⚠️ **Need**: Remove `UI_SIZES` dependency
- ⚠️ **Need**: Make all styling configurable

### **MessageBox Abstraction**
- ✅ Good reactive message system
- ✅ Type-based color coding
- ⚠️ **Need**: Remove `SliceImageFrame` dependency or abstract it
- ⚠️ **Need**: Make positioning configurable

---

## 🚫 **Dependencies to Resolve**

### **Game-Specific Imports to Remove/Abstract**
```typescript
// Remove these dependencies:
import { ImageConstants } from "shared/asset-ids";
import { UI_SIZES } from "shared/constants/ui-constants";
import { SliceImageFrame } from "./SliceImageFrame";

// Replace with configurable props or defaults
```

### **Catalog Dependencies (Keep in Game)**
```typescript
// These stay in Soul Steel Alpha:
import { AbilityCatalog, AbilityKey } from "shared/catalogs";
import { MenuButtonCatalog } from "shared/catalogs/menu-catalog";
import { ResourcesCatalog } from "shared/catalogs/resources-catalog";
```

---

## 📋 **File Transfer Checklist**

### **Atoms to Migrate**
- [ ] `IconButton.ts` → Clean dependencies, enhance configurability
- [ ] `ProgressBar.ts` → Improve interface consistency  
- [ ] `MessageBox.ts` → Abstract SliceImage dependency
- [ ] `CloseButton.ts` → Remove ImageConstants dependency
- [ ] `Layout.ts` → Utility functions (if exists)

### **Molecules to Migrate**
- [ ] `CooldownButton.ts` → Remove UI_SIZES dependency
- [ ] `TitleBar.ts` → Generic title bar component

### **Documentation to Migrate**
- [ ] `ProgressBar.md` → Update for package usage
- [ ] `AbilityButton.md` → Keep game-specific parts, migrate generic parts
- [ ] Component interface documentation

---

## 🎉 **Expected Benefits**

### **For @trembus/ss-fusion Package**
1. **Enhanced IconButton**: Selection states, better interaction handling
2. **Improved ProgressBar**: Better interface, more features
3. **CooldownButton**: New molecule for cooldown systems
4. **MessageBox**: Notification system for games
5. **Battle-Tested Components**: Real-world usage validation

### **For Soul Steel Alpha**
1. **Reduced Codebase**: ~500+ lines removed from custom UI
2. **Package Maintenance**: Components maintained externally
3. **Consistency**: Standardized design system
4. **Focus**: More time on game-specific features

---

## 🚀 **Next Steps**

1. **Component Cleaning**: Remove game dependencies from target components
2. **Interface Standardization**: Ensure consistent prop patterns
3. **Documentation**: Create package-ready documentation
4. **Testing**: Verify components work independently
5. **Package Integration**: Add to @trembus/ss-fusion
6. **Soul Steel Alpha Refactor**: Update to use package versions

**Ready to start with IconButton migration?** 🎯
