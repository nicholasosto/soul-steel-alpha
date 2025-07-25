import { SoundService } from "@rbxts/services";
import { ImageConstants } from "shared/asset-ids";
import { isSSEntity, PlayAnimation } from "shared/helpers";
import { AbilityKey } from "shared/keys";
import { AbilityMeta } from "shared/meta";
import { SSEntity } from "shared/types";
const CastSuccessSound = SoundService.FindFirstChild("CastSuccess") as Sound;
const CastFailSound = SoundService.FindFirstChild("CastFail") as Sound;

// Internal Helpers

function runCastSuccessEffects(character: Model) {
	const entity = character as SSEntity;
	if (entity === undefined || !isSSEntity(entity)) {
		warn("INVALID: Character model is not a valid SSEntity");
		return;
	}
	CastSuccessSound.Play();
	PlayAnimation(entity, "Taunt");
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
		cooldown: 0.5,
		duration: 0.5,
		cost: 5,
		icon: ImageConstants.Ability.Melee,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(entity);
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
		icon: ImageConstants.Ability.Ice_Rain,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(entity);
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
		icon: ImageConstants.Ability.Earthquake,
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(entity);
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
		OnInterrupt: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity.Name} interrupted Soul Drain`);
		},
		OnHold: (entity, holdTime, target) => {
			print(`Catalog: ${entity.Name} is holding ${holdTime} Soul Drain on: ${target?.Name}`);
		},
		OnStartSuccess: (entity, target) => {
			runCastSuccessEffects(entity);
			print(`Catalog: ${entity.Name} used Soul Drain on: ${target?.Name}`);
		},
		OnStartFailure: (entity) => {
			runCastFailEffects(entity);
			print(`Catalog: ${entity.Name} failed to use Soul Drain`);
		},
	},
} as const satisfies Record<AbilityKey, AbilityMeta>;
