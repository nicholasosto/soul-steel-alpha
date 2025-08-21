import { Value } from "@rbxts/fusion";
import { SoundService } from "@rbxts/services";
import { ImageConstants } from "shared/asset-ids";
import { AnimationSets } from "shared/asset-ids/animation-assets";
import { isSSEntity, PlayRandomAnimationFromSet, PlayAnimation } from "shared/helpers";
import { VFXKey } from "shared/packages";

import { SSEntity } from "shared/types";
import { EffectRemotes } from "shared/network";
const CastSuccessSound = SoundService.FindFirstChild("CastSuccess") as Sound;
const CastFailSound = SoundService.FindFirstChild("CastFail") as Sound;

/* -------------------------- Key - Meta - Type - Catalog --------------------------*/
export const ABILITY_KEYS = ["Melee", "Soul-Drain", "Earthquake", "Ice-Rain"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];
export interface AbilityMeta {
	/** The unique identifier for this ability, used for registration and activation */
	abilityKey: AbilityKey;

	/** Cooldown time in seconds before the ability can be used again */
	cooldown: number; // Cooldown in seconds

	/** Duration in seconds that the ability effect lasts */
	duration: number; // Duration in seconds

	/** Resource cost required to activate the ability (e.g., mana, energy, stamina) */
	cost: number; // Resource cost, e.g., mana or energy

	/** Base damage dealt by this ability (if it's a damage ability) */
	baseDamage?: number; // Optional damage value

	/** Critical hit chance (0.0 to 1.0) for this ability */
	criticalChance?: number; // Optional crit chance

	/** Critical hit damage multiplier */
	criticalMultiplier?: number; // Optional crit multiplier

	/** Whether this ability requires a target to be selected */
	requiresTarget?: boolean; // Whether ability needs a target

	/** User-friendly display name shown in the UI */
	displayName: string;

	/** Detailed description of the ability's effects and usage */
	description: string;

	/** Roblox asset ID for the ability's icon image */
	icon: string;

	/** Array of animation IDs that can be randomly selected when the ability is cast */
	animationSet?: readonly string[];

	/** Cast Effect Key (VFX identifier) */
	castEffectKey?: VFXKey;

	/**
	 * Optional callback executed when the ability starts successfully.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity that activated the ability
	 * @param target - Optional target entity for the ability
	 */
	OnStartSuccess?: (entity: SSEntity, target?: SSEntity) => void;

	/**
	 * Optional callback executed when the ability fails to start.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity that attempted to activate the ability
	 */
	OnStartFailure?: (entity: SSEntity) => void;

	/**
	 * Optional callback executed when the ability is interrupted before completion.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity whose ability was interrupted
	 */
	OnInterrupt?: (entity: SSEntity) => void;

	/**
	 * Optional callback executed continuously while the ability is being held/charged.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity holding the ability
	 * @param holdTime - Time in seconds the ability has been held
	 */
	OnHold?: (entity: SSEntity, holdTime: number, target?: SSEntity) => void;

	/**
	 * Optional callback executed when the ability effect ends naturally.
	 * Will be implemented in the ability catalog using the effect system.
	 *
	 * @param entity - The entity whose ability ended
	 */
	OnEnd?: (entity: SSEntity) => void;
}
export type AbilityDTO = {
	[key in AbilityKey]: number; // Maps each ability key to its current level or state
};
export function makeDefaultAbilityDTO(): AbilityDTO {
	const dto: AbilityDTO = {} as AbilityDTO;
	for (const key of ABILITY_KEYS) {
		dto[key] = 0; // Default level or state for each ability
	}
	return dto;
}

export type AbilitiesState = {
	[key in AbilityKey]: Value<number>; // Reactive level value for the ability
};

export const makeDefaultAbilitiesState = (): AbilitiesState => {
	const abilitiesState: AbilitiesState = {} as AbilitiesState;
	for (const key of ABILITY_KEYS) {
		abilitiesState[key] = Value(0); // Initialize each ability with a default level of 0
	}
	return abilitiesState;
};

// Internal Helpers
function runCastSuccessEffects(abilityKey: AbilityKey, character: Model) {
	const entity = character as SSEntity;
	const animationSet = AbilityCatalog[abilityKey]?.animationSet;
	const castEffectKey = AbilityCatalog[abilityKey]?.castEffectKey;
	const duration = AbilityCatalog[abilityKey]?.duration ?? 1;

	if (entity === undefined || !isSSEntity(entity)) {
		warn("INVALID: Character model is not a valid SSEntity");
		return;
	}
	// Broadcast to clients to play VFX for this entity
	if (castEffectKey !== undefined) {
		EffectRemotes.Server.Get("RunEffectOnEntity").SendToAllPlayers(castEffectKey as VFXKey, entity, duration);
	}
	// optional: keep a subtle server-side ack logger

	// Play random animation from set if provided, otherwise play default taunt
	// Drive animation via client-side effect handler or keep server-triggered animation
	if (animationSet === undefined) return;
	PlayRandomAnimationFromSet(entity, animationSet);
}

function runCastFailEffects(character: Model) {
	const entity = character as SSEntity;
	if (entity === undefined || !isSSEntity(entity)) {
		warn("INVALID: Character model is not a valid SSEntity");
		return;
	}
	// Optional: client-side can render failure feedback based on messages; keep animation for now
	PlayAnimation(entity, "TakeDamage");
}

export const AbilityCatalog: Record<AbilityKey, AbilityMeta> = {
	Melee: {
		abilityKey: "Melee",
		displayName: "Melee Attack",
		description: "A basic melee attack ability.",
		castEffectKey: "Animal_Cast",
		cooldown: 0.5,
		duration: 0.5,
		cost: 5,
		baseDamage: 15,
		criticalChance: 0.1, // 10%
		criticalMultiplier: 1.8,
		requiresTarget: true,
		icon: ImageConstants.Ability.Melee,
		animationSet: AnimationSets.MeleeAnimationSet,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(AbilityCatalog.Melee.abilityKey, entity);
			print(`Catalog: ${entity.Name} used Melee on: ${target?.Name}`);
		},
	},
	"Ice-Rain": {
		abilityKey: "Ice-Rain",
		displayName: "Ice Rain",
		description: "Summons a rain of ice shards that damages enemies in an area.",
		cooldown: 10,
		duration: 3,
		cost: 20,
		baseDamage: 35,
		criticalChance: 0.15, // 15%
		criticalMultiplier: 2.2,
		requiresTarget: true,
		castEffectKey: "Animal_Cast",
		icon: ImageConstants.Ability.Ice_Rain,
		animationSet: AnimationSets.IceRainAnimationSet,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(AbilityCatalog["Ice-Rain"].abilityKey, entity);
			print(`Catalog: ${entity.Name} used Ice Rain on: ${target?.Name}`);
		},
		OnStartFailure: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity.Name} failed to use Ice Rain`);
		},
	},
	Earthquake: {
		abilityKey: "Earthquake",
		displayName: "Earthquake",
		description: "Causes a powerful earthquake that damages and stuns enemies in a large area.",
		cooldown: 15,
		duration: 4,
		cost: 30,
		baseDamage: 50,
		criticalChance: 0.12, // 12%
		criticalMultiplier: 2.5,
		requiresTarget: false, // Area effect ability
		castEffectKey: "Animal_Cast",
		icon: ImageConstants.Ability.Earthquake,
		animationSet: AnimationSets.EarthquakeAnimationSet,
		OnStartSuccess: (entity, target) => {
			warn("MELEE HOOK", "PLAYING PUNCH_01");
			PlayAnimation(entity, "Punch_01");
		},
		OnStartFailure: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity?.Name} failed to use Earthquake`);
		},
	},
	"Soul-Drain": {
		abilityKey: "Soul-Drain",
		displayName: "Soul Drain",
		description: "Drains the life force from enemies, healing the caster for a portion of the damage dealt.",
		cooldown: 12,
		duration: 5,
		cost: 25,
		baseDamage: 25,
		criticalChance: 0.2, // 20% - higher crit chance for life steal
		criticalMultiplier: 2.0,
		requiresTarget: true,
		icon: ImageConstants.Ability.Soul_Drain,
		animationSet: AnimationSets.SoulDrainAnimationSet,
		OnInterrupt: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity.Name} interrupted Soul Drain`);
		},
		OnHold: (entity, holdTime, target) => {
			print(`Catalog: ${entity.Name} is holding ${holdTime} Soul Drain on: ${target?.Name}`);
		},
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(AbilityCatalog["Soul-Drain"].abilityKey, entity);
			print(`Catalog: ${entity.Name} used Soul Drain on: ${target?.Name}`);
		},
		OnStartFailure: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity.Name} failed to use Soul Drain`);
		},
	},
} as const satisfies Record<AbilityKey, AbilityMeta>;
