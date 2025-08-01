/**
 * @file src/shared/catalogs/zone-catalog.ts
 * @module ZoneCatalog
 * @layer Shared/Catalogs
 * @description Zone configurations and metadata for the zone system
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { ZoneKey } from "shared/keys";
import { ZoneMeta, IZone } from "shared/meta";
import { CombatRemotes } from "shared/network";
import { CombatHitEvent } from "shared/network";
import { SSEntity } from "shared/types";
function createHitEvent(
	source: SSEntity,
	target: SSEntity,
	weaponId: string,
	damage: number,
	isCritical: boolean,
): CombatHitEvent {
	return {
		attacker: source,
		target: target,
		weaponId: weaponId,
		damage: damage,
		isCritical: isCritical,
		hitType: "basic_attack", // Default type, can be changed based on context
	};
}

/**
 * Catalog of all configured zones in the game
 */
export const ZoneCatalog: Record<ZoneKey, ZoneMeta> = {
	PlayerSpawn: {
		zoneKey: "PlayerSpawn",
		displayName: "Player Spawn",
		description: "Safe zone where players first spawn into the game",
		category: "safe",
		accuracy: "High",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "SafeZones",
		priority: 10,
		serverOnly: true,
		visual: {
			showBounds: false,
			color: Color3.fromRGB(0, 255, 0),
			transparency: 0.8,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered the spawn zsdsdasone`);
			const playerEntity = player.Character as SSEntity;
			if (playerEntity === undefined) {
				warn(`Player entity not found for ${player.Name}`);
				return;
			}
			warn(`XCreating combat hit event for ${player.Name} in spawn zone`);
			CombatRemotes.Server.Get("CombatHit").SendToPlayer(
				player,
				createHitEvent(playerEntity, playerEntity, "TestWeapon", 0, false),
			); // Prevent combat hits in spawn
			// Add spawn protection, healing, etc.
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left the spawn zone`);
			// Remove spawn protection
		},
	},

	SafeZone: {
		zoneKey: "SafeZone",
		displayName: "Safe Zone",
		description: "Areas where players are protected from combat",
		category: "safe",
		accuracy: "High",
		enterDetection: "WholeBody",
		exitDetection: "Centre",
		settingsGroup: "SafeZones",
		priority: 8,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(0, 255, 0),
			transparency: 0.7,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered a safe zone`);
			// Disable PvP, add buffs, etc.
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left the safe zone`);
			// Re-enable PvP
		},
	},

	TownCenter: {
		zoneKey: "TownCenter",
		displayName: "Town Center",
		description: "Main hub area with shops and NPCs",
		category: "safe",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "SafeZones",
		priority: 9,
		visual: {
			showBounds: false,
			color: Color3.fromRGB(100, 200, 255),
			transparency: 0.8,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered the town center`);
			// Show town UI, disable certain abilities
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left the town center`);
			// Hide town UI
		},
	},

	ArenaZone: {
		zoneKey: "ArenaZone",
		displayName: "Arena",
		description: "Dedicated combat area for player vs player battles",
		category: "combat",
		accuracy: "High",
		enterDetection: "WholeBody",
		exitDetection: "WholeBody",
		settingsGroup: "CombatZones",
		priority: 7,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(255, 0, 0),
			transparency: 0.6,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered the arena`);
			// Enable arena rules, start countdown
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left the arena`);
			// Reset player state, end matches
		},
	},

	PvPZone: {
		zoneKey: "PvPZone",
		displayName: "PvP Zone",
		description: "Open world area where player vs player combat is enabled",
		category: "combat",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "CombatZones",
		priority: 5,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(255, 100, 0),
			transparency: 0.8,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered a PvP zone`);
			// Enable PvP, show warning UI
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left the PvP zone`);
			// Disable PvP, hide warning UI
		},
	},

	DungeonEntrance: {
		zoneKey: "DungeonEntrance",
		displayName: "Dungeon Entrance",
		description: "Entry point to dungeon instances",
		category: "interactive",
		accuracy: "High",
		enterDetection: "Centre",
		exitDetection: "Centre",
		priority: 6,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(128, 0, 128),
			transparency: 0.7,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} approached dungeon entrance`);
			// Show dungeon UI, check requirements
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left dungeon entrance`);
			// Hide dungeon UI
		},
	},

	ShopZone: {
		zoneKey: "ShopZone",
		displayName: "Shop Area",
		description: "Commercial zone with merchant NPCs",
		category: "interactive",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "InteractiveZones",
		priority: 4,
		visual: {
			showBounds: false,
			color: Color3.fromRGB(255, 255, 0),
			transparency: 0.9,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered shop area`);
			// Show shop UI, highlight merchants
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left shop area`);
			// Hide shop UI
		},
	},

	QuestGiverZone: {
		zoneKey: "QuestGiverZone",
		displayName: "Quest Giver",
		description: "Area around NPCs that give quests",
		category: "interactive",
		accuracy: "High",
		enterDetection: "Centre",
		exitDetection: "Centre",
		priority: 5,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(0, 255, 255),
			transparency: 0.8,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} approached quest giver`);
			// Show quest indicator, enable interaction
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left quest giver area`);
			// Hide quest indicator
		},
	},

	TrainingArea: {
		zoneKey: "TrainingArea",
		displayName: "Training Area",
		description: "Safe zone for players to practice abilities and combat",
		category: "interactive",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "SafeZones",
		priority: 6,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(0, 128, 255),
			transparency: 0.7,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered training area`);
			// Enable training mode, spawn dummies
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left training area`);
			// Disable training mode, cleanup dummies
		},
	},

	AmbientZone: {
		zoneKey: "AmbientZone",
		displayName: "Ambient Zone",
		description: "Area with specific ambient lighting and atmosphere",
		category: "environment",
		accuracy: "Low",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "EnvironmentZones",
		priority: 1,
		clientOnly: true,
		visual: {
			showBounds: false,
			color: Color3.fromRGB(128, 128, 255),
			transparency: 0.9,
		},
		onLocalPlayerEnter: (zone: IZone) => {
			print("Local player entered ambient zone");
			// Change lighting, particles, etc.
		},
		onLocalPlayerExit: (zone: IZone) => {
			print("Local player left ambient zone");
			// Restore default lighting
		},
	},

	MusicZone: {
		zoneKey: "MusicZone",
		displayName: "Music Zone",
		description: "Area with specific background music",
		category: "environment",
		accuracy: "Low",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "EnvironmentZones",
		priority: 2,
		clientOnly: true,
		visual: {
			showBounds: false,
			color: Color3.fromRGB(255, 128, 255),
			transparency: 0.95,
		},
		customProperties: {
			musicId: "rbxassetid://1234567890",
			volume: 0.5,
			fadeTime: 2,
		},
		onLocalPlayerEnter: (zone: IZone) => {
			print("Local player entered music zone");
			// Start playing zone music
		},
		onLocalPlayerExit: (zone: IZone) => {
			print("Local player left music zone");
			// Fade out zone music
		},
	},

	LightingZone: {
		zoneKey: "LightingZone",
		displayName: "Lighting Zone",
		description: "Area with custom lighting settings",
		category: "environment",
		accuracy: "Low",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "EnvironmentZones",
		priority: 1,
		clientOnly: true,
		visual: {
			showBounds: false,
			color: Color3.fromRGB(255, 255, 128),
			transparency: 0.95,
		},
		customProperties: {
			brightness: 1.5,
			colorShift: Color3.fromRGB(255, 200, 150),
			shadowSoftness: 0.2,
		},
		onLocalPlayerEnter: (zone: IZone) => {
			print("Local player entered lighting zone");
			// Apply custom lighting
		},
		onLocalPlayerExit: (zone: IZone) => {
			print("Local player left lighting zone");
			// Restore default lighting
		},
	},

	TeleportZone: {
		zoneKey: "TeleportZone",
		displayName: "Teleport Zone",
		description: "Area that teleports players to another location",
		category: "special",
		accuracy: "High",
		enterDetection: "Centre",
		exitDetection: "Centre",
		priority: 8,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(255, 0, 255),
			transparency: 0.6,
		},
		customProperties: {
			destination: new Vector3(0, 50, 0),
			cooldown: 5,
			requiresConfirmation: true,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered teleport zone`);
			// Show teleport prompt
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left teleport zone`);
			// Hide teleport prompt
		},
	},

	BuffZone: {
		zoneKey: "BuffZone",
		displayName: "Buff Zone",
		description: "Area that applies beneficial effects to players",
		category: "special",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		priority: 5,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(0, 255, 128),
			transparency: 0.7,
		},
		customProperties: {
			buffType: "speed",
			buffMultiplier: 1.5,
			maxDuration: 30,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered buff zone`);
			// Apply buff effects
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left buff zone`);
			// Start buff duration countdown
		},
	},

	DebuffZone: {
		zoneKey: "DebuffZone",
		displayName: "Debuff Zone",
		description: "Dangerous area that applies negative effects to players",
		category: "special",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		priority: 6,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(255, 0, 0),
			transparency: 0.5,
		},
		customProperties: {
			debuffType: "poison",
			damagePerSecond: 5,
			slowMultiplier: 0.7,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered dangerous zone`);
			// Apply debuff effects
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} escaped dangerous zone`);
			// Remove debuff effects
		},
	},

	RestZone: {
		zoneKey: "RestZone",
		displayName: "Rest Zone",
		description: "Peaceful area that regenerates health and mana",
		category: "special",
		accuracy: "Medium",
		enterDetection: "Centre",
		exitDetection: "Centre",
		settingsGroup: "SafeZones",
		priority: 7,
		visual: {
			showBounds: true,
			color: Color3.fromRGB(128, 255, 128),
			transparency: 0.8,
		},
		customProperties: {
			healthRegenRate: 2,
			manaRegenRate: 3,
			removeDebuffs: true,
		},
		onPlayerEnter: (player: Player, zone: IZone) => {
			print(`${player.Name} entered rest zone`);
			// Start regeneration effects
		},
		onPlayerExit: (player: Player, zone: IZone) => {
			print(`${player.Name} left rest zone`);
			// Stop regeneration effects
		},
	},
};

/**
 * Helper function to get zone configuration by key
 */
export function getZoneConfig(zoneKey: ZoneKey): ZoneMeta | undefined {
	return ZoneCatalog[zoneKey];
}

/**
 * Helper function to get all zones by category
 */
export function getZonesByCategory(category: ZoneMeta["category"]): ZoneMeta[] {
	const zones: ZoneMeta[] = [];
	for (const [, zone] of pairs(ZoneCatalog)) {
		if (zone.category === category) {
			zones.push(zone);
		}
	}
	return zones;
}

/**
 * Helper function to get zones by settings group
 */
export function getZonesByGroup(settingsGroup: string): ZoneMeta[] {
	const zones: ZoneMeta[] = [];
	for (const [, zone] of pairs(ZoneCatalog)) {
		if (zone.settingsGroup === settingsGroup) {
			zones.push(zone);
		}
	}
	return zones;
}

/**
 * Helper function to validate zone configuration
 */
export function validateZoneConfig(zoneConfig: ZoneMeta): boolean {
	// Basic validation
	if (zoneConfig.zoneKey === undefined || zoneConfig.displayName === undefined || zoneConfig.category === undefined) {
		return false;
	}

	// Ensure client-only zones don't have server events
	if (zoneConfig.clientOnly && (zoneConfig.onPlayerEnter || zoneConfig.onPlayerExit)) {
		return false;
	}

	// Ensure server-only zones don't have client events
	if (zoneConfig.serverOnly && (zoneConfig.onLocalPlayerEnter || zoneConfig.onLocalPlayerExit)) {
		return false;
	}

	return true;
}
