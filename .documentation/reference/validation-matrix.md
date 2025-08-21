# Validation Matrix (Roblox-ts)

This matrix defines when you MUST validate vs. when it's SAFE not to. Copilot Chat should consult this before edits.

## Must Validate

- Optional lookups: Map.get, dictionary index, array.find, catalog lookups → may return `undefined`.
- Roblox Instances that can be absent/destroyed: Player.Character, HumanoidRootPart, FindFirstChild* results.
- After yields or async boundaries: Re-validate Instances/parts before use.
- Network inputs from clients: Validate with DTOs (`shared/dtos`) and type guards (`shared/helpers/type-guards.ts`); prefer zod on server.
- External assets: Animations, sounds, images → check loaded/ready state or gate with loaders.
- Post-destroy references: Any Instance stored across time → re-check existence before operations.

## Safe Without Extra Checks

- Non-optional values created in the same scope or guaranteed by constructors/Initialize().
- Services via `game.GetService` (rbxts types are non-optional) — no extra nil checks.
- Constants/catalogs/keys imported with `as const`.
- Locals immediately derived from validated values within same synchronous block.

## Practical Guard Patterns

- Prefer early returns with explicit `=== undefined` checks.
- Avoid truthy/falsy for values that can be 0, "", or false.
- Use `WaitForChild` only when presence is required; otherwise handle missing children gracefully.
- Non-null assertion `!` only after establishing a strong invariant — add a short comment explaining why it holds.

## Examples

```ts
// Optional lookup
const part = model.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
if (part === undefined) return; // narrow type; safe to use below

// Network input validation
import { isAbilityKey } from "shared/helpers/type-guards"; // example
export function onAbilityStart(player: Player, key: unknown) {
  if (!isAbilityKey(key)) return; // reject early
  // ... safe to use key
}

// Post-yield revalidation
const char = player.Character;
task.wait(0.1);
if (char === undefined || char.Parent === undefined) return; // re-validate
```
