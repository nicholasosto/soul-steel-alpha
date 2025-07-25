/**
 * @file Effect Helpers
 * @description This file contains helper functions for managing effects in the effects system.
 * @author Trembus
 *
 */

import { EffectCatalog, EffectMeta } from "./effect-catalog";
import { VFXConfigOption, VFXKey } from "./effect-keys";

// R15 Limb mapping for better organization with fallbacks
const R15_LIMB_MAP = {
	Head: "Head",
	Torso: "UpperTorso",
	UpperTorso: "UpperTorso",
	LowerTorso: "LowerTorso",
	LeftArm: "LeftUpperArm",
	LeftHand: "LeftHand",
	LeftUpperArm: "LeftUpperArm",
	LeftLowerArm: "LeftLowerArm",
	RightArm: "RightUpperArm",
	RightHand: "RightHand",
	RightUpperArm: "RightUpperArm",
	RightLowerArm: "RightLowerArm",
	LeftLeg: "LeftUpperLeg",
	LeftFoot: "LeftFoot",
	LeftUpperLeg: "LeftUpperLeg",
	LeftLowerLeg: "LeftLowerLeg",
	RightLeg: "RightUpperLeg",
	RightFoot: "RightFoot",
	RightUpperLeg: "RightUpperLeg",
	RightLowerLeg: "RightLowerLeg",
} as const;

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
function parentEffectChildToRig(child: Instance, rig: Model): void {
	const childName = child.Name;

	// Handle special cases
	if (childName === "Floor") {
		child.GetChildren().forEach((floorChild) => {
			floorChild.Parent = rig.FindFirstChild("HumanoidRootPart") || rig;
			const hipHeight = rig.FindFirstChildOfClass("Humanoid")?.HipHeight || 0;
			const attachment = floorChild as Attachment;
			if (attachment && attachment.IsA("Attachment")) {
				attachment.CFrame = new CFrame(0, -hipHeight, 0);
			}
		});
		return;
	}

	// Use data-driven approach for limb mapping
	const targetPart = findRigPart(rig, childName);
	const finalParent = targetPart || rig;

	child.GetChildren().forEach((grandChild) => {
		grandChild.Parent = finalParent;
	});
}

function getTargetParent(rig: Model, effectPart: Part): { part: Part | undefined; attachment?: Attachment } {
	// Check for TargetLimb attribute
	const targetLimb = effectPart.GetAttribute("TargetLimb") as string;
	const attachmentPoint = effectPart.GetAttribute("AttachmentPoint") as string;

	// Map to R15 part name
	const r15PartName = targetLimb ? R15_LIMB_MAP[targetLimb as keyof typeof R15_LIMB_MAP] : undefined;
	const rigPartName = r15PartName || "HumanoidRootPart";

	const rigPart = rig.FindFirstChild(rigPartName) as Part;
	if (!rigPart) {
		warn(`No matching R15 part found in rig: ${rigPartName}`);
		return { part: undefined };
	}

	// Look for specific attachment if specified
	let attachment: Attachment | undefined;
	if (attachmentPoint) {
		attachment = rigPart.FindFirstChild(attachmentPoint) as Attachment;
		if (!attachment) {
			warn(`Attachment ${attachmentPoint} not found on ${rigPartName}, using part directly`);
		}
	}

	return { part: rigPart, attachment };
}

function parentInstancesToPart(rig: Model, effectPart: Part, instances: Instance[]): Part | undefined {
	const { part: rigPart, attachment } = getTargetParent(rig, effectPart);

	if (!rigPart) {
		return undefined;
	}

	// Parent to attachment if available, otherwise to the part
	const parentTarget = attachment || rigPart;

	instances.forEach((instance) => {
		// For certain effect types, we might want special handling
		const effectType = effectPart.GetAttribute("EffectType") as string;

		if (effectType === "Beam" && instance.IsA("Beam")) {
			// Beams need special attachment handling
			handleBeamParenting(instance, rigPart, attachment);
		} else {
			instance.Parent = parentTarget;
		}
	});

	return rigPart;
}

function handleBeamParenting(beam: Beam, rigPart: Part, attachment?: Attachment) {
	// For beams, we might want to connect to specific attachments
	if (attachment) {
		beam.Attachment0 = attachment;
		// You might want to find a second attachment or create one
		const attachment1 = rigPart.FindFirstChild("Attachment") as Attachment;
		if (attachment1 && attachment1 !== attachment) {
			beam.Attachment1 = attachment1;
		}
	}
	beam.Parent = rigPart;
}

/**
 * Apply positional offset to a BasePart
 */
function applyPositionOffset(instance: BasePart, offset: Vector3): void {
	instance.CFrame = instance.CFrame.mul(new CFrame(offset));
}

/**
 * Apply rotational transform to a BasePart
 */
function applyRotationTransform(instance: BasePart, rotation: Vector3): void {
	const rotCFrame = CFrame.Angles(math.rad(rotation.X), math.rad(rotation.Y), math.rad(rotation.Z));
	instance.CFrame = instance.CFrame.mul(rotCFrame);
}

/**
 * Apply scale transform to a BasePart
 */
function applyScaleTransform(instance: BasePart, scale: number): void {
	instance.Size = instance.Size.mul(scale);
}

function applyEffectTransforms(instance: Instance, effectPart: Part) {
	// Apply any offset, rotation, or scale attributes
	const offset = effectPart.GetAttribute("Offset") as Vector3;
	const rotation = effectPart.GetAttribute("Rotation") as Vector3;
	const scale = effectPart.GetAttribute("Scale") as number;

	if (instance.IsA("BasePart")) {
		if (offset) {
			applyPositionOffset(instance, offset);
		}
		if (rotation) {
			applyRotationTransform(instance, rotation);
		}
		if (scale !== undefined && typeIs(scale, "number")) {
			applyScaleTransform(instance, scale);
		}
	}
}

function validateEffectPart(effectPart: Part): boolean {
	// Validate that the effect part has required attributes
	const targetLimb = effectPart.GetAttribute("TargetLimb");
	if (targetLimb === undefined) {
		warn(`EffectPart missing TargetLimb attribute: ${effectPart.Name}`);
		return false;
	}

	// Check if target limb is valid R15 part
	if (!R15_LIMB_MAP[targetLimb as keyof typeof R15_LIMB_MAP]) {
		warn(`Invalid TargetLimb specified: ${targetLimb}`);
		return false;
	}

	return true;
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
		parentEffectChildToRig(child, rig);
		// Collect all children that were parented for tracking
		child.GetChildren().forEach((grandChild) => {
			resultInstances.push(grandChild);
		});
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
	warn(`Running effect ${key} on rig ${rig.Name} for duration ${effectMeta.defaultDuration}`, vfxParts);
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
