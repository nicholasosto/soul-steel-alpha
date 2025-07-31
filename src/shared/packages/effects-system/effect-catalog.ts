import { CombatVFXKey, VFX_KEYS, VFXKey } from "./effect-keys";
import { ReplicatedStorage } from "@rbxts/services";

const EffectPartsFolder = ReplicatedStorage.WaitForChild("SS Game Package").WaitForChild("VFXParts");
const DefaultTemplate = EffectPartsFolder.WaitForChild("Time_Aura") as Part;

export interface EffectMeta {
	//key: VFXKey;
	effectTemplate: Part | Model;
	displayName: string;
	description: string;
	defaultDuration: number;
	defaultImmunityDuration: number;
}
export const CombatVFXCatalog: Record<CombatVFXKey, EffectMeta> = {
	SpeedBoost: {
		//key: "SpeedBoost",
		effectTemplate: EffectPartsFolder.WaitForChild("Speed_Boost") as Part,
		displayName: "Speed Boost",
		description: "Effect triggered when a speed boost is applied.",
		defaultDuration: 5,
		defaultImmunityDuration: 5,
	},
	DamageTaken: {
		//key: "DamageTaken",
		effectTemplate: EffectPartsFolder.WaitForChild("Damage_Taken") as Part,
		displayName: "Damage Taken",
		description: "Effect triggered when damage is taken.",
		defaultDuration: 1,
		defaultImmunityDuration: 1,
	},
	CastFailInterupt: {
		//key: "CastFailInterupt",
		effectTemplate: EffectPartsFolder.WaitForChild("Beam_Air") as Part,
		displayName: "Cast Fail Interruption",
		description: "Effect triggered when a cast is interrupted.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	RegenerateHealth: {
		//key: "RegenerateHealth",
		effectTemplate: EffectPartsFolder.WaitForChild("Heal_Aura") as Part,
		displayName: "Regenerate Health",
		description: "Effect triggered when health is regenerated.",
		defaultDuration: 2,
		defaultImmunityDuration: 2,
	},
	RegenerateStamina: {
		//key: "RegenerateStamina",
		effectTemplate: EffectPartsFolder.WaitForChild("Stamina_Aura") as Part,
		displayName: "Regenerate Stamina",
		description: "Effect triggered when stamina is regenerated.",
		defaultDuration: 2,
		defaultImmunityDuration: 2,
	},
	RegenerateMana: {
		//key: "RegenerateMana",
		effectTemplate: EffectPartsFolder.WaitForChild("Mana_Aura") as Part,
		displayName: "Regenerate Mana",
		description: "Effect triggered when mana is regenerated.",
		defaultDuration: 2,
		defaultImmunityDuration: 2,
	},
};
export const EffectCatalog: Record<VFXKey, EffectMeta> = {
	Frost_Cast: {
		//key: "Frost_Cast",
		effectTemplate: EffectPartsFolder.WaitForChild("Frost_Cast") as Part,
		displayName: "Frost Cast",
		description: "Effect triggered when a frost cast is applied.",
		defaultDuration: 5,
		defaultImmunityDuration: 2,
	},
	Animal_Cast: {
		//key: "Animal_Cast",
		effectTemplate: EffectPartsFolder.WaitForChild("Animal_Cast") as Part,
		displayName: "Animal Cast",
		description: "Effect triggered when an animal cast is applied.",
		defaultDuration: 5,
		defaultImmunityDuration: 2,
	},
	Void_Cast: {
		//key: "Void_Cast",
		effectTemplate: EffectPartsFolder.WaitForChild("Void_Cast") as Part,
		displayName: "Void Cast",
		description: "Effect triggered when a void cast is applied.",
		defaultDuration: 5,
		defaultImmunityDuration: 2,
	},
	Shrine_Cast: {
		//key: "Shrine_Cast",
		effectTemplate: EffectPartsFolder.WaitForChild("Shrine_Cast") as Part,
		displayName: "Shrine Cast",
		description: "Effect triggered when a shrine cast is applied.",
		defaultDuration: 5,
		defaultImmunityDuration: 2,
	},
	Shadow_Cast: {
		//key: "Shadow_Cast",
		effectTemplate: EffectPartsFolder.WaitForChild("Shadow_Cast") as Part,
		displayName: "Shadow Cast",
		description: "Effect triggered when a shadow cast is applied.",
		defaultDuration: 5,
		defaultImmunityDuration: 2,
	},
};
