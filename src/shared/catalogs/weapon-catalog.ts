/**
 * @file src/shared/catalogs/weapon-catalog.ts
 * @module WeaponCatalog
 * @layer Shared/Catalogs
 * @description Weapon definitions and configurations for the combat system
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { CombatStats, StatusEffect } from "shared/types/ResourceTypes";

export interface WeaponInfo {
	id: string;
	name: string;
	weaponType: WeaponType;
	baseDamage: number;
	attackSpeed: number;
	range: number;
	criticalBonus: number;
	statRequirements: Partial<CombatStats>;
	specialEffects?: StatusEffect[];
	description: string;
	icon: string;
	rarity: WeaponRarity;
}

export type WeaponType = "sword" | "staff" | "bow" | "dagger" | "hammer" | "shield" | "fists";
export type WeaponRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/**
 * Catalog of all available weapons in the game
 */
export const WeaponCatalog: Record<string, WeaponInfo> = {
	fists: {
		id: "fists",
		name: "Bare Fists",
		weaponType: "fists",
		baseDamage: 5,
		attackSpeed: 1.2,
		range: 2,
		criticalBonus: 0,
		statRequirements: {},
		description: "Your natural weapons. Always available but limited in power.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "common",
	},

	iron_sword: {
		id: "iron_sword",
		name: "Iron Sword",
		weaponType: "sword",
		baseDamage: 15,
		attackSpeed: 1.0,
		range: 4,
		criticalBonus: 0.05,
		statRequirements: {
			attackPower: 10,
		},
		description: "A sturdy iron blade. Reliable and balanced for combat.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "common",
	},

	steel_sword: {
		id: "steel_sword",
		name: "Steel Sword",
		weaponType: "sword",
		baseDamage: 25,
		attackSpeed: 1.0,
		range: 4,
		criticalBonus: 0.1,
		statRequirements: {
			attackPower: 20,
		},
		description: "A well-crafted steel blade with superior sharpness.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "uncommon",
	},

	mage_staff: {
		id: "mage_staff",
		name: "Mage Staff",
		weaponType: "staff",
		baseDamage: 10,
		attackSpeed: 0.8,
		range: 6,
		criticalBonus: 0.15,
		statRequirements: {
			attackPower: 5,
		},
		description: "A magical staff that amplifies spell power.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "uncommon",
	},

	soul_reaper: {
		id: "soul_reaper",
		name: "Soul Reaper",
		weaponType: "sword",
		baseDamage: 40,
		attackSpeed: 0.9,
		range: 5,
		criticalBonus: 0.2,
		statRequirements: {
			attackPower: 35,
			defense: 15,
		},
		specialEffects: [
			{
				id: "soul_drain",
				name: "Soul Drain",
				duration: 3,
				timeRemaining: 3,
				effectType: "debuff",
				healthPerTick: -2,
				tickInterval: 1,
				canDispel: false,
			},
		],
		description: "A legendary blade that drains the life force of enemies.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "legendary",
	},

	hunter_bow: {
		id: "hunter_bow",
		name: "Hunter's Bow",
		weaponType: "bow",
		baseDamage: 20,
		attackSpeed: 0.7,
		range: 15,
		criticalBonus: 0.25,
		statRequirements: {
			attackPower: 15,
		},
		description: "A precise bow favored by skilled hunters. Excellent for ranged combat.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "uncommon",
	},

	assassin_dagger: {
		id: "assassin_dagger",
		name: "Assassin's Dagger",
		weaponType: "dagger",
		baseDamage: 12,
		attackSpeed: 1.5,
		range: 3,
		criticalBonus: 0.3,
		statRequirements: {
			attackPower: 12,
		},
		description: "A swift blade designed for quick, precise strikes.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "rare",
	},

	war_hammer: {
		id: "war_hammer",
		name: "War Hammer",
		weaponType: "hammer",
		baseDamage: 35,
		attackSpeed: 0.6,
		range: 4,
		criticalBonus: 0.05,
		statRequirements: {
			attackPower: 30,
			defense: 20,
		},
		description: "A massive hammer that crushes enemies with overwhelming force.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "rare",
	},

	guardian_shield: {
		id: "guardian_shield",
		name: "Guardian Shield",
		weaponType: "shield",
		baseDamage: 8,
		attackSpeed: 0.8,
		range: 2,
		criticalBonus: 0,
		statRequirements: {
			defense: 15,
		},
		description: "A protective shield that can also be used for defensive strikes.",
		icon: "rbxassetid://0", // Placeholder
		rarity: "uncommon",
	},
};

/**
 * Get weapon information by ID
 */
export function getWeaponById(weaponId: string): WeaponInfo | undefined {
	return WeaponCatalog[weaponId];
}

/**
 * Get all weapons of a specific type
 */
export function getWeaponsByType(weaponType: WeaponType): WeaponInfo[] {
	const result: WeaponInfo[] = [];
	for (const [, weapon] of pairs(WeaponCatalog)) {
		if (weapon.weaponType === weaponType) {
			result.push(weapon);
		}
	}
	return result;
}

/**
 * Get all weapons of a specific rarity
 */
export function getWeaponsByRarity(rarity: WeaponRarity): WeaponInfo[] {
	const result: WeaponInfo[] = [];
	for (const [, weapon] of pairs(WeaponCatalog)) {
		if (weapon.rarity === rarity) {
			result.push(weapon);
		}
	}
	return result;
}

/**
 * Check if an entity meets the requirements for a weapon
 */
export function canUseWeapon(stats: CombatStats, weapon: WeaponInfo): boolean {
	for (const [statName, requiredValue] of pairs(weapon.statRequirements)) {
		const currentValue = stats[statName as keyof CombatStats] as number;
		if (currentValue < requiredValue) {
			return false;
		}
	}
	return true;
}
