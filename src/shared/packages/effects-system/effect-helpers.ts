/**
 * @file Effect Helpers
 * @description This file contains helper functions for managing effects in the effects system.
 * @author Trembus
 *
 */

import { EffectCatalog, EffectMeta } from "./effect-catalog";
import { VFXConfigOption, VFXKey } from "./effect-keys";

function parentInstancesToPart(rig: Model, partName: string, instances: Instance[]): Part | undefined {
	const rigPart = (rig.FindFirstChild(partName) as Part) || (rig.FindFirstChild("HumanoidRootPart") as Part);
	if (!rigPart) {
		warn(`No matching part found in rig for effect template: ${partName}`);
		return undefined;
	}

	instances.forEach((instance) => {
		instance.Parent = rigPart;
	});

	return rigPart;
}

function loadEffectToRig(key: VFXKey, rig: Model): Instance[] | undefined {
	/* Get Meta information for the effect */
	const effectMeta = EffectCatalog[key];

	/* Check if the part|model exists in the catalog */
	const effectTemplate = effectMeta?.effectTemplate;
	if (!effectTemplate) return undefined;

	/* Clone the effect template to avoid modifying the original */
	const templateClone = effectTemplate.Clone();
	if (templateClone === undefined) return undefined;

	/* Store the instances for cleanup later */
	const instances: Instance[] = [];
	templateClone.GetChildren().forEach((child) => {
		instances.push(child);
	});
	let parentName = "HumanoidRootPart";
	if (effectTemplate.IsA("Part")) {
		parentName = effectTemplate.FindFirstChild("Attachment")?.Name || "HumanoidRootPart";
		const parented = parentInstancesToPart(rig, parentName, instances);
		if (!parented) return undefined;
	} else {
		templateClone.GetChildren().forEach((child) => {
			parentInstancesToPart(rig, child.Name, instances);
		});
	}
	return instances;
}

export function RunEffect(key: VFXKey, rig: Model) {
	/* Clones and attaches the effect to the character rig */
	const vfxParts = loadEffectToRig(key, rig);
	/* Get meta information for the effect */
	const effectMeta = getEffectMeta(key) as EffectMeta;
	if (!vfxParts || !effectMeta) return undefined;
	task.delay(effectMeta.defaultDuration, () => {
		warn(`Removing effect ${key} from rig after duration`);
		vfxParts.forEach((part) => {
			if (part.Parent) {
				part.Destroy();
			}
		});
	});
	return vfxParts;
}

export function getEffectMeta(key: VFXKey): EffectMeta | undefined {
	return EffectCatalog[key];
}
