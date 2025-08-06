# Soul Steel Alpha: GDD to Code Mapping

This document maps each major feature and system described in the Game Design Document (GDD) to the actual code files and folders in the repository. Use this as a reference for onboarding, auditing, or planning future work.

---

## 1. Core Architecture & Services

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Service-Oriented Architecture | `src/server/services/` (see below for implemented services)    |
| Type Safety & Validation      | `src/shared/types/`, `src/shared/helpers/type-guards.ts`      |
| Event-Driven Communication   | `src/shared/network/`, `src/server/services/message-service.ts`|
| Testing Framework            | (Planned, not present)                                        |

## 2. Abilities & Combat

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Ability System               | `src/server/services/ability-service.ts`, `src/shared/catalogs/ability-catalog.ts`, `src/shared/types/AbilityDTO.ts` |
| Combat System                | (Planned, not present)                                        |
| Combo Mechanics              | (Planned, not present)                                        |
| Weapon System                | (Partial) `src/shared/catalogs/force-catalog.ts` (combat logic planned) |
| Resource Management          | `src/server/services/resource-service.ts`, `src/shared/catalogs/resources-catalog.ts` |
## 2a. Implemented Server Services

| Service Name         | Status / Code File(s)                                      |
|----------------------|------------------------------------------------------------|
| ability-service      | Implemented: `src/server/services/ability-service.ts`       |
| animation-service    | Implemented: `src/server/services/animation-service.ts`     |
| data-service         | Implemented: `src/server/services/data-service.ts`          |
| message-service      | Implemented: `src/server/services/message-service.ts`       |
| resource-service     | Implemented: `src/server/services/resource-service.ts`      |
| zone-service         | Implemented: `src/server/services/zone-service.ts`          |
| unified-npc-service  | Implemented: `src/server/services/unified-npc-service.ts`   |
| humanoid-services    | Implemented: `src/server/services/humanoid-services.ts`     |
| combat-service       | (Planned, not present)                                     |

## 3. NPCs & AI

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| NPC System                   | `src/server/services/unified-npc-service.ts`, `src/shared/catalogs/npc-model-catalog.ts`, `src/shared/types/SSEntity.ts` |
| AI States & Behaviors        | `src/server/services/unified-npc-service.ts`                  |
| NPC Types                    | `src/shared/catalogs/npc-model-catalog.ts`                    |
| Boss/Elite NPCs              | (Planned, extensible in `npc-model-catalog.ts`)               |

## 4. Zones & World

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Zone System                  | `src/server/services/zone-service.ts`, `src/shared/catalogs/zone-catalog.ts`, `src/shared/meta/zone-meta.ts` |
| Zone Entry/Exit Events       | `src/server/services/zone-service.ts`                         |
| Zone Types                   | `src/shared/catalogs/zone-catalog.ts`                         |
| Environmental Effects        | (Partial) `src/shared/meta/zone-meta.ts`                      |

## 5. UI & Player Experience

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Reactive UI (Fusion)         | `src/client/ss-fusion-ui.client.ts`, `src/client/client-ui/`  |
| Message System               | `src/client/states/message-state.ts`, `src/shared/types/message-types.ts` |
| Player State Management      | `src/client/states/player-state.ts`, `src/shared/types/player-data.ts` |
| HUD & Screens                | `src/client/screens/PlayerHUD.ts`, `src/client/screens/SSFusionTests.ts` |

## 6. Progression & Content

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Ability Progression          | (Partial) `src/shared/types/player-data.ts`, `src/shared/catalogs/ability-catalog.ts` |
| Equipment System             | (Planned, not present)                                        |
| Achievements                 | (Planned, not present)                                        |
| Advanced/Elite Zones         | (Extensible in `zone-catalog.ts`)                             |
| Tutorial NPCs                | (Extensible in `npc-model-catalog.ts`)                        |

## 7. Art, Audio, Animation

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Animation System             | `src/server/services/animation-service.ts`, `src/shared/catalogs/animation-catalog.ts` |
| Audio                        | (Hooks in place, content in progress)                         |
| Visual Effects               | `src/shared/asset-ids/`, `src/shared/constants/ui-constants.ts`|

## 8. Community & Multiplayer (Planned)

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Multiplayer Combat           | (Planned, not present)                                        |
| Guild System                 | (Planned, not present)                                        |
| User-Generated Content       | (Planned, not present)                                        |
| Tournaments/Events           | (Planned, not present)                                        |

## 9. Roadmap & Documentation

| GDD Feature / System         | Code File(s) / Folder(s)                                      |
|-----------------------------|---------------------------------------------------------------|
| Roadmap                      | `soul_steel_gdd.md` (Development Roadmap section)             |
| API & Guides                 | `.documentation/` folder                                      |

---

**Legend:**
- **(Partial):** Feature is partially implemented or scaffolded.
- **(Planned, not present):** Feature is described in the GDD but not yet in code.
- **(Extensible):** System is designed to support this feature, but content may not be present yet.

Update this mapping as features are added, removed, or refactored.
