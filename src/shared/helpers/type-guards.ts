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
	// Check for required base components
	const humanoid = model.FindFirstChild("Humanoid") as Humanoid | undefined;
	const humanoidRootPart = model.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	const primaryPart = model.PrimaryPart;

	if (!humanoid || !humanoidRootPart || !primaryPart) {
		return false;
	}

	// Check for required body parts
	const requiredParts = [
		"Head",
		"UpperTorso",
		"LowerTorso",
		"LeftUpperArm",
		"LeftLowerArm",
		"LeftHand",
		"RightUpperArm",
		"RightLowerArm",
		"RightHand",
		"LeftUpperLeg",
		"LeftLowerLeg",
		"LeftFoot",
		"RightUpperLeg",
		"RightLowerLeg",
		"RightFoot",
	];

	for (const partName of requiredParts) {
		const part = model.FindFirstChild(partName);
		if (!part || !part.IsA("MeshPart")) {
			return false;
		}
	}

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
