/**
 * @file src/client/effects/effect-runner.client.ts
 * @description Listens to effect broadcasts and plays local VFX on entities
 */

import { EffectRemotes } from "shared/network";
import { SSEntity } from "shared/types";
import { RunEffect } from "shared/packages/effects-system/effect-helpers";

function enableEmitterTemporarily(entity: SSEntity, effectKey: string, duration = 1): void {
	// Try to find a direct child emitter with the key name
	const emitter = entity.FindFirstChild(effectKey) as ParticleEmitter | undefined;
	if (emitter) {
		emitter.Enabled = true;
		task.delay(duration, () => {
			// Guard if emitter was removed
			if (emitter.Parent) emitter.Enabled = false;
		});
		return;
	}

	// Fallback: search descendants for a matching emitter
	for (const descendant of entity.GetDescendants()) {
		if (descendant.IsA("ParticleEmitter") && descendant.Name === effectKey) {
			const pe = descendant as ParticleEmitter;
			pe.Enabled = true;
			task.delay(duration, () => {
				if (pe.Parent) pe.Enabled = false;
			});
			return;
		}
	}

	// Optional: log missing effect binding
	// warn(`EffectRunner: No ParticleEmitter named ${effectKey} found on ${entity.Name}`);
}

// Listen for effect broadcasts from the server
EffectRemotes.Client.Get("RunEffectOnEntity").Connect((effectKey, entity, duration) => {
	if (!entity || !entity.Parent) return;

	// Prefer data-driven effect spawning via EffectCatalog
	const spawned = RunEffect(effectKey, entity, duration);
	if (spawned === undefined) {
		// Fallback to toggling a named ParticleEmitter if no catalog-driven effect exists
		enableEmitterTemporarily(entity, effectKey, duration ?? 1);
	}

	// Optional: sound hinting — if the entity has a Sound named like the effectKey, play it briefly
	const sound = entity.FindFirstChild(effectKey) as Sound | undefined;
	if (sound) {
		sound.Play();
		if (duration !== undefined && duration > 0) {
			task.delay(duration, () => {
				if (sound.IsDescendantOf(game)) sound.Stop();
			});
		}
	}
});

export {}; // ensure this compiles as a module
