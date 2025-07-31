# NPC Models Required

Based on your ReplicatedStorage structure, here are the models I've mapped in the NPC Model Catalog:

## ✅ Models I Found and Mapped

### Blood Folder
- ✅ **BloodToad** → `blood_toad` NPC type
- ✅ **Wendigo** → `skeleton` NPC type  
- ✅ **Zombie Hipster** → `zombie_hipster` NPC type

### Decay Folder  
- ✅ **Zombie** → `goblin` NPC type

### Fateless Folder
- ✅ **Fateless Master** → `fateless_master` NPC type (Boss)

### Robots Folder
- ✅ **Steam Bot** → `guard` NPC type
- ✅ **Evil Lord Hal 2000** → `evil_lord` NPC type (Boss)
- ✅ **Mecha Monkey** → `mecha_monkey` NPC type
- ✅ **Worker Bot** → `worker_bot` NPC type

### Spirit Folder
- ✅ **Elemental** → `elemental` NPC type
- ✅ **Dragon Boy** → `dragon_warrior` NPC type  
- ✅ **Dragon Girl** → `dragon_sorceress` NPC type
- ✅ **Anime Female** → `anime_female` NPC type

## 🔍 Models I Couldn't See Clearly

From your folder structure, I also noticed these but couldn't make out the exact names:
- **Animatronic** (in Robots folder)
- Other models in the folders that might be partially collapsed

## 📝 Models You Might Want to Add

Based on typical RPG games, you might want to consider adding:
- **Orc Warrior** (if you have any orc models)
- **Spider** or other creature models
- **Knight** or human warrior models
- **Wizard** or mage models

## 🎯 Current Phase 1 Setup

For Phase 1, I've mapped:
- **`goblin`** → Zombie model (basic enemy)
- **`skeleton`** → Wendigo model (medium enemy) 
- **`guard`** → Steam Bot model (ally/neutral)

## 🚀 Easy Expansion

To add new NPC types, just:
1. Add the model info to `NPC_MODEL_CATALOG` in `npc-model-catalog.ts`
2. Add the new type to `BasicNPCType` union 
3. Add template info to `BASIC_NPC_TEMPLATES`

The catalog system makes it super easy to add dozens of different NPC types! 🎮
