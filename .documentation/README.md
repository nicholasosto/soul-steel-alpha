# Soul Steel Alpha - Documentation Index

**Last Updated**: August 1, 2025  
**Structure**: Organized by category for better navigation

## 📚 **Quick Start**

New to the project? Start here:
1. **[Project Structure](architecture/project-structure.md)** - Understand the codebase layout
2. **[Development Guide](guides/development-guide.md)** - Setup and development practices
3. **[Current Status](status/current-status.md)** - What's implemented and what's not
4. **[Quick Reference](reference/quick-reference.md)** - Common patterns and fixes

## 🔧 **API References**

Complete technical documentation for developers:

- **[Unified NPC Service](api/unified-npc-service.md)** - 🆕 Feature-configurable NPC system (basic + enhanced modes)
- **[Enhanced NPC Service](api/enhanced-npc-service.md)** - Legacy enhanced NPCs with combat integration
- **[Combat Service](api/combat-service.md)** - Combat system documentation and API reference
- **[Shared Modules](api/shared-modules.md)** - Shared module architecture guide

## 📖 **User Guides**

How-to guides for using game systems:

- **[NPC System](guides/npc-system.md)** - 🆕 Complete NPC guide with unified service documentation
- **[Zone System](guides/zone-system.md)** - 🆕 Complete guide to zone setup and configuration
- **[NPC Integration](guides/npc-integration.md)** - How to spawn and manage NPCs (legacy)
- **[UI System](guides/ui-system.md)** - UI development patterns and components
- **[Event System](guides/event-system.md)** - Client-server communication patterns
- **[Development Guide](guides/development-guide.md)** - Development best practices

## 🔄 **Migration Guides**

For transitioning between system versions:

- **[NPC Consolidation Summary](migration/npc-consolidation-summary.md)** - 🆕 Complete migration from old NPC services to unified system
- **[Phase 1 to Phase 2 NPCs](migration/phase1-to-phase2-npc.md)** - Legacy NPC migration guide

## 🏗️ **Architecture**

System design and technical architecture:

- **[Project Structure](architecture/project-structure.md)** - Overall project organization
- **[NPC System Design](architecture/npc-system-design.md)** - NPC architecture and design decisions
- **[Client Architecture Guidelines](architecture/CLIENT_ARCHITECTURE_GUIDELINES.md)** - 🆕 Controller architecture patterns
- **[Enhanced Combat Flow](architecture/ENHANCED_COMBAT_FLOW.md)** - Combat system design
- **[GDD Code Mapping](architecture/GDD_CODE_MAPPING.md)** - Game design to code mapping

## 🛠️ **Development & Implementation**

Development tools and implementation details:

- **[Agents](development/AGENTS.md)** - AI development assistants and MCP servers
- **[Attribute Service Integration](implementation/ATTRIBUTE_SERVICE_INTEGRATION.md)** - Service integration details
- **[Combat Service Implementation](implementation/COMBAT_SERVICE_IMPLEMENTATION.md)** - Combat system implementation

## � **Archive**

Historical documentation and completed work:

- **[Completed Projects](archive/completed/)** - 🆕 Successfully completed consolidation reports
- **[Old Analyses](archive/old-analyses/)** - Historical analysis and summary documents
- **[Legacy Documentation](archive/)** - Archived planning and implementation documents

---

## 🗂️ **Quick Navigation**

**I'm new to the project:**
- *Understand the project structure* → [Project Structure](architecture/project-structure.md)
- *Set up development environment* → [Development Guide](guides/development-guide.md)
- *See what's implemented* → [Current Status](status/current-status.md)
- *Get quick answers* → [Quick Reference](reference/quick-reference.md)

**I want to use a system:**
- All API documentation is in `api/`
- All user guides are in `guides/`
- All migration info is in `migration/`

**I'm working on architecture:**
- All design docs are in `architecture/`
- All implementation details are in `implementation/`  
- All development tools are in `development/`

**Looking for archives:**
- **[Completed Projects](archive/completed/)** - Successfully finished initiatives
- **[Old Analyses](archive/old-analyses/)** - Previous MCP analysis reports  
- **[Animation System Updates](archive/ANIMATION_SYSTEM_UPDATES.md)** - Historical animation docs
- **[Cooldown Timer Integration](archive/COOLDOWN_TIMER_INTEGRATION.md)** - Historical timer docs

## 📦 **Status & Reference**

Current state and quick lookups:

- **[Current Status](status/current-status.md)** - Complete implementation status with MCP analysis
- **[Documentation Update Plan](status/DOCUMENTATION_UPDATE_PLAN.md)** - Planned documentation improvements
- **[Quick Reference](reference/quick-reference.md)** - Common patterns and solutions
- **[Asset Inventory](reference/asset-inventory.md)** - Available models and assets

---

## 🎯 **Finding What You Need**

**I want to...**

- *Understand the project structure* → [Project Structure](architecture/project-structure.md)
- *Add NPCs to my game* → [NPC Integration Guide](guides/npc-integration.md)
- *Use the NPC API* → [Enhanced NPC Service API](api/enhanced-npc-service.md)
- *Set up development environment* → [Development Guide](guides/development-guide.md)
- *See what's working vs planned* → [Current Status](status/current-status.md)
- *Find common solutions* → [Quick Reference](reference/quick-reference.md)
- *Migrate from old NPC system* → [Phase 1 to Phase 2 Migration](migration/phase1-to-phase2-npc.md)

**For Contributors:**

- All API documentation is in `api/`
- User-facing guides are in `guides/`
- Architecture decisions are in `architecture/`
- Keep status files updated in `status/`

---

**Structure Overview:**

```bash
.documentation/
├── api/           # Technical API references
├── guides/        # User & developer guides  
├── architecture/  # System design documents
├── status/        # Project status & updates
├── migration/     # Version upgrade guides
├── reference/     # Quick lookups & troubleshooting
└── archive/       # Historical & deprecated docs
```
