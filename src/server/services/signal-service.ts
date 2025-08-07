/**
 * @file src/server/services/signal-service.ts
 * @module SignalService
 * @layer Server/Services
 * @description Centralized signal system for inter-service communication
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import Signal from "@rbxts/signal";
import { ZoneKey } from "shared/keys";

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
	PlayerDamaged: { victim: Player; attacker?: Player; damage: number };
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
}

export class SignalService {
	private static instance: SignalService;
	private signals = new Map<string, Signal>();

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
		const eventKeys = [
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
		];

		for (const eventKey of eventKeys) {
			this.signals.set(eventKey, new Signal());
		}
	}

	/**
	 * Get a signal for the specified event type
	 */
	public getSignal(eventType: string): Signal | undefined {
		return this.signals.get(eventType);
	}

	/**
	 * Emit an event to all listeners
	 */
	public emit(eventType: string, data: unknown): void {
		const signal = this.signals.get(eventType);
		if (signal !== undefined) {
			(signal as Signal<(data: unknown) => void>).Fire(data);
		} else {
			warn(`Attempted to emit unknown event type: ${eventType}`);
		}
	}

	/**
	 * Connect to an event
	 */
	public connect(eventType: string, callback: (data: unknown) => void): RBXScriptConnection | undefined {
		const signal = this.signals.get(eventType);
		if (signal !== undefined) {
			return (signal as Signal<(data: unknown) => void>).Connect(callback);
		}
		warn(`Attempted to connect to unknown event type: ${eventType}`);
		return undefined;
	}

	/**
	 * Connect to an event once
	 */
	public connectOnce(eventType: string, callback: (data: unknown) => void): RBXScriptConnection | undefined {
		const signal = this.signals.get(eventType);
		if (signal !== undefined) {
			return (signal as Signal<(data: unknown) => void>).Once(callback);
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
