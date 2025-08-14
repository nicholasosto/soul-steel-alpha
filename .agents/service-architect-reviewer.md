---
title: Service Architect Reviewer Playbook
description: Workflow and checklists for auditing and refactoring server services to match Soul Steel Alpha architecture, patterns, and quality gates.
version: 1.0.0
lastUpdated: 2025-08-14
owner: soul-steel-alpha maintainers
audience: automated agent (and contributors)
scope:
	- src/server/services/**
	- src/shared/**
language: TypeScript (roblox-ts)
build:
	tasks:
		- Build rbxts
	commands:
		- pnpm run build
policies:
	- Singleton service with getInstance()
	- @rbxts/net: no Promise in ServerAsyncFunction signatures
	- Explicit undefined checks (no generic truthy/falsy)
	- Minimal public API + documented Public API section
	- Service Registry integration when an interface exists
	- DEBUG logging gates for noisy output
	- Avoid redundant existence checks when types are non-optional; rely on the type system when safe
tags: [rbxts, roblox, services, architecture, review, tsdoc]
---

## Service Architect Reviewer

This playbook guides a systematic service audit and refactor for Soul Steel Alpha. It encodes conventions from .github/copilot-instructions.md and recent service cleanups.

## Mission and outcomes

- Remove duplication and unused code in services.
- Tighten public API surface; make internals private.
- Ensure TSDoc completeness with a Public API section.
- Wire services into the Service Registry via interfaces.
- Add optional Studio-only debug tooling for observability.
- Validate with build and light sanity checks.

## Review checklist

- Structure
	- Service follows singleton pattern with getInstance().
	- File naming matches conventions (kebab-case for services).
- API hygiene
	- Unused public methods removed or made private.
	- Public methods are PascalCase; private/internal are camelCase.
	- Public API documented in a dedicated section in the header TSDoc.
- Patterns and integration
	- If an interface exists (service-interfaces.ts), register an adapter in Initialize() via service-registry.ts.
	- @rbxts/net: ServerAsyncFunction signatures return plain types (no Promise wrapper).
	- Add a DEBUG gate for verbose prints/logs.
- Validation and safety
	- Use explicit undefined checks; avoid truthy/falsy pitfalls.
	- Rate-limit client-callable handlers if applicable.
	- Never trust client input; validate on server.

### TypeScript vs runtime checks (rbxts specifics)

- When checks are NOT needed
	- Non-optional values created in the same scope or guaranteed by constructors/Initialize(): no extra undefined check right after creation.
	- Services acquired via `game.GetService` that are typed as non-optional in rbxts: no existence guard is required.
	- Constants/catalogs/keys imported with `as const`: do not check for undefined.

- When checks ARE required
	- Optional fields and lookups: `Map.get`, dictionary indexing, `array.find`, or catalog lookups can return `undefined` — check explicitly.
	- Roblox Instances that can be absent/destroyed: `Player.Character`, `HumanoidRootPart`, `FindFirstChild*` results — check for `undefined` before use.
	- After yields or asynchronous boundaries: references may be invalidated; re-validate Instances/parts.
	- Network inputs from clients: always validate (use DTOs and `zod` or centralized type guards in `shared/helpers/type-guards.ts`).
	- External resources that may not be loaded yet (animations, assets): add readiness checks or loader gates.

- Practical guidance
	- Prefer early-return guards with explicit `=== undefined` checks to narrow types.
	- Avoid truthy/falsy for values that can be 0, "", or false; check exact conditions (e.g., `arr.size() === 0`).
	- Use the non-null assertion `!` sparingly and only after establishing strong invariants (document why it is safe).
	- Consider `WaitForChild` when presence is required; otherwise handle missing children gracefully.
- Documentation
	- TSDoc header updated with summary, events/remotes (if any), Public API, examples.
	- Examples reference the singleton instance consistently.
- Quality gates
	- Build passes with pnpm run build or the Build rbxts task.
	- No new lints/types errors (if linters are configured).

## Step-by-step workflow

1) Discovery
- Skim the target service under src/server/services/. Identify:
	- Public vs. private methods, event wiring, remotes, and registry usage.
	- Obvious duplication (rate limiting, spawn checks, loader logic).

2) Analysis
- Note unused public methods (search usages). Consolidate repeated helpers.
- Confirm interface presence in service-interfaces.ts and registry accessors.

3) Propose changes (small, safe deltas)
- Privatize internals; prune unused APIs.
- Extract tiny helpers (e.g., rateOk, spawn checks) to de-duplicate.
- Add DEBUG flag for noisy logs.
- Prepare an adapter to register into the Service Registry if applicable.

4) Implement
- Make edits in the service file only where necessary; avoid broad reformatting.
- Add/extend the TSDoc header with a Public API section and examples.
- Register the interface adapter in Initialize() (method-based, not arrow fields) delegating to the singleton wrappers.

5) Verify
- Build the project to ensure types compile.
- If changes affect runtime wiring, sanity-check key call paths.

6) Optional: debug tooling
- Add a Studio-only server script under src/server/demos/ for admin/debug commands (e.g., “!combat sessions”).
- Gate with RunService:IsStudio() and/or an allowlist.

## Documentation standards

- TSDoc header should contain:
	- Summary, responsibilities, and key events/remotes.
	- Public API section: list and describe public methods (inputs/outputs, side-effects, error modes).
	- Short example demonstrating singleton usage.

Example Public API blurb (adapt wording per service):

"""
Public API
- Initialize(): Sets up connections and registers interface adapter.
- FooBar(entity: SSEntity, options: FooOptions): boolean — Validates and executes X.
- IsActive(entity: SSEntity): boolean — Read-only query for systems/UI.
"""

## Patterns to enforce

- Singleton service with getInstance() and minimal public surface.
- Definitions.Create for @rbxts/net without Promise return types in server async functions.
- Service Registry adapter uses method shorthand and delegates to the singleton; avoid arrow-function fields to prevent rbxts “non-method” assignment issues.
- Explicit undefined checks for safety.
- DEBUG flag for noisy logs.

## Anti-patterns to avoid

- Mixing concerns (e.g., input handling inside ability/movement services).
- Duplicated network calls across controllers/services.
- Promise-wrapped server async function signatures.
- Large public API with vague responsibilities.

## Quality gates and validation

- Build: project compiles cleanly.
- Lint/Typecheck: no new warnings (when configured).
- Smoke check: if you changed event wiring, briefly trace key handlers.

Optional commands (Windows PowerShell):

```powershell
# Build rbxts
pnpm run build

# Build MCP server (if needed)
pnpm run build:mcp
```

## Deliverables

- Refactored service with:
	- Pruned/privatized APIs, small helpers for de-duplication.
	- Updated TSDoc header with Public API section and examples.
	- Optional DEBUG gate for logs.
	- Registry adapter registration when an interface exists.
- Brief change summary and verification notes.

## PR/commit summary template

- Summary: what changed and why (duplication removed, unused APIs dropped, DEBUG gate added, registry wired).
- Public API: list resulting public methods.
- Risks: note any behavior changes; otherwise “no functional change expected.”
- Validation: build status and any quick runtime sanity checks.

## Rollback and safety

- Keep changes scoped and incremental; prefer private-scoping over deletion when uncertain.
- If regressions appear, revert the single service file change first.

## References

- Project conventions: .github/copilot-instructions.md
- Service interfaces/registry: src/server/services/service-interfaces.ts, src/server/services/service-registry.ts
