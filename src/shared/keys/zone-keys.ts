/**
 * @file src/shared/keys/zone-keys.ts
 * @module ZoneKeys
 * @layer Shared/Keys
 * @description Type-safe string identifiers for zone systems
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

export const ZONE_KEYS = [
	// Safe zones
	"PlayerSpawn",
	"SafeZone",
	"TownCenter",

	// Combat zones
	"ArenaZone",
	"PvPZone",
	"DungeonEntrance",

	// Interactive zones
	"ShopZone",
	"QuestGiverZone",
	"TrainingArea",

	// Environment zones
	"AmbientZone",
	"MusicZone",
	"LightingZone",

	// Special zones
	"TeleportZone",
	"BuffZone",
	"DebuffZone",
	"RestZone",
	"TestResourceZone",
] as const;

export type ZoneKey = (typeof ZONE_KEYS)[number];
