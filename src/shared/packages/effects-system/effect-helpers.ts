/**
 * @file Effect Helpers
 * @description This file contains helper functions for managing effects in the effects system.
 * @author Trembus
 *
 */

import { EffectCatalog, EffectMeta } from "./effect-catalog";
import { VFXKey } from "./effect-keys";

// Enhanced mapping with R6 fallbacks for better compatibility
const LIMB_FALLBACK_MAP = {
	Head: ["Head", "UpperTorso"],
	UpperTorso: ["UpperTorso", "Torso"],
	Torso: ["UpperTorso", "Torso"],
	LowerTorso: ["LowerTorso", "Torso"],
	LeftUpperArm: ["LeftUpperArm", "LeftArm"],
	LeftLowerArm: ["LeftLowerArm", "LeftArm"],
	LeftArm: ["LeftLowerArm", "LeftArm"],
	LeftHand: ["LeftHand", "LeftArm"],
	RightUpperArm: ["RightUpperArm", "RightArm"],
	RightLowerArm: ["RightLowerArm", "RightArm"],
	RightArm: ["RightLowerArm", "RightArm"],
	RightHand: ["RightHand", "RightArm"],
	LeftUpperLeg: ["LeftUpperLeg", "LeftLeg"],
	LeftLowerLeg: ["LeftLowerLeg", "LeftLeg"],
	LeftFoot: ["LeftFoot", "LeftLeg"],
	RightUpperLeg: ["RightUpperLeg", "RightLeg"],
	RightLowerLeg: ["RightLowerLeg", "RightLeg"],
	RightFoot: ["RightFoot", "RightLeg"],
} as const;

/**
 * Find the appropriate rig part with fallback support for R6/R15 compatibility
 */
function findRigPart(rig: Model, partName: string): Part | undefined {
	const fallbacks = LIMB_FALLBACK_MAP[partName as keyof typeof LIMB_FALLBACK_MAP];

	if (fallbacks) {
		for (const fallback of fallbacks) {
			const part = rig.FindFirstChild(fallback) as Part;
			if (part) return part;
		}
	}

	// Direct lookup if no fallbacks defined
	return rig.FindFirstChild(partName) as Part;
}

/**
 * Parent effect children to appropriate rig parts using data-driven approach
 */
function parentEffectChildToRig(child: Instance, rig: Model): Instance[] {
	const childName = child.Name;
	const attached: Instance[] = [];

	// Handle special cases
	if (childName === "Floor") {
		child.GetChildren().forEach((floorChild) => {
			floorChild.Parent = rig.FindFirstChild("HumanoidRootPart") || rig;
			const humanoid = rig.FindFirstChildOfClass("Humanoid");
			const hipHeight = humanoid ? humanoid.HipHeight : 0;
			const attachment = floorChild as Attachment;
			const adjustedHipHeight = hipHeight + 0.7; // Adjust for attachment position if needed
			if (attachment && attachment.IsA("Attachment")) {
				attachment.CFrame = new CFrame(0, -adjustedHipHeight, 0);
			}
			warn(
				`Parenting floor child ${floorChild.Name} to HumanoidRootPart with hip height: ${adjustedHipHeight} for ${rig.Name}`,
			);
			attached.push(floorChild);
		});
		return attached;
	}

	// Use data-driven approach for limb mapping
	const targetPart = findRigPart(rig, childName);
	const finalParent = targetPart || rig.FindFirstChild("HumanoidRootPart") || rig;

	child.GetChildren().forEach((grandChild) => {
		const attachment = grandChild as Attachment;
		const worldCFrame = attachment.IsA("Attachment") ? attachment.WorldCFrame : undefined;

		grandChild.Parent = finalParent;

		attached.push(grandChild);
	});

	return attached;
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

	const templateChildren = templateClone.GetChildren();
	const resultInstances: Instance[] = [];

	// Use data-driven approach instead of massive switch statement
	templateChildren.forEach((child) => {
		const attached = parentEffectChildToRig(child, rig);
		attached.forEach((inst) => resultInstances.push(inst));
	});

	// Clean up the temporary template
	templateClone.Destroy();

	return resultInstances;
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
