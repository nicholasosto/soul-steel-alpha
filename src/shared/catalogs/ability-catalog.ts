import { SoundService } from "@rbxts/services";
import { ImageConstants } from "shared/asset-ids";
import { AnimationSets, AnimationSetKey } from "shared/asset-ids/animation-assets";
import { isSSEntity, PlayRandomAnimationFromSet, PlayAnimation } from "shared/helpers";
import { AbilityKey } from "shared/keys";
import { AbilityMeta } from "shared/meta";
import { SSEntity } from "shared/types";
const CastSuccessSound = SoundService.FindFirstChild("CastSuccess") as Sound;
const CastFailSound = SoundService.FindFirstChild("CastFail") as Sound;

// Internal Helpers

function runCastSuccessEffects(abilityKey: AbilityKey, character: Model) {
	const entity = character as SSEntity;
	const animationSet = AnimationSets[abilityKey] as readonly string[] | undefined;
	const castEffectKey = AbilityCatalog[abilityKey]?.castEffectKey;
	const duration = AbilityCatalog[abilityKey]?.duration ?? 1;

	if (entity === undefined || !isSSEntity(entity)) {
		warn("INVALID: Character model is not a valid SSEntity");
		return;
	}
	if (castEffectKey !== undefined) {
		const castEffect = entity.FindFirstChild(castEffectKey) as ParticleEmitter | undefined;
		if (castEffect) {
			castEffect.Enabled = true;
			wait(0.5); // Allow effect to play briefly
			castEffect.Enabled = false;
		} else {
			warn(`Cast effect ${castEffectKey} not found on entity ${entity.Name}`);
		}
	}
	CastSuccessSound.Play();

	// Play random animation from set if provided, otherwise play default taunt
	if (animationSet && animationSet.size() > 0) {
		PlayRandomAnimationFromSet(entity, animationSet, duration);
	} else {
		PlayAnimation(entity, "Taunt");
	}
}

function runCastFailEffects(character: Model) {
	const entity = character as SSEntity;
	if (entity === undefined || !isSSEntity(entity)) {
		warn("INVALID: Character model is not a valid SSEntity");
		return;
	}
	CastFailSound.Play();
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
		icon: ImageConstants.Ability.Melee,
		animationSet: AnimationSets.MeleeAnimationSet,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(AbilityCatalog.Melee.abilityKey, entity);
			print(`Catalog: ${entity.Name} used Melee on: ${target?.Name}`);
		},
		OnStartFailure: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity.Name} failed to use Melee`);
		},
	},
	"Ice-Rain": {
		abilityKey: "Ice-Rain",
		displayName: "Ice Rain",
		description: "Summons a rain of ice shards that damages enemies in an area.",
		cooldown: 10,
		duration: 3,
		cost: 20,
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
		castEffectKey: "Animal_Cast",
		icon: ImageConstants.Ability.Earthquake,
		animationSet: AnimationSets.EarthquakeAnimationSet,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(AbilityCatalog.Earthquake.abilityKey, entity);
			print(`Catalog: ${entity?.Name} used Earthquake on: ${target?.Name}`);
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
