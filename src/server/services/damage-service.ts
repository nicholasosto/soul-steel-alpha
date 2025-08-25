// /**
//  * @file src/server/services/damage-service.ts
//  * @module DamageService
//  * @layer Server/Services
//  * @description Signal-based facade for requesting resource changes (damage, heals, mana/stamina usage)
//  *
//  * Responsibilities
//  * - Provide a small, clear API for other server systems to request resource changes via signals
//  * - Keep callers decoupled from ResourceService internals
//  * - Optionally expose an adapter in the Service Registry for interface-driven access
//  *
//  * ## Server Signals (Inter-Service Communication)
//  * - HealthDamageRequested, HealthHealRequested
//  * - ManaConsumed, ManaRestored
//  * - StaminaConsumed, StaminaRestored
//  *
//  * ## Client Events (Network Communication)
//  * - None (pure server-side signal emission)
//  *
//  * ## Roblox Events (Engine Integration)
//  * - None
//  *
//  * Public API
//  * - Initialize(): Sets up and registers the IResourceSignalOperations adapter in the Service Registry.
//  * - RequestHealthDamage(player, amount, source?): void — Emit damage request for health.
//  * - RequestHealthHeal(player, amount, source?): void — Emit heal request for health.
//  * - RequestManaConsumption(player, amount, source?): void — Emit mana consumption request.
//  * - RequestManaRestoration(player, amount, source?): void — Emit mana restoration request.
//  * - RequestStaminaConsumption(player, amount, source?): void — Emit stamina consumption request.
//  * - RequestStaminaRestoration(player, amount, source?): void — Emit stamina restoration request.
//  * - ApplyLavaDamage(player): void — Example helper that requests lava damage.
//  * - ApplyAbilityCost(player, manaCost, abilityName): void — Example helper for ability mana cost.
//  *
//  * Example
//  * ```ts
//  * import { DamageServiceInstance } from "server/services";
//  * DamageServiceInstance.RequestHealthDamage(player, 15, "Trap");
//  * ```
//  */

// import { SignalServiceInstance } from "./signal-service";
// import { ServiceRegistryInstance } from "./service-registry";
// import { IResourceSignalOperations } from "./service-interfaces";

// /**
//  * DamageService - Example of how other services should request resource changes
//  *
//  * Instead of directly modifying ResourceService, services emit signals that
//  * ResourceService listens to. This promotes loose coupling and makes the
//  * system more maintainable.
//  */
// export class DamageService {
// 	private static instance?: DamageService;
// 	public static DEBUG = false;

// 	private initialized = false;

// 	private constructor() {
// 		// Initialize any damage-specific logic here
// 	}

// 	public static getInstance(): DamageService {
// 		if (!DamageService.instance) {
// 			DamageService.instance = new DamageService();
// 		}
// 		return DamageService.instance;
// 	}

// 	/** Initialize and register the interface adapter in the Service Registry */
// 	public Initialize(): void {
// 		if (this.initialized) return;
// 		const adapter: IResourceSignalOperations = {
// 			requestHealthDamage(player, amount, source) {
// 				return DamageService.getInstance().RequestHealthDamage(player, amount, source);
// 			},
// 			requestHealthHeal(player, amount, source) {
// 				return DamageService.getInstance().RequestHealthHeal(player, amount, source);
// 			},
// 			requestManaConsumption(player, amount, source) {
// 				return DamageService.getInstance().RequestManaConsumption(player, amount, source);
// 			},
// 			requestManaRestoration(player, amount, source) {
// 				return DamageService.getInstance().RequestManaRestoration(player, amount, source);
// 			},
// 			requestStaminaConsumption(player, amount, source) {
// 				return DamageService.getInstance().RequestStaminaConsumption(player, amount, source);
// 			},
// 			requestStaminaRestoration(player, amount, source) {
// 				return DamageService.getInstance().RequestStaminaRestoration(player, amount, source);
// 			},
// 		};
// 		ServiceRegistryInstance.registerService<IResourceSignalOperations>("ResourceSignalOperations", adapter);
// 		this.initialized = true;
// 		if (DamageService.DEBUG) print("DamageService: Adapter registered as ResourceSignalOperations");
// 	}

// 	/** Emit helper with DEBUG logging */
// 	private emit<K extends keyof import("./signal-service").ServiceEvents>(
// 		event: K,
// 		data: import("./signal-service").ServiceEvents[K],
// 	) {
// 		if (DamageService.DEBUG) print(`DamageService: Emitting ${tostring(event)}`);
// 		SignalServiceInstance.emit(event, data as never);
// 	}

// 	/** Request damage to a player's health */
// 	public RequestHealthDamage(player: Player, amount: number, source?: string): void {
// 		this.emit("HealthDamageRequested", { player, amount, source: source ?? "DamageService" });
// 	}

// 	/** Request healing for a player */
// 	public RequestHealthHeal(player: Player, amount: number, source?: string): void {
// 		this.emit("HealthHealRequested", { player, amount, source: source ?? "DamageService" });
// 	}

// 	/** Request mana consumption */
// 	public RequestManaConsumption(player: Player, amount: number, source?: string): void {
// 		this.emit("ManaConsumed", { player, amount, source: source ?? "DamageService" });
// 	}

// 	/** Request mana restoration */
// 	public RequestManaRestoration(player: Player, amount: number, source?: string): void {
// 		this.emit("ManaRestored", { player, amount, source: source ?? "DamageService" });
// 	}

// 	/** Request stamina consumption */
// 	public RequestStaminaConsumption(player: Player, amount: number, source?: string): void {
// 		this.emit("StaminaConsumed", { player, amount, source: source ?? "DamageService" });
// 	}

// 	/** Request stamina restoration */
// 	public RequestStaminaRestoration(player: Player, amount: number, source?: string): void {
// 		this.emit("StaminaRestored", { player, amount, source: source ?? "DamageService" });
// 	}

// 	/** Example method showing how lava damage could work through signals */
// 	public ApplyLavaDamage(player: Player): void {
// 		this.RequestHealthDamage(player, 10, "Lava");
// 	}

// 	/** Example method showing how ability costs could work through signals */
// 	public ApplyAbilityCost(player: Player, manaCost: number, abilityName: string): void {
// 		this.RequestManaConsumption(player, manaCost, `Ability: ${abilityName}`);
// 	}
// }

// // Export singleton instance
// export const DamageServiceInstance = DamageService.getInstance();
// // Ensure adapter is registered on import
// DamageServiceInstance.Initialize();
