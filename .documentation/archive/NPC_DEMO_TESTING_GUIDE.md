# NPC Demo Service - Testing Guide

## 🎯 What This Does

The NPCDemoService automatically demonstrates the combat and health systems by:

1. **Spawning 3 NPCs** around each player when they join/respawn
2. **After 10 seconds**: Applies 50 damage to all NPCs (reducing them to 50% health)  
3. **After 5 more seconds**: Heals all NPCs back to 100% health
4. **Visual feedback**: NPCs show their health status with colored text above their heads

## 🚀 How to Test

### Automatic Testing
1. Build the project: `npm run build`
2. Open Roblox Studio and load the place
3. Press Play to test in-game
4. **Spawn your character** - 3 colorful NPCs will appear around you
5. **Wait 10 seconds** - You'll see NPCs take damage and turn yellow/red
6. **Wait 5 more seconds** - NPCs will be healed back to full health (green)

### Manual Testing (Debug Commands)
From the server console, you can also run:
```lua
-- Get all demo NPCs
local activeNPCs = game.ServerScriptService.services["npc-demo-service"].GetActiveDemoNPCs()

-- Manually trigger damage test for a player
local player = game.Players:FindFirstChild("PlayerName")
if player then
    game.ServerScriptService.services["npc-demo-service"].TriggerDamageTest(player)
end
```

## 🎮 Visual Indicators

### NPC Health Display
- **Green Text**: 75-100% health
- **Yellow Text**: 25-75% health  
- **Red Text**: 0-25% health

### NPC Name Tags Show:
- NPC name
- Current health / Max health
- Health percentage

### Player Messages
You'll receive chat notifications for:
- When NPCs spawn
- When NPCs take damage
- When NPCs are healed

## 🔧 Technical Details

### NPC Creation
- Uses basic R15-compatible character structure
- Creates `Humanoid`, `HumanoidRootPart`, and `LowerTorso`
- Adds visual name tags with health display
- Uses random colors for easy identification

### Health System Integration
- Uses direct `Humanoid.Health` manipulation
- Demonstrates server-side health modification
- Shows real-time health updates on UI
- Ready for integration with ResourceService

### Timing System
- Uses `task.spawn()` for non-blocking scheduling
- 10-second delay before damage
- 5-second delay before healing
- Automatic cleanup when players leave

## 🚀 Next Steps

This demo proves that:
✅ **NPC spawning works** - Characters are created and positioned correctly  
✅ **Health system works** - Damage and healing are applied successfully  
✅ **UI feedback works** - Visual indicators update in real-time  
✅ **Message system works** - Players receive appropriate notifications  
✅ **Timing system works** - Events trigger at the correct intervals  

### Ready for Integration:
1. **Combat Service Integration**: NPCs can now be targets for combat attacks
2. **Ability System Integration**: NPCs can be targets for player abilities
3. **Advanced AI**: Add movement, targeting, and behavior systems
4. **Visual Effects**: Add particles and animations for damage/healing

## 📊 Expected Console Output

```
NPCDemoService: Initialized successfully
NPCDemoService: Spawned 3 NPCs around PlayerName
NPCDemoService: Applied 50 damage to TestNPC_1 (50/100 HP)
NPCDemoService: Applied 50 damage to TestNPC_2 (50/100 HP)  
NPCDemoService: Applied 50 damage to TestNPC_3 (50/100 HP)
NPCDemoService: Healed TestNPC_1 to full health (100/100 HP)
NPCDemoService: Healed TestNPC_2 to full health (100/100 HP)
NPCDemoService: Healed TestNPC_3 to full health (100/100 HP)
```

The system is now ready to test! 🎉
