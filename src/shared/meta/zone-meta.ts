/**
 * @file src/shared/meta/zone-meta.ts
 * @module ZoneMeta
 * @layer Shared/Meta
 * @description Zone metadata and configuration interfaces
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { ZoneKey } from "shared/keys";

// Forward declaration - actual Zone type will be from @rbxts/zone-plus
export interface IZone {
	destroy(): void;
}

export interface ZoneConfiguration {
	/** Unique identifier for the zone */
	zoneKey: ZoneKey;

	/** Human-readable name for the zone */
	displayName: string;

	/** Description of what this zone does */
	description: string;

	/** Zone detection accuracy (High, Medium, Low, Automatic) */
	accuracy?: "High" | "Medium" | "Low" | "Automatic";

	/** Zone detection mode for entering (Centre, WholeBody, Automatic) */
	enterDetection?: "Centre" | "WholeBody" | "Automatic";

	/** Zone detection mode for exiting (Centre, WholeBody, Automatic) */
	exitDetection?: "Centre" | "WholeBody" | "Automatic";

	/** Whether the zone should auto-update when parts change */
	autoUpdate?: boolean;

	/** Settings group name for coordinated zones */
	settingsGroup?: string;

	/** Zone category for organization */
	category: ZoneCategory;

	/** Priority level for overlapping zones */
	priority?: number;

	/** Visual indicators */
	visual?: {
		/** Show zone boundaries for debugging */
		showBounds?: boolean;
		/** Zone color for visualization */
		color?: Color3;
		/** Transparency level */
		transparency?: number;
	};

	/** Custom properties for specific zone types */
	customProperties?: Record<string, unknown>;
}

export type ZoneCategory = "safe" | "combat" | "interactive" | "environment" | "special" | "admin";

export interface ZoneEvents {
	/** Called when a player enters the zone */
	onPlayerEnter?: (player: Player, zone: IZone) => void;

	/** Called when a player exits the zone */
	onPlayerExit?: (player: Player, zone: IZone) => void;

	/** Called when any item enters the zone */
	onItemEnter?: (item: BasePart | Model, zone: IZone) => void;

	/** Called when any item exits the zone */
	onItemExit?: (item: BasePart | Model, zone: IZone) => void;

	/** Called when the local player enters (client-only) */
	onLocalPlayerEnter?: (zone: IZone) => void;

	/** Called when the local player exits (client-only) */
	onLocalPlayerExit?: (zone: IZone) => void;
}

export interface ZoneMeta extends ZoneConfiguration, ZoneEvents {
	/** Whether this zone is currently active */
	isActive?: boolean;

	/** Server-side only flag */
	serverOnly?: boolean;

	/** Client-side only flag */
	clientOnly?: boolean;
}
