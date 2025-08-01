/**
 * @file src/shared/helpers/resource-helpers.ts
 * @module ResourceHelpers
 * @layer Shared/Helpers
 * @description Utility functions for resource calculations and validations
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-01 - Renamed from health-helpers to resource-helpers for clarity
 */

import { DamageInfo, HealingInfo, DamageType, HealingType } from "shared/types/ResourceTypes";
import { SSEntity } from "shared/types";

/**
 * Creates a basic damage info object for abilities
 */
export function createAbilityDamage(
	baseDamage: number,
	damageType: DamageType = "magical",
	sourceId?: string,
	canCrit: boolean = true,
): DamageInfo {
	return {
		baseDamage,
		damageType,
		sourceId,
		canCrit,
	};
}

/**
 * Creates a basic healing info object for abilities
 */
export function createAbilityHealing(
	baseHealing: number,
	healingType: HealingType = "ability",
	sourceId?: string,
	canCrit: boolean = true,
): HealingInfo {
	return {
		baseHealing,
		healingType,
		sourceId,
		canCrit,
	};
}

/**
 * Creates area of effect damage for multiple targets
 */
export function createAOEDamage(
	baseDamage: number,
	damageType: DamageType,
	sourceId: string,
	falloffMultiplier: number = 1.0,
): DamageInfo {
	return {
		baseDamage,
		damageType,
		sourceId,
		canCrit: true,
		multipliers: [falloffMultiplier],
	};
}

/**
 * Calculates damage based on distance for AOE abilities
 */
export function calculateDistanceFalloff(distance: number, maxRange: number, minMultiplier = 0.3): number {
	if (distance >= maxRange) return 0;

	const falloff = distance / maxRange;
	return math.max(minMultiplier, 1 - falloff);
}

/**
 * Validates if an entity is a valid target for damage/healing
 */
export function isValidTarget(entity: unknown): entity is SSEntity {
	if (entity === undefined || typeOf(entity) !== "Instance") return false;

	const model = entity as Model;
	return (
		model.IsA("Model") &&
		model.FindFirstChild("Humanoid") !== undefined &&
		model.FindFirstChild("HumanoidRootPart") !== undefined
	);
}

/**
 * Gets all entities within a radius of a position
 */
export function getEntitiesInRadius(center: Vector3, radius: number, workspace: Workspace): SSEntity[] {
	const entities: SSEntity[] = [];

	// Get all models in workspace
	const models = workspace
		.GetChildren()
		.filter((child): child is Model => child.IsA("Model") && isValidTarget(child));

	for (const model of models) {
		const humanoidRootPart = model.FindFirstChild("HumanoidRootPart") as BasePart;
		if (humanoidRootPart) {
			const distance = center.sub(humanoidRootPart.Position).Magnitude;
			if (distance <= radius) {
				entities.push(model as SSEntity);
			}
		}
	}

	return entities;
}
