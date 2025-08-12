/**
 * @file src/server/collection-items/base-collection-item.ts
 * @module BaseCollectionItem
 * @layer Server/CollectionItems
 * @description Base interface and abstract class for all collection items
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Created plugin-like collection item architecture
 *
 * ## Purpose
 * Provides a standardized interface for all collection items, enabling:
 * - Consistent lifecycle management
 * - Plugin-like architecture for easy extensibility
 * - Centralized coordination through CollectionService
 * - Self-contained, testable collection item modules
 */

import { CollectionService } from "@rbxts/services";

/**
 * Configuration interface for collection items
 */
export interface CollectionItemConfig {
	/** The CollectionService tag to monitor */
	tag: string;
	/** Human-readable name for logging */
	name: string;
	/** Whether this item type is enabled */
	enabled?: boolean;
}

/**
 * Base interface that all collection items must implement
 */
export interface ICollectionItem {
	/** Configuration for this collection item type */
	readonly config: CollectionItemConfig;

	/** Collection of instances currently being managed */
	readonly instances: Array<Instance>;

	/** Map of active connections for cleanup */
	readonly connections: Map<Part, RBXScriptConnection>;

	/**
	 * Initialize the collection item system
	 * Called once during server startup
	 */
	initialize(): void;

	/**
	 * Handle when a new instance is added with this tag
	 * @param instance The instance that was tagged
	 */
	onInstanceAdded(instance: Instance): void;

	/**
	 * Handle when an instance with this tag is removed
	 * @param instance The instance that was untagged
	 */
	onInstanceRemoved(instance: Instance): void;

	/**
	 * Handle the touch event for this collection item
	 * @param part The part that was touched
	 * @param hit The part that touched it
	 */
	onTouched(part: Part, hit: BasePart): void;

	/**
	 * Cleanup all connections and references
	 * Called during shutdown or when disabling the item type
	 */
	cleanup(): void;
}

/**
 * Abstract base class providing common functionality for collection items
 */
export abstract class BaseCollectionItem implements ICollectionItem {
	public readonly instances: Array<Instance> = [];
	public readonly connections: Map<Part, RBXScriptConnection> = new Map();

	constructor(public readonly config: CollectionItemConfig) {
		if (config.enabled === false) {
			print(`Collection item ${config.name} is disabled`);
			return;
		}
	}

	/**
	 * Standard initialization - sets up existing instances and listeners
	 */
	public initialize(): void {
		if (this.config.enabled === false) return;

		// Initialize existing instances
		const existingInstances = CollectionService.GetTagged(this.config.tag);
		existingInstances.forEach((instance) => {
			if (instance.IsA("Part")) {
				this.instances.push(instance);
				this.addTouchHandler(instance);
			}
		});

		// Listen for new instances
		CollectionService.GetInstanceAddedSignal(this.config.tag).Connect((instance) => {
			this.onInstanceAdded(instance);
		});

		// Listen for removed instances
		CollectionService.GetInstanceRemovedSignal(this.config.tag).Connect((instance) => {
			this.onInstanceRemoved(instance);
		});

		print(`Collection item ${this.config.name} initialized with ${this.instances.size()} existing instances`);
	}

	/**
	 * Standard instance added handler
	 */
	public onInstanceAdded(instance: Instance): void {
		if (instance.IsA("Part")) {
			this.instances.push(instance);
			this.addTouchHandler(instance);
			print(`${this.config.name} added: ${instance.Name}`);
		}
	}

	/**
	 * Standard instance removed handler
	 */
	public onInstanceRemoved(instance: Instance): void {
		if (instance.IsA("Part")) {
			const index = this.instances.indexOf(instance);
			if (index !== -1) {
				this.instances.remove(index);
				this.removeTouchHandler(instance);
				print(`${this.config.name} removed: ${instance.Name}`);
			}
		}
	}

	/**
	 * Add touch handler to a part, preventing duplicates
	 */
	protected addTouchHandler(part: Part): void {
		if (this.connections.has(part)) {
			print(`${this.config.name} ${part.Name} already has a touch handler`);
			return;
		}

		const connection = part.Touched.Connect((hit) => {
			this.onTouched(part, hit);
		});

		this.connections.set(part, connection);
		print(`Added touch handler for ${this.config.name}: ${part.Name}`);
	}

	/**
	 * Remove touch handler from a part
	 */
	protected removeTouchHandler(part: Part): void {
		const connection = this.connections.get(part);
		if (connection) {
			connection.Disconnect();
			this.connections.delete(part);
		}
	}

	/**
	 * Abstract method - each collection item must implement its own touch logic
	 */
	public abstract onTouched(part: Part, hit: BasePart): void;

	/**
	 * Standard cleanup implementation
	 */
	public cleanup(): void {
		this.connections.forEach((connection) => connection.Disconnect());
		this.connections.clear();
		this.instances.clear();
		print(`${this.config.name} collection item cleaned up`);
	}

	/**
	 * Helper to get player from character
	 */
	protected getPlayerFromHit(hit: BasePart): Player | undefined {
		const character = hit.Parent;
		if (character?.IsA("Model") && character.FindFirstChildOfClass("Humanoid")) {
			return game.GetService("Players").GetPlayerFromCharacter(character);
		}
		return undefined;
	}

	/**
	 * Helper to prevent rapid-fire interactions
	 */
	protected preventRapidFire(humanoid: Humanoid, tagName: string, cooldownSeconds = 1): boolean {
		if (humanoid.HasTag(tagName)) {
			return false; // Already interacted recently
		}

		humanoid.AddTag(tagName);
		task.delay(cooldownSeconds, () => {
			if (humanoid.Parent) {
				humanoid.RemoveTag(tagName);
			}
		});

		return true; // Safe to proceed
	}
}
