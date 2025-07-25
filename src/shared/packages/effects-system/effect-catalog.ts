import { VFX_KEYS, VFXKey } from "./effect-keys";
import { ReplicatedStorage } from "@rbxts/services";

const EffectPartsFolder = ReplicatedStorage.WaitForChild("SS Game Package").WaitForChild("VFXParts");
const DefaultTemplate = EffectPartsFolder.WaitForChild("Time_Aura") as Part;

export interface EffectMeta {
	key: VFXKey;
	effectTemplate: Part | Model;
	displayName: string;
	description: string;
	defaultDuration: number;
	defaultImmunityDuration: number;
}

export const EffectCatalog: Record<VFXKey, EffectMeta> = {
	CastFailInterupt: {
		key: "CastFailInterupt",
		effectTemplate: EffectPartsFolder.WaitForChild("Beam_Air") as Part,
		displayName: "Cast Fail Interruption",
		description: "Effect triggered when a cast is interrupted.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	CastStart: {
		key: "CastStart",
		effectTemplate: EffectPartsFolder.WaitForChild("Beam_Lava") as Part,
		displayName: "Cast Start",
		description: "Effect triggered when a cast starts.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	Damage: {
		key: "Damage",
		effectTemplate: EffectPartsFolder.WaitForChild("Beam_Water") as Part,
		displayName: "Damage",
		description: "Effect triggered when damage is dealt.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	Heal: {
		key: "Heal",
		effectTemplate: EffectPartsFolder.WaitForChild("Time_Aura") as Part,
		displayName: "Heal",
		description: "Effect triggered when healing occurs.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	Slow: {
		key: "Slow",
		effectTemplate: EffectPartsFolder.WaitForChild("Time_Aura") as Part,
		displayName: "Slow",
		description: "Effect triggered when a slow effect is applied.",
		defaultDuration: 1,
		defaultImmunityDuration: 1,
	},
	Poisoned: {
		key: "Poisoned",
		effectTemplate: EffectPartsFolder.WaitForChild("Toxic_Cloud") as Part,
		displayName: "Poisoned",
		description: "Effect triggered when a poison effect is applied.",
		defaultDuration: 2,
		defaultImmunityDuration: 2,
	},
	Stunned: {
		key: "Stunned",
		effectTemplate: EffectPartsFolder.WaitForChild("Evil_Emination") as Part,
		displayName: "Stunned",
		description: "Effect triggered when a stun effect is applied.",
		defaultDuration: 1.5,
		defaultImmunityDuration: 1.5,
	},
	FrostCast: {
		key: "FrostCast",
		effectTemplate: EffectPartsFolder.WaitForChild("Frost_Cast") as Part,
		displayName: "Frost Cast",
		description: "Effect triggered when a frost cast is applied.",
		defaultDuration: 55,
		defaultImmunityDuration: 2,
	},
};
