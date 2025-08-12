/**
 * @file src/server/collection-items/lava-part.ts
 * @module LavaPartCollectionItem
 * @layer Server/CollectionItems
 * @description Lava part collection item - handles damage-dealing environmental hazards
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Extracted from collection-service into modular architecture
 *
 * ## Functionality
 * - Damages players who touch lava-tagged parts
 * - Uses signal-based damage system via HealthDamageRequested
 * - Prevents rapid-fire damage with cooldown system
 * - Fallback to direct damage for NPCs
 *
 * ## Configuration
 * Tag any Part in Roblox Studio with "LavaPart" to make it deal damage on touch.
 *
 * ## Attributes (Optional)
 * - `DamageAmount` (number): Damage to deal (default: 10)
 * - `DamageCooldown` (number): Seconds between damage instances (default: 1)
 */

import { BaseCollectionItem, CollectionItemConfig } from "./base-collection-item";
import { SignalServiceInstance } from "../services/signal-service";

export class LavaPartCollectionItem extends BaseCollectionItem {
	private static readonly DEFAULT_DAMAGE = 10;
	private static readonly DEFAULT_COOLDOWN = 1;

	constructor() {
		const config: CollectionItemConfig = {
			tag: "LavaPart",
			name: "Lava Part",
			enabled: true,
		};
		super(config);
	}

	public onTouched(part: Part, hit: BasePart): void {
		const player = this.getPlayerFromHit(hit);
		if (!player) {
			// Handle NPC damage directly
			const humanoid = hit.Parent?.FindFirstChildOfClass("Humanoid");
			if (humanoid) {
				const damage = (part.GetAttribute("DamageAmount") as number) ?? LavaPartCollectionItem.DEFAULT_DAMAGE;
				humanoid.TakeDamage(damage);
				print(`Lava dealt ${damage} damage to NPC: ${hit.Parent?.Name}`);
			}
			return;
		}

		// Prevent rapid-fire damage
		const cooldown = (part.GetAttribute("DamageCooldown") as number) ?? LavaPartCollectionItem.DEFAULT_COOLDOWN;
		const humanoid = hit.Parent?.FindFirstChildOfClass("Humanoid");
		if (humanoid && !this.preventRapidFire(humanoid, "LavaTouched", cooldown)) {
			return; // Player recently touched lava
		}

		// Get damage amount from part attributes or use default
		const damage = (part.GetAttribute("DamageAmount") as number) ?? LavaPartCollectionItem.DEFAULT_DAMAGE;

		// Use signal-based damage system for players
		SignalServiceInstance.emit("HealthDamageRequested", {
			player,
			amount: damage,
			source: "Lava",
		});

		print(`Lava touched by ${player.Name}, dealt ${damage} damage via signal`);
	}
}

// Export singleton instance
export const LavaPartInstance = new LavaPartCollectionItem();
