import { VFX_KEYS, VFXKey } from "./effect-keys";
import { ReplicatedStorage } from "@rbxts/services";

const EffectPartsFolderName = "EffectParts";

export interface EffectMeta {
	key: VFXKey;
	displayName: string;
	description: string;
	defaultDuration: number;
	defaultImmunityDuration: number;
}

export const EffectCatalog: Record<VFXKey, EffectMeta> = {
	CastFailInterupt: {
		key: "CastFailInterupt",
		displayName: "Cast Fail Interruption",
		description: "Effect triggered when a cast is interrupted.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	CastStart: {
		key: "CastStart",
		displayName: "Cast Start",
		description: "Effect triggered when a cast starts.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	CastStop: {
		key: "CastStop",
		displayName: "Cast Stop",
		description: "Effect triggered when a cast stops.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	Damage: {
		key: "Damage",
		displayName: "Damage",
		description: "Effect triggered when damage is dealt.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	Heal: {
		key: "Heal",
		displayName: "Heal",
		description: "Effect triggered when healing occurs.",
		defaultDuration: 0.5,
		defaultImmunityDuration: 0.5,
	},
	Slow: {
		key: "Slow",
		displayName: "Slow",
		description: "Effect triggered when a slow effect is applied.",
		defaultDuration: 1,
		defaultImmunityDuration: 1,
	},
	Poisoned: {
		key: "Poisoned",
		displayName: "Poisoned",
		description: "Effect triggered when a poison effect is applied.",
		defaultDuration: 2,
		defaultImmunityDuration: 2,
	},
	Stunned: {
		key: "Stunned",
		displayName: "Stunned",
		description: "Effect triggered when a stun effect is applied.",
		defaultDuration: 1.5,
		defaultImmunityDuration: 1.5,
	},
};
