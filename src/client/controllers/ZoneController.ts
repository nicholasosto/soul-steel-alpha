/**
 * @file src/client/controllers/ZoneController.ts
 * @module ZoneController
 * @layer Client/Controllers
 * @description Client-side zone controller for environment and UI zones
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-07 - Renamed from ClientZoneManager for consistency
 */

import { Players, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { ZoneKey } from "shared/keys";
import { ZoneCatalog, getZoneConfig } from "shared/catalogs";
import { ZoneMeta, IZone } from "shared/meta";

interface ClientManagedZone {
	zone: Zone;
	config: ZoneMeta;
	container: Model | Folder | BasePart;
	isActive: boolean;
}

export class ZoneController {
	private static instance: ZoneController;
	private zones = new Map<ZoneKey, ClientManagedZone>();
	private localPlayer = Players.LocalPlayer;
	private currentZones: ZoneKey[] = [];

	public static getInstance(): ZoneController {
		if (!ZoneController.instance) {
			ZoneController.instance = new ZoneController();
		}
		return ZoneController.instance;
	}

	private constructor() {
		// Initialize automatically
		this.initialize();
	}

	/**
	 * Initialize the zone controller
	 */
	private initialize(): void {
		print("ZoneController initialized");
		// Additional initialization logic can go here
	}

	/**
	 * Create a client-side zone
	 */
	public createZone(zoneKey: ZoneKey, container: Model | Folder | BasePart): boolean {
		const config = getZoneConfig(zoneKey);
		if (!config) {
			warn(`Zone configuration not found for key: ${zoneKey}`);
			return false;
		}

		// Skip server-only zones on client
		if (config.serverOnly) {
			return false;
		}

		try {
			const zone = new Zone(container);

			// Apply configuration
			this.applyZoneConfiguration(zone, config);

			// Setup event handlers for client-only events
			this.setupClientZoneEvents(zone, config);

			// Store the managed zone
			this.zones.set(zoneKey, {
				zone,
				config,
				container,
				isActive: config.isActive !== false,
			});

			print(`Client zone created: ${config.displayName} (${zoneKey})`);
			return true;
		} catch (error) {
			warn(`Failed to create client zone ${zoneKey}: ${error}`);
			return false;
		}
	}

	/**
	 * Create zone from a region (CFrame and Size)
	 */
	public createZoneFromRegion(zoneKey: ZoneKey, cframe: CFrame, size: Vector3): boolean {
		const config = getZoneConfig(zoneKey);
		if (!config) {
			warn(`Zone configuration not found for key: ${zoneKey}`);
			return false;
		}

		// Skip server-only zones on client
		if (config.serverOnly) {
			return false;
		}

		try {
			const zone = Zone.fromRegion(cframe, size);

			// Apply configuration
			this.applyZoneConfiguration(zone, config);

			// Setup event handlers
			this.setupClientZoneEvents(zone, config);

			// Store the managed zone
			this.zones.set(zoneKey, {
				zone,
				config,
				container: new Instance("Folder"), // Placeholder container for region zones
				isActive: config.isActive !== false,
			});

			print(`Client zone created from region: ${config.displayName} (${zoneKey})`);
			return true;
		} catch (error) {
			warn(`Failed to create region zone ${zoneKey}: ${error}`);
			return false;
		}
	}

	/**
	 * Apply zone configuration
	 */
	private applyZoneConfiguration(zone: Zone, config: ZoneMeta): void {
		// Zone settings are typically applied during creation
		// This method can be used for runtime configuration if needed
		print(`Applied configuration for zone: ${config.displayName}`);
	}

	/**
	 * Setup client-specific zone events
	 */
	private setupClientZoneEvents(zone: Zone, config: ZoneMeta): void {
		zone.playerEntered.Connect((player: Player) => {
			if (player === this.localPlayer) {
				this.onLocalPlayerEntered(config);
			}
		});

		zone.playerExited.Connect((player: Player) => {
			if (player === this.localPlayer) {
				this.onLocalPlayerExited(config);
			}
		});
	}

	/**
	 * Handle local player entering a zone
	 */
	private onLocalPlayerEntered(config: ZoneMeta): void {
		print(`Entered zone: ${config.displayName}`);
		// Add zone-specific client logic here
		// e.g., UI changes, audio changes, etc.
	}

	/**
	 * Handle local player exiting a zone
	 */
	private onLocalPlayerExited(config: ZoneMeta): void {
		print(`Exited zone: ${config.displayName}`);
		// Add zone-specific client cleanup here
	}

	/**
	 * Get all active zones
	 */
	public getActiveZones(): ZoneKey[] {
		return this.currentZones;
	}

	/**
	 * Check if player is in a specific zone
	 */
	public isPlayerInZone(zoneKey: ZoneKey): boolean {
		return this.currentZones.includes(zoneKey);
	}

	/**
	 * Cleanup method
	 */
	public destroy(): void {
		for (const [zoneKey, managedZone] of this.zones) {
			managedZone.zone.destroy();
		}
		this.zones.clear();
		this.currentZones = [];
		print("ZoneController destroyed");
	}
}
