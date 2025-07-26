import { EffectRemotes } from "shared/network";
import { VFXKey } from "shared/packages";
import { RunEffect } from "shared/packages/effects-system/effect-helpers";

/**
 * Handles the RunEvent signal from clients to trigger visual effects.
 * This function is called when a client requests to run a specific VFX.
 *
 * @param vfxKey - The key of the visual effect to run.
 * @returns A boolean indicating whether the effect was successfully run.
 */
EffectRemotes.Server.Get("RUN_EVENT").SetCallback((player: Player, vfxKey: VFXKey): boolean => {
	// Validate the VFX key
	const rig = player.Character as Model;
	if (!rig) {
		warn(`Player ${player.Name} does not have a valid character model.`);
		return false;
	}

	try {
		RunEffect(vfxKey, rig);
		return true;
	} catch (error) {
		warn(`Failed to run effect ${vfxKey}:`, error);
		return false;
	}
});
