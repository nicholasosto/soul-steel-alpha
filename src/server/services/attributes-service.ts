/**
 * @file src/server/services/attributes-service.ts
 * @module AttributesService
 * @layer Server/Services
 * @description Authoritative attribute management; emits AttributesUpdated and syncs clients.
 */

import { Players } from "@rbxts/services";
import { AttributeDTO, AttributeKey, makeDefaultAttributeDTO } from "shared/catalogs/attribute-catalog";
import { AttributeRemotes } from "shared/network/attribute-remotes";
import { SIGNAL_KEYS } from "shared/keys";
import { DataServiceInstance } from "./data/data-service";
import { SignalServiceInstance } from "./signal-service";

const SendAttributesUpdated = AttributeRemotes.Server.Get(SIGNAL_KEYS.ATTRIBUTES_UPDATED);

export class AttributesService {
	private static instance?: AttributesService;

	public static getInstance(): AttributesService {
		if (AttributesService.instance === undefined) {
			AttributesService.instance = new AttributesService();
		}
		return AttributesService.instance;
	}

	private constructor() {
		this.initialize();
	}

	private initialize(): void {
		// On player join, push current attributes to client and emit AttributesUpdated fact
		Players.PlayerAdded.Connect((player) => {
			const profile = DataServiceInstance.GetProfile(player);
			if (profile === undefined) return;
			const attributes: AttributeDTO = profile.Data.Attributes ?? makeDefaultAttributeDTO();
			// Emit server-side fact for downstream consumers (e.g., ResourceService)
			SignalServiceInstance.emit("AttributesUpdated", { player, attributes });
			// Sync to client
			SendAttributesUpdated.SendToPlayer(player, attributes);
		});
	}

	/**
	 * Modify a single attribute by delta. Returns true on success.
	 */
	public ModifyAttribute(player: Player, key: AttributeKey, delta: number): boolean {
		const profile = DataServiceInstance.GetProfile(player);
		if (profile === undefined) return false;
		const attrs = profile.Data.Attributes;
		if (attrs === undefined) return false;

		const prev = attrs[key] as number; // All keys initialized in defaults
		const nextKey = prev + delta;
		// Optional clamping policy could live here; keeping open-ended for now
		attrs[key] = nextKey;

		// Emit server fact and push to client
		SignalServiceInstance.emit("AttributesUpdated", { player, attributes: attrs, changed: key });
		SendAttributesUpdated.SendToPlayer(player, attrs);
		return true;
	}
}

export const AttributesServiceInstance = AttributesService.getInstance();

// Wire network callbacks here (kept at bottom to ensure instance exists)
AttributeRemotes.Server.Get("ModifyAttribute").SetCallback((player, attributeType, amount) => {
	// Explicit undefined checks done inside service
	return AttributesServiceInstance.ModifyAttribute(player, attributeType, amount);
});
