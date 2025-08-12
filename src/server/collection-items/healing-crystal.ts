/**
 * @file src/server/collection-items/healing-crystal.ts
 * @module HealingCrystalCollectionItem
 * @layer Server/CollectionItems
 * @description Healing crystal collection item - restores player health on touch
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Example future collection item
 *
 * ## Functionality
 * - Heals players who touch healing crystal-tagged parts
 * - Uses signal-based healing system via HealthHealRequested
 * - Configurable heal amounts and cooldown periods
 * - Per-player cooldown system to prevent spam
 *
 * ## Configuration
 * Tag any Part in Roblox Studio with "HealingCrystal" to make it heal on touch.
 *
 * ## Attributes (Optional)
 * - `HealAmount` (number): Health to restore (default: 50)
 * - `CooldownTime` (number): Seconds between uses per player (default: 10)
 * - `MaxHealth` (boolean): If true, fully heals to max health (default: false)
 */

import { BaseCollectionItem, CollectionItemConfig } from "./base-collection-item";
import { SignalServiceInstance } from "../services/signal-service";

export class HealingCrystalCollectionItem extends BaseCollectionItem {
	private static readonly DEFAULT_HEAL_AMOUNT = 50;
	private static readonly DEFAULT_COOLDOWN = 10;

	constructor() {
		const config: CollectionItemConfig = {
			tag: "HealingCrystal",
			name: "Healing Crystal",
			enabled: false, // Disabled by default - enable when you want to use it
		};
		super(config);
	}

	public onTouched(part: Part, hit: BasePart): void {
		const player = this.getPlayerFromHit(hit);
		if (!player) {
			return; // Only players can use healing crystals
		}

		// Check cooldown
		const cooldown = (part.GetAttribute("CooldownTime") as number) ?? HealingCrystalCollectionItem.DEFAULT_COOLDOWN;
		const humanoid = hit.Parent?.FindFirstChildOfClass("Humanoid");
		if (humanoid && !this.preventRapidFire(humanoid, "HealingCrystalUsed", cooldown)) {
			return; // Player recently used this crystal
		}

		// Get heal configuration
		const maxHealth = (part.GetAttribute("MaxHealth") as boolean) ?? false;
		const healAmount = maxHealth
			? 999 // Large number to trigger full heal in resource service
			: ((part.GetAttribute("HealAmount") as number) ?? HealingCrystalCollectionItem.DEFAULT_HEAL_AMOUNT);

		// Request healing via signal
		SignalServiceInstance.emit("HealthHealRequested", {
			player,
			amount: healAmount,
			source: `HealingCrystal:${part.Name}`,
		});

		// Optional: Visual effect here (particles, sound, etc.)
		print(`Healing crystal ${part.Name} used by ${player.Name} for ${healAmount} healing`);
	}
}

// Export singleton instance (disabled by default)
export const HealingCrystalInstance = new HealingCrystalCollectionItem();
