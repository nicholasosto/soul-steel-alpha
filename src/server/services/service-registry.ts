/**
 * @file src/server/services/service-registry.ts
 * @module ServiceRegistry
 * @layer Server/Services
 * @description Centralized service registry for dependency injection and loose coupling
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { SignalServiceInstance } from "./signal-service";
import {
	IResourceOperations,
	IResourcePlayerOperations,
	IAbilityOperations,
	IMessageOperations,
	IDataOperations,
	ICombatOperations,
	IZoneOperations,
} from "./service-interfaces";

/**
 * Service registry that provides access to service implementations
 * through interfaces rather than concrete classes
 */
export class ServiceRegistry {
	private static instance: ServiceRegistry;
	private services = new Map<string, unknown>();

	public static getInstance(): ServiceRegistry {
		if (!ServiceRegistry.instance) {
			ServiceRegistry.instance = new ServiceRegistry();
		}
		return ServiceRegistry.instance;
	}

	private constructor() {
		// Initialize with SignalService as it's central to communication
		this.services.set("SignalService", SignalServiceInstance);
	}

	/**
	 * Register a service implementation
	 */
	public registerService<T>(serviceKey: string, implementation: T): void {
		this.services.set(serviceKey, implementation);
	}

	/**
	 * Get a service implementation by interface
	 */
	public getService<T>(serviceKey: string): T {
		const service = this.services.get(serviceKey);
		if (service === undefined) {
			error(`Service not found: ${serviceKey}`);
		}
		return service as T;
	}

	/**
	 * Get the signal service for inter-service communication
	 */
	public getSignalService() {
		return SignalServiceInstance;
	}

	/**
	 * Helper methods for common service interfaces
	 */
	public getResourceOperations(): IResourceOperations {
		return this.getService<IResourceOperations>("ResourceOperations");
	}

	public getResourcePlayerOperations(): IResourcePlayerOperations {
		return this.getService<IResourcePlayerOperations>("ResourcePlayerOperations");
	}

	public getAbilityOperations(): IAbilityOperations {
		return this.getService<IAbilityOperations>("AbilityOperations");
	}

	public getMessageOperations(): IMessageOperations {
		return this.getService<IMessageOperations>("MessageOperations");
	}

	public getDataOperations(): IDataOperations {
		return this.getService<IDataOperations>("DataOperations");
	}

	public getCombatOperations(): ICombatOperations {
		return this.getService<ICombatOperations>("CombatOperations");
	}

	public getZoneOperations(): IZoneOperations {
		return this.getService<IZoneOperations>("ZoneOperations");
	}

	/**
	 * Initialize all services - should be called once during startup
	 */
	public initializeServices(): void {
		// Services will register themselves during their initialization
		print("Service registry initialized");
	}

	/**
	 * Cleanup all services
	 */
	public cleanup(): void {
		SignalServiceInstance.disconnectAll();
		this.services.clear();
	}
}

export const ServiceRegistryInstance = ServiceRegistry.getInstance();
