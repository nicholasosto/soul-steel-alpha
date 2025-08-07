/**
 * @file src/server/services/damage-service.ts
 * @module DamageService
 * @layer Server/Services
 * @description Example service demonstrating signal-based resource modification
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { SignalServiceInstance } from "./signal-service";

/**
 * DamageService - Example of how other services should request resource changes
 *
 * Instead of directly modifying ResourceService, services emit signals that
 * ResourceService listens to. This promotes loose coupling and makes the
 * system more maintainable.
 */
export class DamageService {
	private static instance?: DamageService;

	private constructor() {
		// Initialize any damage-specific logic here
	}

	public static getInstance(): DamageService {
		if (!DamageService.instance) {
			DamageService.instance = new DamageService();
		}
		return DamageService.instance;
	}

	/**
	 * Request damage to a player's health
	 * This emits a signal that ResourceService will listen to
	 */
	public requestHealthDamage(player: Player, amount: number, source?: string): void {
		SignalServiceInstance.emit("HealthDamageRequested", {
			player,
			amount,
			source: source ?? "DamageService",
		});
	}

	/**
	 * Request healing for a player
	 */
	public requestHealthHeal(player: Player, amount: number, source?: string): void {
		SignalServiceInstance.emit("HealthHealRequested", {
			player,
			amount,
			source: source ?? "DamageService",
		});
	}

	/**
	 * Request mana consumption
	 */
	public requestManaConsumption(player: Player, amount: number, source?: string): void {
		SignalServiceInstance.emit("ManaConsumed", {
			player,
			amount,
			source: source ?? "DamageService",
		});
	}

	/**
	 * Request mana restoration
	 */
	public requestManaRestoration(player: Player, amount: number, source?: string): void {
		SignalServiceInstance.emit("ManaRestored", {
			player,
			amount,
			source: source ?? "DamageService",
		});
	}

	/**
	 * Example method showing how lava damage could work through signals
	 */
	public applyLavaDamage(player: Player): void {
		this.requestHealthDamage(player, 10, "Lava");
	}

	/**
	 * Example method showing how ability costs could work through signals
	 */
	public applyAbilityCost(player: Player, manaCost: number, abilityName: string): void {
		this.requestManaConsumption(player, manaCost, `Ability: ${abilityName}`);
	}
}

// Export singleton instance
export const DamageServiceInstance = DamageService.getInstance();
