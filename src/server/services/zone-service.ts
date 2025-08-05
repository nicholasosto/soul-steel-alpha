/**
 * @file src/server/services/zone-service.ts
 * @module ZoneService
 * @layer Server/Services
 * @description Service for managing zones using ZonePlus
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { Players, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { ZoneKey } from "shared/keys";
import { ZoneCatalog, getZoneConfig } from "shared/catalogs";
import { ZoneMeta, IZone } from "shared/meta";

interface ManagedZone {
	zone: Zone;
	config: ZoneMeta;
	container: Model | Folder | BasePart;
	isActive: boolean;
}

export class ZoneService {
	private static instance: ZoneService;
	private zones = new Map<ZoneKey, ManagedZone>();
	private playerZoneHistory = new Map<Player, ZoneKey[]>();

	public static getInstance(): ZoneService {
		if (!ZoneService.instance) {
			ZoneService.instance = new ZoneService();
		}
		return ZoneService.instance;
	}

	private constructor() {
		this.setupPlayerEvents();
	}

	/**
	 * Create and register a zone from the catalog
	 */
	public createZone(zoneKey: ZoneKey, container: Model | Folder | BasePart): boolean {
		const config = getZoneConfig(zoneKey);
		if (!config) {
			warn(`Zone configuration not found for key: ${zoneKey}`);
			return false;
		}

		// Skip client-only zones on server
		if (config.clientOnly) {
			return false;
		}

		try {
			const zone = new Zone(container);

			// Apply configuration
			this.applyZoneConfiguration(zone, config);

			// Setup event handlers
			this.setupZoneEvents(zone, config);

			// Store the managed zone
			this.zones.set(zoneKey, {
				zone,
				config,
				container,
				isActive: config.isActive !== false,
			});

			print(`Zone created: ${config.displayName} (${zoneKey})`);
			return true;
		} catch (error) {
			warn(`Failed to create zone ${zoneKey}: ${error}`);
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

		// Skip client-only zones on server
		if (config.clientOnly) {
			return false;
		}

		try {
			const zone = Zone.fromRegion(cframe, size);

			// Apply configuration
			this.applyZoneConfiguration(zone, config);

			// Setup event handlers
			this.setupZoneEvents(zone, config);

			// Store the managed zone
			this.zones.set(zoneKey, {
				zone,
				config,
				container: zone.zoneParts[0] || Workspace, // fallback
				isActive: config.isActive !== false,
			});

			print(`Zone created from region: ${config.displayName} (${zoneKey})`);
			return true;
		} catch (error) {
			warn(`Failed to create zone from region ${zoneKey}: ${error}`);
			return false;
		}
	}

	/**
	 * Get a managed zone by key
	 */
	public getZone(zoneKey: ZoneKey): ManagedZone | undefined {
		return this.zones.get(zoneKey);
	}

	/**
	 * Get the Zone instance by key
	 */
	public getZoneInstance(zoneKey: ZoneKey): Zone | undefined {
		const managedZone = this.zones.get(zoneKey);
		return managedZone?.zone;
	}

	/**
	 * Activate or deactivate a zone
	 */
	public setZoneActive(zoneKey: ZoneKey, active: boolean): boolean {
		const managedZone = this.zones.get(zoneKey);
		if (!managedZone) {
			return false;
		}

		managedZone.isActive = active;

		if (!active) {
			// Remove all players from the zone
			const playersInZone = managedZone.zone.getPlayers();
			for (const player of playersInZone) {
				this.handlePlayerExit(player, managedZone);
			}
		}

		return true;
	}

	/**
	 * Destroy a zone
	 */
	public destroyZone(zoneKey: ZoneKey): boolean {
		const managedZone = this.zones.get(zoneKey);
		if (!managedZone) {
			return false;
		}

		try {
			managedZone.zone.destroy();
			this.zones.delete(zoneKey);
			print(`Zone destroyed: ${managedZone.config.displayName} (${zoneKey})`);
			return true;
		} catch (error) {
			warn(`Failed to destroy zone ${zoneKey}: ${error}`);
			return false;
		}
	}

	/**
	 * Get all players currently in a zone
	 */
	public getPlayersInZone(zoneKey: ZoneKey): Player[] {
		const managedZone = this.zones.get(zoneKey);
		if (!managedZone || !managedZone.isActive) {
			return [];
		}

		return managedZone.zone.getPlayers();
	}

	/**
	 * Check if a player is in a specific zone
	 */
	public isPlayerInZone(player: Player, zoneKey: ZoneKey): boolean {
		const managedZone = this.zones.get(zoneKey);
		if (!managedZone || !managedZone.isActive) {
			return false;
		}

		return managedZone.zone.findPlayer(player) !== undefined;
	}

	/**
	 * Get all zones a player is currently in
	 */
	public getPlayerZones(player: Player): ZoneKey[] {
		const playerZones: ZoneKey[] = [];

		for (const [zoneKey, managedZone] of this.zones) {
			if (managedZone.isActive && managedZone.zone.findPlayer(player)) {
				playerZones.push(zoneKey);
			}
		}

		return playerZones;
	}

	/**
	 * Apply zone configuration to a Zone instance
	 */
	private applyZoneConfiguration(zone: Zone, config: ZoneMeta): void {
		// Note: Some Zone properties are read-only and must be set during construction
		// For now, we'll apply what we can after creation

		// Set auto-update
		if (config.autoUpdate !== undefined) {
			zone.autoUpdate = config.autoUpdate;
		}

		// Bind to settings group if specified
		if (config.settingsGroup !== undefined && config.settingsGroup !== "") {
			zone.bindToGroup(config.settingsGroup);
		}

		// Note: accuracy, enterDetection, exitDetection might need to be set differently
		// depending on the @rbxts/zone-plus API. Check the documentation for proper usage.
	}

	/**
	 * Setup event handlers for a zone
	 */
	private setupZoneEvents(zone: Zone, config: ZoneMeta): void {
		// Player enter event
		zone.playerEntered.Connect((player) => {
			this.handlePlayerEnter(player, { zone, config } as ManagedZone);
		});

		// Player exit event
		zone.playerExited.Connect((player) => {
			this.handlePlayerExit(player, { zone, config } as ManagedZone);
		});

		// Item events if configured
		if (config.onItemEnter) {
			zone.itemEntered.Connect((item) => {
				if (config.onItemEnter) {
					config.onItemEnter(item, zone as IZone);
				}
			});
		}

		if (config.onItemExit) {
			zone.itemExited.Connect((item) => {
				if (config.onItemExit) {
					config.onItemExit(item, zone as IZone);
				}
			});
		}
	}

	/**
	 * Handle player entering a zone
	 */
	private handlePlayerEnter(player: Player, managedZone: ManagedZone): void {
		print(
			`Player ${player.Name} entered zone: ${managedZone.config.displayName} - Active: ${managedZone.isActive}`,
		);
		if (!managedZone.isActive) {
			return;
		}

		const { config, zone } = managedZone;

		// Update player zone history
		const history = this.playerZoneHistory.get(player) || [];
		if (!history.includes(config.zoneKey)) {
			history.push(config.zoneKey);
			this.playerZoneHistory.set(player, history);
		}

		// Call custom enter handler
		if (config.onPlayerEnter) {
			try {
				config.onPlayerEnter(player, zone as IZone);
			} catch (error) {
				warn(`Error in zone enter handler for ${config.zoneKey}: ${error}`);
			}
		}
	}

	/**
	 * Handle player exiting a zone
	 */
	private handlePlayerExit(player: Player, managedZone: ManagedZone): void {
		const { config, zone } = managedZone;

		// Update player zone history
		const history = this.playerZoneHistory.get(player) || [];
		const index = history.indexOf(config.zoneKey);
		if (index !== -1) {
			// Remove the zone key from history using array filter
			const newHistory = history.filter((zoneKey) => zoneKey !== config.zoneKey);
			this.playerZoneHistory.set(player, newHistory);
		}

		// Call custom exit handler
		if (config.onPlayerExit) {
			try {
				config.onPlayerExit(player, zone as IZone);
			} catch (error) {
				warn(`Error in zone exit handler for ${config.zoneKey}: ${error}`);
			}
		}
	}

	/**
	 * Setup player connection/disconnection events
	 */
	private setupPlayerEvents(): void {
		Players.PlayerRemoving.Connect((player) => {
			// Clean up player zone history
			this.playerZoneHistory.delete(player);
		});
	}

	/**
	 * Initialize zones from workspace containers
	 * Call this during server startup
	 */
	public initializeWorldZones(): void {
		// Look for zone containers in workspace
		const zoneContainers = Workspace.FindFirstChild("ZoneContainers") as Folder;
		if (!zoneContainers) {
			print("No ZoneContainers folder found in workspace");
			return;
		}

		// Create zones for each container that matches a catalog entry
		for (const child of zoneContainers.GetChildren()) {
			const containerName = child.Name as ZoneKey;
			if (ZoneCatalog[containerName]) {
				this.createZone(containerName, child as Model | Folder);
			}
		}

		print(`Initialized ${this.zones.size()} world zones`);
	}

	/**
	 * Get zone statistics
	 */
	public getZoneStats(): Record<string, unknown> {
		const stats = {
			totalZones: this.zones.size(),
			activeZones: 0,
			totalPlayersInZones: 0,
			zonesByCategory: {} as Record<string, number>,
		};

		for (const [, managedZone] of this.zones) {
			if (managedZone.isActive) {
				stats.activeZones++;
				stats.totalPlayersInZones += managedZone.zone.getPlayers().size();
			}

			const category = managedZone.config.category;
			const currentCount = stats.zonesByCategory[category];
			stats.zonesByCategory[category] = (currentCount !== undefined ? currentCount : 0) + 1;
		}

		return stats;
	}
}

// Export singleton instance
export const ZoneServiceInstance = ZoneService.getInstance();
