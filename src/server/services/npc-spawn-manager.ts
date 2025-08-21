/**
 * @file src/server/services/npc-spawn-manager.ts
 * @module NPCSpawnManager
 * @layer Server/Services
 * @description Manages NPC spawn areas with respawning, max NPC limits, and zone integration
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-13 - Initial implementation
 *
 * ## Server Signals (Inter-Service Communication)
 * - `NPCSpawnAreaCreated` - Emits when new spawn areas are created
 * - `NPCSpawned` - Emits when NPCs are spawned in managed areas
 * - `NPCDespawned` - Emits when NPCs are removed from managed areas
 * - Listens to `NPCDefeated` - For respawn timers and area management
 * - Listens to `ZonePlayerEntered`/`ZonePlayerExited` - For dynamic spawning
 *
 * ## Client Events (Network Communication)
 * - None - Server-side spawn management only
 *
 * ## Roblox Events (Engine Integration)
 * - `RunService.Heartbeat` - Drives respawn timers and area monitoring
 */

import { RunService, Workspace, HttpService } from "@rbxts/services";
import { type NPCConfig, type UnifiedNPCEntity } from "./unified-npc-service";
import { SignalServiceInstance } from "./signal-service";
import { ZoneKey } from "shared/keys";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface NPCSpawnConfig {
	/** NPC type from templates */
	npcType: string;
	/** Configuration overrides for this spawn */
	config?: NPCConfig;
	/** Weight for random selection (higher = more likely) */
	weight?: number;
	/** Minimum level requirement for this NPC to spawn */
	minPlayerLevel?: number;
	/** Maximum level requirement for this NPC to spawn */
	maxPlayerLevel?: number;
}

export interface SpawnAreaConfig {
	/** Unique identifier for this spawn area */
	id: string;
	/** Display name for debugging */
	displayName: string;
	/** NPCs that can spawn in this area */
	npcConfigs: NPCSpawnConfig[];
	/** Maximum NPCs alive at once in this area */
	maxNPCs: number;
	/** Minimum NPCs to maintain in this area */
	minNPCs: number;
	/** Base respawn time in seconds */
	respawnTimeSeconds: number;
	/** Random variance in respawn time (±seconds) */
	respawnVariance?: number;
	/** Spawn radius from center point */
	spawnRadius: number;
	/** Area center position */
	centerPosition: Vector3;
	/** Zone key to link with zone system (optional) */
	linkedZone?: ZoneKey;
	/** Only spawn when players are nearby */
	requirePlayerPresence?: boolean;
	/** Player detection range for requirePlayerPresence */
	playerDetectionRange?: number;
	/** Enable dynamic spawning based on player count */
	dynamicSpawning?: boolean;
}

interface ManagedSpawnArea {
	config: SpawnAreaConfig;
	activeNPCs: Map<string, UnifiedNPCEntity>;
	respawnTimers: Map<string, { timeLeft: number; npcConfig: NPCSpawnConfig; spawnPosition: Vector3 }>;
	isActive: boolean;
	lastPlayerCheck: number;
}

interface PendingNPCRequest {
	requestId: string;
	areaId: string;
	npcConfig: NPCSpawnConfig;
	position: Vector3;
	timestamp: number;
}

// Narrow unknown to UnifiedNPCEntity by checking for required shape
function isUnifiedNPCEntity(value: unknown): value is UnifiedNPCEntity {
	const obj = value as Partial<UnifiedNPCEntity> | undefined;
	const npcId = (obj as { npcId?: unknown } | undefined)?.npcId;
	return npcId !== undefined && typeOf(npcId) === "string";
}

// =============================================================================
// NPC SPAWN MANAGER SERVICE
// =============================================================================

export class NPCSpawnManager {
	private static instance: NPCSpawnManager;
	private spawnAreas = new Map<string, ManagedSpawnArea>();
	private pendingRequests = new Map<string, PendingNPCRequest>();
	private initialized = false;
	private heartbeatConnection?: RBXScriptConnection;

	public static getInstance(): NPCSpawnManager {
		if (!NPCSpawnManager.instance) {
			NPCSpawnManager.instance = new NPCSpawnManager();
		}
		return NPCSpawnManager.instance;
	}

	private constructor() {
		this.setupSignalConnections();
	}

	/**
	 * Initialize the spawn manager
	 */
	public initialize(): void {
		if (this.initialized) return;
		this.initialized = true;

		// Start the main update loop
		this.heartbeatConnection = RunService.Heartbeat.Connect((deltaTime) => {
			this.update(deltaTime);
		});

		print("🏗️ NPCSpawnManager: Initialized");
	}

	/**
	 * Create a new spawn area
	 */
	public createSpawnArea(config: SpawnAreaConfig): boolean {
		if (this.spawnAreas.has(config.id)) {
			warn(`❌ Spawn area already exists: ${config.id}`);
			return false;
		}

		// Validate configuration
		if (!this.validateSpawnAreaConfig(config)) {
			return false;
		}

		const managedArea: ManagedSpawnArea = {
			config,
			activeNPCs: new Map(),
			respawnTimers: new Map(),
			isActive: true,
			lastPlayerCheck: 0,
		};

		this.spawnAreas.set(config.id, managedArea);

		// Initial spawn
		this.performInitialSpawn(managedArea);

		// Emit signal
		SignalServiceInstance.emit("NPCSpawnAreaCreated", { areaId: config.id });

		print(`🏗️ NPCSpawnManager: Created spawn area '${config.displayName}' (${config.id})`);
		return true;
	}

	/**
	 * Remove a spawn area and cleanup its NPCs
	 */
	public removeSpawnArea(areaId: string): boolean {
		const area = this.spawnAreas.get(areaId);
		if (!area) {
			warn(`❌ Spawn area not found: ${areaId}`);
			return false;
		}

		// Despawn all NPCs in this area
		for (const [npcId, npc] of area.activeNPCs) {
			SignalServiceInstance.emit("NPCDespawnRequested", { npcId });
		}

		// Clear timers
		area.respawnTimers.clear();

		// Remove from management
		this.spawnAreas.delete(areaId);

		print(`🗑️ NPCSpawnManager: Removed spawn area '${area.config.displayName}' (${areaId})`);
		return true;
	}

	/**
	 * Set spawn area active state
	 */
	public setSpawnAreaActive(areaId: string, active: boolean): boolean {
		const area = this.spawnAreas.get(areaId);
		if (!area) {
			warn(`❌ Spawn area not found: ${areaId}`);
			return false;
		}

		if (area.isActive === active) return true;

		area.isActive = active;

		if (!active) {
			// Despawn all NPCs when deactivating
			for (const [npcId, npc] of area.activeNPCs) {
				SignalServiceInstance.emit("NPCDespawnRequested", { npcId });
			}
			area.activeNPCs.clear();
			area.respawnTimers.clear();
		} else {
			// Perform initial spawn when reactivating
			this.performInitialSpawn(area);
		}

		print(`🔄 NPCSpawnManager: Set '${area.config.displayName}' active: ${active}`);
		return true;
	}

	/**
	 * Get spawn area statistics
	 */
	public getSpawnAreaStats(areaId: string): Record<string, unknown> | undefined {
		const area = this.spawnAreas.get(areaId);
		if (!area) return undefined;

		return {
			id: area.config.id,
			displayName: area.config.displayName,
			isActive: area.isActive,
			activeNPCs: area.activeNPCs.size(),
			maxNPCs: area.config.maxNPCs,
			minNPCs: area.config.minNPCs,
			pendingRespawns: area.respawnTimers.size(),
			linkedZone: area.config.linkedZone,
		};
	}

	/**
	 * Get all spawn area statistics
	 */
	public getAllSpawnAreaStats(): Record<string, unknown> {
		const stats: Record<string, unknown> = {
			totalAreas: this.spawnAreas.size(),
			activeAreas: 0,
			totalActiveNPCs: 0,
			totalPendingRespawns: 0,
			areas: {},
		};

		for (const [areaId, area] of this.spawnAreas) {
			if (area.isActive) stats.activeAreas = (stats.activeAreas as number) + 1;
			stats.totalActiveNPCs = (stats.totalActiveNPCs as number) + area.activeNPCs.size();
			stats.totalPendingRespawns = (stats.totalPendingRespawns as number) + area.respawnTimers.size();
			(stats.areas as Record<string, unknown>)[areaId] = this.getSpawnAreaStats(areaId);
		}

		return stats;
	}

	// =============================================================================
	// PRIVATE METHODS
	// =============================================================================

	private setupSignalConnections(): void {
		// Listen for NPC defeats to handle respawning
		SignalServiceInstance.connect("NPCDefeated", (data) => {
			this.handleNPCDefeated(data.npc.Name);
		});

		// Listen for zone events if using zone integration
		SignalServiceInstance.connect("ZonePlayerEntered", (data) => {
			this.handlePlayerZoneChange(data.player, data.zoneKey, true);
		});

		SignalServiceInstance.connect("ZonePlayerExited", (data) => {
			this.handlePlayerZoneChange(data.player, data.zoneKey, false);
		});

		// Listen for NPC spawn completion
		SignalServiceInstance.connect("NPCSpawnCompleted", (data) => {
			this.handleNPCSpawnCompleted(data.npcEntity, data.requestId);
		});

		// Listen for NPC despawn completion
		SignalServiceInstance.connect("NPCDespawnCompleted", (data) => {
			this.handleNPCDespawnCompleted(data.npcId, data.requestId);
		});
	}

	private update(deltaTime: number): void {
		for (const [areaId, area] of this.spawnAreas) {
			if (!area.isActive) continue;

			// Update respawn timers
			this.updateRespawnTimers(area, deltaTime);

			// Check player presence if required
			if (area.config.requirePlayerPresence) {
				this.checkPlayerPresence(area, deltaTime);
			}

			// Maintain minimum NPC count
			this.maintainMinimumNPCs(area);
		}
	}

	private updateRespawnTimers(area: ManagedSpawnArea, deltaTime: number): void {
		const completedTimers: string[] = [];

		for (const [timerId, timer] of area.respawnTimers) {
			timer.timeLeft -= deltaTime;

			if (timer.timeLeft <= 0) {
				// Time to respawn
				if (area.activeNPCs.size() < area.config.maxNPCs) {
					this.spawnNPCAtPosition(area, timer.npcConfig, timer.spawnPosition);
				}
				completedTimers.push(timerId);
			}
		}

		// Clean up completed timers
		for (const timerId of completedTimers) {
			area.respawnTimers.delete(timerId);
		}
	}

	private checkPlayerPresence(area: ManagedSpawnArea, deltaTime: number): void {
		area.lastPlayerCheck += deltaTime;
		if (area.lastPlayerCheck < 2) return; // Check every 2 seconds

		area.lastPlayerCheck = 0;
		const detectionRange = area.config.playerDetectionRange || 100;
		const hasNearbyPlayers = this.hasPlayersInRange(area.config.centerPosition, detectionRange);

		// If no players nearby, pause spawning (but don't despawn existing NPCs)
		if (!hasNearbyPlayers && area.respawnTimers.size() > 0) {
			// Pause all timers by not updating them
			return;
		}
	}

	private maintainMinimumNPCs(area: ManagedSpawnArea): void {
		const currentNPCs = area.activeNPCs.size();
		const pendingRespawns = area.respawnTimers.size();
		const totalExpected = currentNPCs + pendingRespawns;

		if (totalExpected < area.config.minNPCs) {
			const neededNPCs = area.config.minNPCs - totalExpected;
			for (let i = 0; i < neededNPCs; i++) {
				if (currentNPCs + i >= area.config.maxNPCs) break;

				const npcConfig = this.selectRandomNPCConfig(area.config.npcConfigs);
				if (npcConfig) {
					const spawnPosition = this.generateSpawnPosition(area.config);
					this.spawnNPCAtPosition(area, npcConfig, spawnPosition);
				}
			}
		}
	}

	private performInitialSpawn(area: ManagedSpawnArea): void {
		const spawnCount = math.min(area.config.minNPCs, area.config.maxNPCs);

		for (let i = 0; i < spawnCount; i++) {
			const npcConfig = this.selectRandomNPCConfig(area.config.npcConfigs);
			if (npcConfig) {
				const spawnPosition = this.generateSpawnPosition(area.config);
				this.spawnNPCAtPosition(area, npcConfig, spawnPosition);
			}
		}
	}

	private spawnNPCAtPosition(area: ManagedSpawnArea, npcConfig: NPCSpawnConfig, position: Vector3): void {
		// Generate unique request ID
		const requestId = HttpService.GenerateGUID(false);

		// Store pending request
		this.pendingRequests.set(requestId, {
			requestId,
			areaId: area.config.id,
			npcConfig,
			position,
			timestamp: tick(),
		});

		// Emit spawn request signal
		SignalServiceInstance.emit("NPCSpawnRequested", {
			npcType: npcConfig.npcType,
			position,
			config: npcConfig.config,
			requestId,
		});
	}

	private handleNPCDefeated(npcName: string): void {
		// Find which area this NPC belongs to
		for (const [areaId, area] of this.spawnAreas) {
			let foundNPC: UnifiedNPCEntity | undefined;
			let foundNPCId: string | undefined;

			// Find the NPC in this area's active NPCs
			for (const [npcId, npc] of area.activeNPCs) {
				if (npc.Model.Name === npcName) {
					foundNPC = npc;
					foundNPCId = npcId;
					break;
				}
			}

			if (foundNPC !== undefined && foundNPCId !== undefined) {
				// Remove from active NPCs
				area.activeNPCs.delete(foundNPCId);

				// Find the NPC config used for this spawn
				const npcConfig = this.selectRandomNPCConfig(area.config.npcConfigs); // For respawn
				if (npcConfig !== undefined) {
					// Schedule respawn
					const respawnTime = this.calculateRespawnTime(area.config);
					const spawnPosition = this.generateSpawnPosition(area.config);
					const timerId = `respawn_${foundNPCId}_${tick()}`;

					area.respawnTimers.set(timerId, {
						timeLeft: respawnTime,
						npcConfig,
						spawnPosition,
					});
				}

				SignalServiceInstance.emit("NPCDespawned", { areaId, npcId: foundNPCId });
				break;
			}
		}
	}

	private handlePlayerZoneChange(player: Player, zoneKey: ZoneKey, entered: boolean): void {
		// Find spawn areas linked to this zone
		for (const [areaId, area] of this.spawnAreas) {
			if (area.config.linkedZone === zoneKey) {
				if (area.config.dynamicSpawning) {
					// Adjust spawning based on player presence
					if (entered) {
						this.setSpawnAreaActive(areaId, true);
					}
					// Note: Don't auto-deactivate on exit as multiple players may be present
				}
			}
		}
	}

	private validateSpawnAreaConfig(config: SpawnAreaConfig): boolean {
		if (config.npcConfigs.size() === 0) {
			warn(`❌ Spawn area '${config.id}' has no NPC configurations`);
			return false;
		}

		if (config.maxNPCs <= 0) {
			warn(`❌ Spawn area '${config.id}' has invalid maxNPCs: ${config.maxNPCs}`);
			return false;
		}

		if (config.minNPCs > config.maxNPCs) {
			warn(`❌ Spawn area '${config.id}' has minNPCs > maxNPCs`);
			return false;
		}

		// Basic validation that NPC types are strings
		for (const npcConfig of config.npcConfigs) {
			if (typeOf(npcConfig.npcType) !== "string") {
				warn(`❌ Spawn area '${config.id}' references invalid NPC type: ${npcConfig.npcType}`);
				return false;
			}
		}

		return true;
	}

	private selectRandomNPCConfig(configs: NPCSpawnConfig[]): NPCSpawnConfig | undefined {
		if (configs.size() === 0) return undefined;

		// Calculate total weight
		const totalWeight = configs.reduce((sum, config) => sum + (config.weight ?? 1), 0);
		const randomValue = math.random() * totalWeight;

		// Select based on weight
		let currentWeight = 0;
		for (const config of configs) {
			currentWeight += config.weight ?? 1;
			if (randomValue <= currentWeight) {
				return config;
			}
		}

		return configs[0]; // Fallback
	}

	private generateSpawnPosition(config: SpawnAreaConfig): Vector3 {
		const angle = math.random() * math.pi * 2;
		const distance = math.random() * config.spawnRadius;
		const x = config.centerPosition.X + math.cos(angle) * distance;
		const z = config.centerPosition.Z + math.sin(angle) * distance;
		return new Vector3(x, config.centerPosition.Y, z);
	}

	private calculateRespawnTime(config: SpawnAreaConfig): number {
		const baseTime = config.respawnTimeSeconds;
		const variance = config.respawnVariance || 0;
		const randomVariance = (math.random() - 0.5) * 2 * variance;
		return math.max(1, baseTime + randomVariance);
	}

	private hasPlayersInRange(position: Vector3, range: number): boolean {
		for (const player of game.GetService("Players").GetPlayers()) {
			const character = player.Character;
			if (character !== undefined) {
				const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
				if (humanoidRootPart !== undefined) {
					const distance = position.sub(humanoidRootPart.Position).Magnitude;
					if (distance <= range) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Cleanup on service shutdown
	 */
	public destroy(): void {
		if (this.heartbeatConnection) {
			this.heartbeatConnection.Disconnect();
		}

		// Remove all spawn areas
		const areaIds: string[] = [];
		for (const [areaId] of this.spawnAreas) {
			areaIds.push(areaId);
		}
		for (const areaId of areaIds) {
			this.removeSpawnArea(areaId);
		}

		this.initialized = false;
	}

	/**
	 * Handle NPC spawn completion from UnifiedNPCService
	 */
	private handleNPCSpawnCompleted(npcEntity: unknown, requestId: string): void {
		const request = this.pendingRequests.get(requestId);
		if (!request) {
			warn(`NPCSpawnManager: Received spawn completion for unknown request ${requestId}`);
			return;
		}

		// Remove pending request
		this.pendingRequests.delete(requestId);

		// Find the area and add the NPC
		const area = this.spawnAreas.get(request.areaId);
		if (area && isUnifiedNPCEntity(npcEntity)) {
			const npc = npcEntity;
			area.activeNPCs.set(npc.npcId, npc);

			// Emit spawned signal
			SignalServiceInstance.emit("NPCSpawned", {
				areaId: request.areaId,
				npcId: npc.npcId,
				npcType: request.npcConfig.npcType,
			});
		}
	}

	/**
	 * Handle NPC despawn completion from UnifiedNPCService
	 */
	private handleNPCDespawnCompleted(npcId: string, requestId?: string): void {
		// Find and remove the NPC from relevant areas
		for (const [areaId, area] of this.spawnAreas) {
			if (area.activeNPCs.has(npcId)) {
				area.activeNPCs.delete(npcId);
				SignalServiceInstance.emit("NPCDespawned", { areaId, npcId });
				break;
			}
		}
	}
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const NPCSpawnManagerInstance = NPCSpawnManager.getInstance();
