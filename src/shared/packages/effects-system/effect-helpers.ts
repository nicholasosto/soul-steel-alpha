/**
 * @file Effect Helpers
 * @description This file contains helper functions for managing effects in the effects system.
 * @author Trembus
 *
 */

import { EffectCatalog, EffectMeta } from "./effect-catalog";
import { VFXConfigOption, VFXKey } from "./effect-keys";

// R15 Limb mapping for better organization
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

function applyEffectTransforms(instance: Instance, effectPart: Part) {
	// Apply any offset, rotation, or scale attributes
	const offset = effectPart.GetAttribute("Offset") as Vector3;
	const rotation = effectPart.GetAttribute("Rotation") as Vector3;
	const scale = effectPart.GetAttribute("Scale") as number;

	if (instance.IsA("BasePart")) {
		if (offset) {
			instance.CFrame = instance.CFrame.mul(new CFrame(offset));
		}
		if (rotation) {
			const rotCFrame = CFrame.Angles(math.rad(rotation.X), math.rad(rotation.Y), math.rad(rotation.Z));
			instance.CFrame = instance.CFrame.mul(rotCFrame);
		}
		if (scale !== undefined && typeIs(scale, "number")) {
			instance.Size = instance.Size.mul(scale);
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
	templateChildren.forEach((child) => {
		switch (child.Name) {
			case "Head":
				child.GetChildren().forEach((headChild) => {
					child.Parent = rig.FindFirstChild("Head") || rig.FindFirstChild("UpperTorso");
				});
				break;
			case "UpperTorso":
			case "Torso":
				child.GetChildren().forEach((upperTorsoChild) => {
					child.Parent = rig.FindFirstChild("UpperTorso") || rig.FindFirstChild("Torso");
				});
				break;
			case "LowerTorso":
				child.GetChildren().forEach((lowerTorsoChild) => {
					child.Parent = rig.FindFirstChild("LowerTorso") || rig.FindFirstChild("Torso");
				});
				break;
			case "LeftUpperArm":
				child.GetChildren().forEach((leftArmChild) => {
					child.Parent = rig.FindFirstChild("LeftUpperArm") || rig.FindFirstChild("LeftArm");
				});
				break;
			case "LeftLowerArm":
			case "LeftArm":
				child.GetChildren().forEach((leftLowerArmChild) => {
					child.Parent = rig.FindFirstChild("LeftLowerArm") || rig.FindFirstChild("LeftArm");
				});
				break;
			case "RightUpperArm":
				child.GetChildren().forEach((rightArmChild) => {
					child.Parent = rig.FindFirstChild("RightUpperArm") || rig.FindFirstChild("RightArm");
				});
				break;
			case "RightLowerArm":
			case "RightArm":
				child.GetChildren().forEach((rightLowerArmChild) => {
					child.Parent = rig.FindFirstChild("RightLowerArm") || rig.FindFirstChild("RightArm");
				});
				break;
			case "LeftUpperLeg":
				child.GetChildren().forEach((leftLegChild) => {
					child.Parent = rig.FindFirstChild("LeftUpperLeg") || rig.FindFirstChild("LeftLeg");
				});
				break;
			case "LeftLowerLeg":
				child.GetChildren().forEach((leftLowerLegChild) => {
					child.Parent = rig.FindFirstChild("LeftLowerLeg") || rig.FindFirstChild("LeftLeg");
				});
				break;
			case "RightUpperLeg":
				child.GetChildren().forEach((rightLegChild) => {
					child.Parent = rig.FindFirstChild("RightUpperLeg") || rig.FindFirstChild("RightLeg");
				});
				break;
			case "RightLowerLeg":
				child.GetChildren().forEach((rightLowerLegChild) => {
					child.Parent = rig.FindFirstChild("RightLowerLeg") || rig.FindFirstChild("RightLeg");
				});
				break;
			case "LeftHand":
				child.GetChildren().forEach((leftHandChild) => {
					child.Parent = rig.FindFirstChild("LeftHand") || rig.FindFirstChild("LeftArm");
				});
				break;
			case "RightHand":
				child.GetChildren().forEach((rightHandChild) => {
					child.Parent = rig.FindFirstChild("RightHand") || rig.FindFirstChild("RightArm");
				});
				break;
			case "Floor":
				// For floor effects, parent to the HumanoidRootPart or the rig itself
				child.GetChildren().forEach((floorChild) => {
					floorChild.Parent = rig.FindFirstChild("HumanoidRootPart") || rig;
					const hipHeight = rig.FindFirstChildOfClass("Humanoid")?.HipHeight || 0;
					const attachment = floorChild as Attachment;
					if (attachment) {
						attachment.CFrame = new CFrame(0, -hipHeight, 0);
					}
				});
				break;
			default:
				// For other parts, just parent to the rig
				child.GetChildren().forEach((childChild) => {
					childChild.Parent = rig.FindFirstChild(child.Name) || rig;
				});
				break;
		}
	});
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
