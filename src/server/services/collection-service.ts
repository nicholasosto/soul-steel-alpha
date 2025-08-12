/**
 * @file src/server/services/collection-service.ts
 * @module CollectionService
 * @layer Server/Services
 * @description Clean manager for CollectionService-tagged objects and their behaviors
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Refactored into clean manager with modular collection items
 *
 * ## Architecture
 * The CollectionService now acts as a clean coordinator/manager that:
 * - Initializes all registered collection items
 * - Provides centralized lifecycle management
 * - Handles cleanup and error recovery
 * - Offers debugging and monitoring capabilities
 *
 * Individual collection item logic is now contained in separate modules under:
 * `src/server/collection-items/`
 *
 * ## Server Signals (Inter-Service Communication)
 * - Depends on collection items (e.g., HealthDamageRequested, ExperienceAwarded)
 * - No direct signal emission - delegates to individual collection items
 *
 * ## Client Events (Network Communication)
 * - None - All collection items are server-side environmental effects
 *
 * ## Roblox Events (Engine Integration)
 * - Managed by individual collection item modules
 * - Centralized error handling and monitoring
 */

import { getEnabledCollectionItems, ICollectionItem } from "../collection-items";

export class CollectionServiceManager {
	private static instance?: CollectionServiceManager;
	private collectionItems: ICollectionItem[] = [];
	private isInitialized = false;

	private constructor() {}

	public static getInstance(): CollectionServiceManager {
		if (!CollectionServiceManager.instance) {
			CollectionServiceManager.instance = new CollectionServiceManager();
		}
		return CollectionServiceManager.instance;
	}

	/**
	 * Initialize all enabled collection items
	 */
	public initialize(): void {
		if (this.isInitialized) {
			warn("CollectionServiceManager is already initialized");
			return;
		}

		try {
			// Get all enabled collection items
			this.collectionItems = getEnabledCollectionItems();

			// Initialize each collection item
			for (const item of this.collectionItems) {
				try {
					item.initialize();
					print(`✅ Initialized collection item: ${item.config.name} (${item.config.tag})`);
				} catch (error) {
					warn(`❌ Failed to initialize collection item ${item.config.name}:`, error);
				}
			}

			this.isInitialized = true;
			print(`🎯 CollectionServiceManager initialized with ${this.collectionItems.size()} collection items`);
		} catch (error) {
			warn("❌ Failed to initialize CollectionServiceManager:", error);
		}
	}

	/**
	 * Get status of all collection items
	 */
	public getStatus(): string {
		if (!this.isInitialized) {
			return "❌ CollectionServiceManager not initialized";
		}

		const status = ["📊 Collection Service Status:", `Total items: ${this.collectionItems.size()}`, ""];

		for (const item of this.collectionItems) {
			const instanceCount = item.instances.size();
			const connectionCount = item.connections.size();
			status.push(
				`🏷️  ${item.config.name} (${item.config.tag}):`,
				`   📦 Instances: ${instanceCount}`,
				`   🔗 Connections: ${connectionCount}`,
				`   ✅ Enabled: ${item.config.enabled !== false}`,
				"",
			);
		}

		return status.join("\n");
	}

	/**
	 * Get a specific collection item by tag
	 */
	public getCollectionItem(tag: string): ICollectionItem | undefined {
		return this.collectionItems.find((item) => item.config.tag === tag);
	}

	/**
	 * Cleanup all collection items
	 */
	public cleanup(): void {
		for (const item of this.collectionItems) {
			try {
				item.cleanup();
				print(`🧹 Cleaned up collection item: ${item.config.name}`);
			} catch (error) {
				warn(`❌ Failed to cleanup collection item ${item.config.name}:`, error);
			}
		}

		this.collectionItems = [];
		this.isInitialized = false;
		print("🧹 CollectionServiceManager cleanup complete");
	}

	/**
	 * Get collection items grouped by their enabled status
	 */
	public getItemsSummary(): { enabled: string[]; disabled: string[] } {
		const enabled: string[] = [];
		const disabled: string[] = [];

		for (const item of this.collectionItems) {
			if (item.config.enabled !== false) {
				enabled.push(`${item.config.name} (${item.config.tag})`);
			} else {
				disabled.push(`${item.config.name} (${item.config.tag})`);
			}
		}

		return { enabled, disabled };
	}
}

// Export singleton instance
export const CollectionServiceManagerInstance = CollectionServiceManager.getInstance();

/**
 * Convenience function for initializing the collection service system
 * Call this from your service loader
 */
export function RunCollectionService(): void {
	CollectionServiceManagerInstance.initialize();
}

// Legacy exports for backwards compatibility
export function RunLavaParts(): void {
	warn("RunLavaParts() is deprecated. Use RunCollectionService() instead.");
	RunCollectionService();
}

export function RunExperienceOrbs(): void {
	warn("RunExperienceOrbs() is deprecated. Use RunCollectionService() instead.");
	RunCollectionService();
}
