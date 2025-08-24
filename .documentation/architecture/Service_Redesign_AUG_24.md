```mermaid
flowchart TD

  %% Core Layer
  subgraph Core["🧩 Core Layer"]
    PlayerLifecycleService["👤 PlayerLifecycleService\n(spawn + respawn + humanoid monitor)"]
    AttributesService["📊 AttributesService\n(syncs attributes, emits AttributesUpdated)"]
    ProgressionService["🏆 ProgressionService\n(xp, levels, rewards)"]
  end

  %% Combat Layer
  subgraph Combat["⚔️ Combat & Resources"]
    CombatService["⚔️ CombatService\n(combat sessions, damage calc, weapons, abilities)"]
    ResourceOps["💉 Resource Operations\n(health/mana/stamina authority)\n(merged DamageService facade)"]
  end

  %% World Layer
  subgraph World["🌍 World Systems"]
    ZoneService["📦 ZoneService\n(zone+ domain mgmt)"]
    CollectionService["🏷️ CollectionServiceManager\n(tag-based environmental items)"]
    NPCService["👹 NPCService\n(unified NPC AI + spawn mgmt)\n(merge UnifiedNPC + NPCSpawnManager)"]
  end

  %% Utility / Glue Layer
  subgraph Glue["🔧 Glue & Utilities"]
    MessageService["💬 MessageService\n(player notifications)"]
    ServiceRegistry["📚 ServiceRegistry\n(dependency injection, signal hub)"]
  end

  %% Signals between layers
  PlayerLifecycleService --> AttributesService
  AttributesService --> ResourceOps
  ProgressionService --> AttributesService
  CombatService --> ResourceOps
  CombatService --> ProgressionService
  NPCService --> CombatService
  ZoneService --> NPCService
  CollectionService --> ZoneService
  Glue --> Core
  Glue --> Combat
  Glue --> World
