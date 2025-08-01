/**
 * @file src/client/managers/ClientZoneManager.ts
 * @module ClientZoneManager
 * @layer Client/Managers
 * @description Client-side zone manager for environment and UI zones
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
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

export class ClientZoneManager {
	private static instance: ClientZoneManager;
	private zones = new Map<ZoneKey, ClientManagedZone>();
	private localPlayer = Players.LocalPlayer;
	private currentZones: ZoneKey[] = [];

	public static getInstance(): ClientZoneManager {
		if (!ClientZoneManager.instance) {
			ClientZoneManager.instance = new ClientZoneManager();
		}
		return ClientZoneManager.instance;
	}

	private constructor() {
		// Initialize automatically
		this.initialize();
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
				container: zone.zoneParts[0] || Workspace, // fallback
				isActive: config.isActive !== false,
			});

			print(`Client zone created from region: ${config.displayName} (${zoneKey})`);
			return true;
		} catch (error) {
			warn(`Failed to create client zone from region ${zoneKey}: ${error}`);
			return false;
		}
	}

	/**
	 * Check if local player is in a specific zone
	 */
	public isInZone(zoneKey: ZoneKey): boolean {
		return this.currentZones.includes(zoneKey);
	}

	/**
	 * Get all zones the local player is currently in
	 */
	public getCurrentZones(): readonly ZoneKey[] {
		return this.currentZones;
	}

	/**
	 * Get a zone instance by key
	 */
	public getZone(zoneKey: ZoneKey): Zone | undefined {
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

		const wasActive = managedZone.isActive;
		managedZone.isActive = active;

		// If deactivating and player was in zone, trigger exit
		if (wasActive && !active && this.isInZone(zoneKey)) {
			this.handleLocalPlayerExit(managedZone);
		}

		return true;
	}

	/**
	 * Apply zone configuration to a Zone instance
	 */
	private applyZoneConfiguration(zone: Zone, config: ZoneMeta): void {
		// Set auto-update
		if (config.autoUpdate !== undefined) {
			zone.autoUpdate = config.autoUpdate;
		}

		// Bind to settings group if specified
		if (config.settingsGroup !== undefined && config.settingsGroup !== "") {
			zone.bindToGroup(config.settingsGroup);
		}
	}

	/**
	 * Setup event handlers for client-side zones
	 */
	private setupClientZoneEvents(zone: Zone, config: ZoneMeta): void {
		// Local player enter event
		zone.localPlayerEntered.Connect(() => {
			this.handleLocalPlayerEnter({ zone, config } as ClientManagedZone);
		});

		// Local player exit event
		zone.localPlayerExited.Connect(() => {
			this.handleLocalPlayerExit({ zone, config } as ClientManagedZone);
		});
	}

	/**
	 * Handle local player entering a zone
	 */
	private handleLocalPlayerEnter(managedZone: ClientManagedZone): void {
		if (!managedZone.isActive) {
			return;
		}

		const { config, zone } = managedZone;

		// Update current zones
		if (!this.currentZones.includes(config.zoneKey)) {
			this.currentZones.push(config.zoneKey);
		}

		// Call custom enter handler
		if (config.onLocalPlayerEnter) {
			try {
				config.onLocalPlayerEnter(zone as IZone);
			} catch (error) {
				warn(`Error in client zone enter handler for ${config.zoneKey}: ${error}`);
			}
		}

		print(`Local player entered zone: ${config.displayName}`);
	}

	/**
	 * Handle local player exiting a zone
	 */
	private handleLocalPlayerExit(managedZone: ClientManagedZone): void {
		const { config, zone } = managedZone;

		// Update current zones
		const index = this.currentZones.indexOf(config.zoneKey);
		if (index !== -1) {
			this.currentZones = this.currentZones.filter((zoneKey) => zoneKey !== config.zoneKey);
		}

		// Call custom exit handler
		if (config.onLocalPlayerExit) {
			try {
				config.onLocalPlayerExit(zone as IZone);
			} catch (error) {
				warn(`Error in client zone exit handler for ${config.zoneKey}: ${error}`);
			}
		}

		print(`Local player exited zone: ${config.displayName}`);
	}

	/**
	 * Initialize client-side zones from workspace
	 */
	private initialize(): void {
		// Wait for character to spawn
		if (!this.localPlayer.Character) {
			this.localPlayer.CharacterAdded.Connect(() => {
				this.initializeClientZones();
			});
		} else {
			this.initializeClientZones();
		}
	}

	/**
	 * Initialize client zones from workspace containers
	 */
	private initializeClientZones(): void {
		// Look for client zone containers in workspace
		const clientZoneContainers = Workspace.FindFirstChild("ClientZoneContainers") as Folder;
		if (!clientZoneContainers) {
			print("No ClientZoneContainers folder found in workspace");
			return;
		}

		// Create zones for each container that matches a catalog entry
		for (const child of clientZoneContainers.GetChildren()) {
			const containerName = child.Name as ZoneKey;
			const config = ZoneCatalog[containerName];
			if (config && config.clientOnly) {
				this.createZone(containerName, child as Model | Folder);
			}
		}

		print(`Initialized ${this.zones.size()} client zones`);
	}

	/**
	 * Cleanup zones on destruction
	 */
	public destroy(): void {
		for (const [, managedZone] of this.zones) {
			managedZone.zone.destroy();
		}
		this.zones.clear();
		this.currentZones = [];
	}
}

// Export singleton instance
export const ClientZoneManagerInstance = ClientZoneManager.getInstance();
