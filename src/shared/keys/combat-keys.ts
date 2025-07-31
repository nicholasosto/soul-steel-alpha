/**
 * @file src/shared/keys/combat-keys.ts
 * @module CombatKeys
 * @layer Shared/Keys
 * @description Key definitions for combat system including weapons, actions, and effects
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

// Combat Action Keys
export const COMBAT_ACTION_KEYS = {
	BASIC_ATTACK: "BASIC_ATTACK",
	WEAPON_SKILL: "WEAPON_SKILL",
	DODGE: "DODGE",
	BLOCK: "BLOCK",
	COUNTER: "COUNTER",
	COMBO_FINISHER: "COMBO_FINISHER",
} as const;

export type CombatActionKey = (typeof COMBAT_ACTION_KEYS)[keyof typeof COMBAT_ACTION_KEYS];

// Weapon Type Keys
export const WEAPON_TYPE_KEYS = {
	SWORD: "SWORD",
	STAFF: "STAFF",
	BOW: "BOW",
	DAGGER: "DAGGER",
	HAMMER: "HAMMER",
	SHIELD: "SHIELD",
	FISTS: "FISTS",
} as const;

export type WeaponTypeKey = (typeof WEAPON_TYPE_KEYS)[keyof typeof WEAPON_TYPE_KEYS];

// Combat Status Keys
export const COMBAT_STATUS_KEYS = {
	IDLE: "IDLE",
	ATTACKING: "ATTACKING",
	DEFENDING: "DEFENDING",
	STUNNED: "STUNNED",
	CHANNELING: "CHANNELING",
	DEAD: "DEAD",
} as const;

export type CombatStatusKey = (typeof COMBAT_STATUS_KEYS)[keyof typeof COMBAT_STATUS_KEYS];

// Combat Signal Keys (for network communication)
export const COMBAT_SIGNAL_KEYS = {
	EXECUTE_ATTACK: "EXECUTE_ATTACK",
	EQUIP_WEAPON: "EQUIP_WEAPON",
	START_COMBO: "START_COMBO",
	CONTINUE_COMBO: "CONTINUE_COMBO",
	CANCEL_ACTION: "CANCEL_ACTION",
	REQUEST_COMBAT_STATS: "REQUEST_COMBAT_STATS",
} as const;

export type CombatSignalKey = (typeof COMBAT_SIGNAL_KEYS)[keyof typeof COMBAT_SIGNAL_KEYS];

// Damage Type Keys
export const DAMAGE_TYPE_KEYS = {
	PHYSICAL: "PHYSICAL",
	MAGICAL: "MAGICAL",
	FIRE: "FIRE",
	ICE: "ICE",
	EARTH: "EARTH",
	SOUL: "SOUL",
	PURE: "PURE",
} as const;

export type DamageTypeKey = (typeof DAMAGE_TYPE_KEYS)[keyof typeof DAMAGE_TYPE_KEYS];
