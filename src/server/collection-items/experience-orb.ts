/**
 * @file src/server/collection-items/experience-orb.ts
 * @module ExperienceOrbCollectionItem
 * @layer Server/CollectionItems
 * @description Experience orb collection item - handles XP-granting collectibles
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Extracted from collection-service into modular architecture
 *
 * ## Functionality
 * - Awards experience to players who touch experience orb-tagged parts
 * - Uses signal-based experience system via ExperienceAwarded
 * - Configurable experience amounts, respawn times, and collection limits
 * - Visual feedback with transparency and collision toggling
 * - Per-player collection tracking for one-time rewards
 *
 * ## Configuration
 * Tag any Part in Roblox Studio with "ExperienceOrb" to make it award XP on touch.
 *
 * ## Attributes (Optional)
 * - `ExperienceAmount` (number): XP to award (default: 25)
 * - `RespawnTime` (number): Seconds before orb respawns (default: 30)
 * - `OncePerPlayer` (boolean): If true, each player can only collect once (default: false)
 */

import { BaseCollectionItem, CollectionItemConfig } from "./base-collection-item";
import { SignalServiceInstance } from "../services/signal-service";

export class ExperienceOrbCollectionItem extends BaseCollectionItem {
	private static readonly DEFAULT_EXPERIENCE = 25;
	private static readonly DEFAULT_RESPAWN_TIME = 30;

	// Track which players have collected which orbs (for OncePerPlayer orbs)
	private readonly playerCollections = new Map<Part, Set<Player>>();

	constructor() {
		const config: CollectionItemConfig = {
			tag: "ExperienceOrb",
			name: "Experience Orb",
			enabled: true,
		};
		super(config);
	}

	public onInstanceRemoved(instance: Instance): void {
		super.onInstanceRemoved(instance);

		// Clean up player collection tracking for this orb
		if (instance.IsA("Part")) {
			this.playerCollections.delete(instance);
		}
	}

	public onTouched(part: Part, hit: BasePart): void {
		// Only process if orb is visible (hasn't been collected recently)
		if (part.Transparency >= 1) {
			return;
		}

		const player = this.getPlayerFromHit(hit);
		if (!player) {
			return; // Only players can collect experience orbs
		}

		// Get configuration from attributes
		const experienceAmount =
			(part.GetAttribute("ExperienceAmount") as number) ?? ExperienceOrbCollectionItem.DEFAULT_EXPERIENCE;
		const respawnTime =
			(part.GetAttribute("RespawnTime") as number) ?? ExperienceOrbCollectionItem.DEFAULT_RESPAWN_TIME;
		const oncePerPlayer = (part.GetAttribute("OncePerPlayer") as boolean) ?? false;

		// Check if this player already collected this orb (if OncePerPlayer is enabled)
		if (oncePerPlayer) {
			const collectedBy = this.playerCollections.get(part) ?? new Set<Player>();
			if (collectedBy.has(player)) {
				return; // Player already collected this orb
			}

			// Mark as collected by this player
			collectedBy.add(player);
			this.playerCollections.set(part, collectedBy);
		}

		// Award experience via signal
		SignalServiceInstance.emit("ExperienceAwarded", {
			player,
			amount: experienceAmount,
			source: `ExperienceOrb:${part.Name}`,
		});

		// Visual feedback - hide the orb temporarily
		this.hideOrb(part);

		print(`Experience orb ${part.Name} collected by ${player.Name} for ${experienceAmount} XP`);

		// Respawn the orb after specified time (if not OncePerPlayer)
		if (!oncePerPlayer) {
			task.delay(respawnTime, () => {
				// Make sure part still exists
				if (part.Parent !== undefined) {
					this.showOrb(part);
					print(`Experience orb ${part.Name} respawned`);
				}
			});
		}
	}

	/**
	 * Hide the orb visually and disable collision
	 */
	private hideOrb(part: Part): void {
		part.Transparency = 1;
		part.CanCollide = false;

		// Optional: Disable any particle effects or sounds here
		const particles = part.FindFirstChildOfClass("ParticleEmitter");
		if (particles) {
			particles.Enabled = false;
		}
	}

	/**
	 * Show the orb visually and enable collision
	 */
	private showOrb(part: Part): void {
		part.Transparency = 0;
		part.CanCollide = true;

		// Optional: Re-enable any particle effects or sounds here
		const particles = part.FindFirstChildOfClass("ParticleEmitter");
		if (particles) {
			particles.Enabled = true;
		}
	}

	/**
	 * Override cleanup to also clear player collection tracking
	 */
	public cleanup(): void {
		super.cleanup();
		this.playerCollections.clear();
		print("Experience Orb collection tracking cleared");
	}
}

// Export singleton instance
export const ExperienceOrbInstance = new ExperienceOrbCollectionItem();
