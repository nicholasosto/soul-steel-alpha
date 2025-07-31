# Soul Steel Alpha - Documentation Index

**Last Updated**: July 31, 2025  
**Structure**: Organized by category for better navigation

## 📚 **Quick Start**

New to the project? Start here:
1. **[Project Structure](architecture/project-structure.md)** - Understand the codebase layout
2. **[Development Guide](guides/development-guide.md)** - Setup and development practices
3. **[Current Status](status/current-status.md)** - What's implemented and what's not
4. **[Quick Reference](reference/quick-reference.md)** - Common patterns and fixes

## 🔧 **API References**

Complete technical documentation for developers:

- **[Enhanced NPC Service](api/enhanced-npc-service.md)** - Complete API for NPCs with combat integration
- **[Combat Service](api/combat-service.md)** - Combat system documentation and API reference
- **[Shared Modules](api/shared-modules.md)** - Shared module architecture guide

## 📖 **User Guides**

How-to guides for using game systems:

- **[NPC Integration](guides/npc-integration.md)** - How to spawn and manage NPCs
- **[UI System](guides/ui-system.md)** - UI development patterns and components
- **[Event System](guides/event-system.md)** - Client-server communication patterns
- **[Development Guide](guides/development-guide.md)** - Development best practices

## 🏗️ **Architecture**

System design and technical architecture:

- **[Project Structure](architecture/project-structure.md)** - Overall project organization
- **[NPC System Design](architecture/npc-system-design.md)** - NPC architecture and design decisions

## 📊 **Project Status**

Current state and planning:

- **[Current Status](status/current-status.md)** - What's implemented, what's in progress
- *Changelog* - Recent changes and updates (coming soon)
- *Roadmap* - Future development plans (coming soon)

## 🔄 **Migration Guides**

Upgrading between versions:

- **[Phase 1 to Phase 2 NPCs](migration/phase1-to-phase2-npc.md)** - Migrating from basic to enhanced NPCs

## 🔍 **Reference**

Quick lookups and troubleshooting:

- **[Quick Reference](reference/quick-reference.md)** - Common patterns and solutions
- **[Asset Inventory](reference/asset-inventory.md)** - Available models and assets

## 📦 **Archive**

Historical and deprecated documentation:

- **[Old Analyses](archive/old-analyses/)** - Previous MCP analysis reports
- **[Animation System Updates](archive/ANIMATION_SYSTEM_UPDATES.md)** - Historical animation docs
- **[Cooldown Timer Integration](archive/COOLDOWN_TIMER_INTEGRATION.md)** - Historical timer docs

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
```
.documentation/
├── api/           # Technical API references
├── guides/        # User & developer guides  
├── architecture/  # System design documents
├── status/        # Project status & updates
├── migration/     # Version migration guides
├── reference/     # Quick reference materials
└── archive/       # Historical documentation
```
