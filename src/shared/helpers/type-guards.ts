/// <reference types="@rbxts/types" />
/**
 * @file        type-guards.ts
 * @module      TypeGuards
 * @summary     Type guard functions for runtime type validation.
 * @layer       shared/helpers
 * @description Provides utility functions for validating types at runtime.
 * @author       Trembus
 * @license      MIT
 * @since        0.1.0
 * @lastUpdated  2025-07-24 by Trembus
 */

import { SSEntity } from "shared/types/ss-entity";

/**
 * Type guard to validate if a Model is a valid SSEntity
 * @param model The model to validate
 * @returns true if the model has all required SSEntity properties
 */
export function isSSEntity(model: Model): model is SSEntity {
	// Minimal, robust check: character must have a Humanoid and a HumanoidRootPart.
	// PrimaryPart isn't guaranteed to be set on player characters, so don't require it.
	const humanoid = model.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
	const humanoidRootPart = model.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

	if (humanoid === undefined || humanoidRootPart === undefined) {
		return false;
	}

	// If it's an R6 rig, fail early because downstream systems assume R15 naming.
	// If you intend to support R6, relax this further.
	if (humanoid.RigType === Enum.HumanoidRigType.R6) {
		return false;
	}

	// Don't hard-require every R15 MeshPart; many NPCs or temporary load states may miss some parts.
	// The ability system mainly needs Humanoid + Root; deeper parts are accessed defensively elsewhere.
	return true;
}

/**
 * Validates and returns an SSEntity, or warns and returns undefined
 * @param model The model to validate
 * @param playerName Optional player name for better error messages
 * @returns The validated SSEntity or undefined if invalid
 */
export function validateSSEntity(model: Model, playerName?: string): SSEntity | undefined {
	if (!isSSEntity(model)) {
		const errorMsg =
			playerName !== undefined
				? `Character model for player ${playerName} is not a valid SSEntity`
				: `Model ${model.Name} is not a valid SSEntity`;
		warn(errorMsg);
		return undefined;
	}
	return model;
}
