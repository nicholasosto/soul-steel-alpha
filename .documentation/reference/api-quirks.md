# API Quirks and Dos/Don’ts

Copilot Chat should consult this before code changes involving Roblox APIs or @rbxts packages.

## @rbxts/net

- Do not return Promise types from `Definitions.ServerAsyncFunction` — declare plain return type; the framework handles yielding.
- Prefer explicit param/return typing in `Definitions.Create` calls.
- Validate all client-sent data on the server (DTOs + guards). Rate-limit when appropriate.
- Ensure remotes are defined in shared `network/` with clear naming and no duplication.

## Roblox Instances

- `FindFirstChild*` may return `undefined` — check explicitly before use. Re-validate after yields.
- `WaitForChild` yields; use only when presence is required. Avoid in hot paths; consider fast-fail with `FindFirstChild`.
- Player.Character and descendants can be `undefined` or replaced; don’t cache across time without re-check.
- `PrimaryPart` may be unset; avoid assuming it exists on characters.

## Humanoid and Rigs

- NPCs or players can be R6; if systems require R15, guard explicitly and early-return.
- HumanoidRootPart name is stable; other R15 names can vary for custom rigs — access defensively.

## Collections and Maps

- `Map.get`, dictionary indexing, and array `.find` can return `undefined` — explicit checks only; avoid truthy/falsy.
- Avoid mutating shared arrays during iteration; copy when needed.

## Async and Tasks

- Anything after `task.wait()` or async boundaries must re-validate Instances.
- Use `Promise.try`/`pcall` for engine calls known to throw (e.g., certain animation load edge cases).

## Assets and Animations

- Asset ids may not be loaded; check `IsLoaded` or use loaders/gates; handle failure paths.
- Call `LoadAnimation` on server or client based on your architecture; hold references carefully and clean up.

## Performance

- Avoid `WaitForChild` in tight loops. Cache service handles.
- Use early returns and narrow types to help Luau optimizer.

## Section Index

- See also: `validation-matrix.md` for when/what to validate.
- See `.github/copilot-instructions.md` for guardrails integrated into Copilot.

