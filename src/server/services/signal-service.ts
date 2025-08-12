/**
 * @file src/server/services/signal-service.ts
 * @module SignalService
 * @layer Server/Services
 * @description Centralized signal system for inter-service communication
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Added comprehensive signal documentation
 *
 * ## Server Signals (Inter-Service Communication)
 * - **Manages all signals** - This service IS the signal system
 * - Provides signal registration, connection, and emission functionality
 * - Maintains type-safe signal definitions through ServiceEvents interface
 *
 * ## Client Events (Network Communication)
 * - None - Pure server-side signal coordination with no client communication
 *
 * ## Roblox Events (Engine Integration)
 * - None - Signal management service with no direct Roblox engine integration
 */

import Signal from "@rbxts/signal";
import { ZoneKey } from "shared/keys";
import { SSEntity } from "shared/types";
import { PlayerProgression } from "shared/types/player-data";

// Service event types
export interface ServiceEvents {
	// Zone events
	ZonePlayerEntered: { player: Player; zoneKey: ZoneKey };
	ZonePlayerExited: { player: Player; zoneKey: ZoneKey };
	ZoneCreated: { zoneKey: ZoneKey };
	ZoneDestroyed: { zoneKey: ZoneKey };
	ZoneActivated: { zoneKey: ZoneKey };
	ZoneDeactivated: { zoneKey: ZoneKey };

	// Combat events (examples for future use)
	PlayerDamaged: { victim: SSEntity; attacker?: Player; damage: number };
	AbilityActivated: { player: Player; abilityKey: string };

	// Resource events - Enhanced for better resource management
	ResourceChanged: {
		player: Player;
		resourceType: "health" | "mana" | "stamina";
		oldValue: number;
		newValue: number;
	};
	HealthDamageRequested: { player: Player; amount: number; source?: string };
	HealthHealRequested: { player: Player; amount: number; source?: string };
	ManaConsumed: { player: Player; amount: number; source?: string };
	ManaRestored: { player: Player; amount: number; source?: string };
	StaminaConsumed: { player: Player; amount: number; source?: string };
	StaminaRestored: { player: Player; amount: number; source?: string };

	// Humanoid events - Bridge between Roblox API and our system
	HumanoidHealthChanged: { player: Player; character: Model; newHealth: number; maxHealth: number };
	HumanoidDied: { player: Player; character: Model };

	// Progression events - Player experience and leveling
	ExperienceAwarded: { player: Player; amount: number; source?: string };
	LevelUp: { player: Player; oldLevel: number; newLevel: number; progression: PlayerProgression };
	ProgressionUpdated: { player: Player; progression: PlayerProgression };
}

export class SignalService {
	private static instance: SignalService;
	private signals = new Map<keyof ServiceEvents, Signal<(data: unknown) => void>>();

	public static getInstance(): SignalService {
		if (SignalService.instance === undefined) {
			SignalService.instance = new SignalService();
		}
		return SignalService.instance;
	}

	private constructor() {
		// Initialize all signals
		this.initializeSignals();
	}

	private initializeSignals(): void {
		const eventKeys: (keyof ServiceEvents)[] = [
			"ZonePlayerEntered",
			"ZonePlayerExited",
			"ZoneCreated",
			"ZoneDestroyed",
			"ZoneActivated",
			"ZoneDeactivated",
			"PlayerDamaged",
			"AbilityActivated",
			"ResourceChanged",
			"HealthDamageRequested",
			"HealthHealRequested",
			"ManaConsumed",
			"ManaRestored",
			"StaminaConsumed",
			"StaminaRestored",
			"HumanoidHealthChanged",
			"HumanoidDied",
			"ExperienceAwarded",
			"LevelUp",
			"ProgressionUpdated",
		];

		for (const eventKey of eventKeys) {
			this.signals.set(eventKey, new Signal<(data: unknown) => void>());
		}
	}

	/**
	 * Get a signal for the specified event type
	 */
	public getSignal<K extends keyof ServiceEvents>(
		eventType: K,
	): Signal<(data: ServiceEvents[K]) => void> | undefined {
		return this.signals.get(eventType) as unknown as Signal<(data: ServiceEvents[K]) => void> | undefined;
	}

	/**
	 * Emit an event to all listeners
	 */
	public emit<K extends keyof ServiceEvents>(eventType: K, data: ServiceEvents[K]): void {
		const signal = this.signals.get(eventType) as unknown as Signal<(data: ServiceEvents[K]) => void> | undefined;
		if (signal !== undefined) {
			signal.Fire(data);
		} else {
			warn(`Attempted to emit unknown event type: ${eventType}`);
		}
	}

	/**
	 * Connect to an event
	 */
	public connect<K extends keyof ServiceEvents>(
		eventType: K,
		callback: (data: ServiceEvents[K]) => void,
	): RBXScriptConnection | undefined {
		const signal = this.signals.get(eventType) as unknown as Signal<(data: ServiceEvents[K]) => void> | undefined;
		if (signal !== undefined) {
			return signal.Connect(callback);
		}
		warn(`Attempted to connect to unknown event type: ${eventType}`);
		return undefined;
	}

	/**
	 * Connect to an event once
	 */
	public connectOnce<K extends keyof ServiceEvents>(
		eventType: K,
		callback: (data: ServiceEvents[K]) => void,
	): RBXScriptConnection | undefined {
		const signal = this.signals.get(eventType) as unknown as Signal<(data: ServiceEvents[K]) => void> | undefined;
		if (signal !== undefined) {
			return signal.Once(callback);
		}
		warn(`Attempted to connect once to unknown event type: ${eventType}`);
		return undefined;
	}

	/**
	 * Disconnect all connections for cleanup
	 */
	public disconnectAll(): void {
		// Note: DisconnectAll may not be available on all Signal versions
		// Individual connections should be managed by the callers
		print("SignalService: cleanup requested - connections should be managed individually");
	}
}

// Export singleton instance
export const SignalServiceInstance = SignalService.getInstance();
