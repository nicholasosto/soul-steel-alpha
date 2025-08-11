/**
 * @file src/server/services/targeting-service.ts
 * @module TargetingService
 * @layer Server/Services
 * @description Authoritative validation for player target locking.
 */

import { Players, CollectionService, Workspace } from "@rbxts/services";
import { TargetingRemotes } from "shared/network";
import { SSEntity } from "shared/types";
import { TARGET_TAGS } from "shared/keys/target-keys";

class TargetingService {
	private static instance: TargetingService | undefined;
	private perPlayerTarget = new Map<Player, SSEntity | undefined>();
	private lastRequestAt = new Map<Player, number>();
	private WINDOW = 0.1; // rate limit seconds

	public static getInstance(): TargetingService {
		if (!this.instance) this.instance = new TargetingService();
		return this.instance;
	}

	private constructor() {
		// Handle client requests
		TargetingRemotes.Server.Get("TryLockTarget").SetCallback((player, entity) => {
			if (!this.rateOk(player)) return false;
			if (!this.isValidTargetForPlayer(player, entity)) return false;
			this.perPlayerTarget.set(player, entity);
			TargetingRemotes.Server.Get("TargetUpdated").SendToPlayer(player, entity);
			return true;
		});

		TargetingRemotes.Server.Get("ClearTarget").SetCallback((player) => {
			this.perPlayerTarget.set(player, undefined);
			TargetingRemotes.Server.Get("TargetUpdated").SendToPlayer(player, undefined);
			return true;
		});

		// cleanup
		Players.PlayerRemoving.Connect((p) => this.perPlayerTarget.delete(p));
	}

	private rateOk(player: Player): boolean {
		const now = time();
		const last = this.lastRequestAt.get(player);
		if (last !== undefined && now - last < this.WINDOW) return false;
		this.lastRequestAt.set(player, now);
		return true;
	}

	private isValidTargetForPlayer(player: Player, entity: SSEntity): boolean {
		// Basic existence and ancestry checks
		if (!entity || !entity.IsDescendantOf(Workspace)) return false;
		const humanoid = entity.FindFirstChild("Humanoid") as Humanoid | undefined;
		const hrp = entity.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (!humanoid || !hrp) return false;
		if (humanoid.Health <= 0) return false;
		if (!CollectionService.HasTag(entity, TARGET_TAGS.TARGETABLE)) return false;

		// Player character
		const char = player.Character as Model | undefined;
		const chrHrp = char?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (!char || !chrHrp) return false;

		// Prevent self-targeting
		if (char === entity) return false;

		// Range check
		const dist = chrHrp.Position.sub(hrp.Position).Magnitude;
		if (dist > 150) return false;

		return true;
	}

	public getTarget(player: Player): SSEntity | undefined {
		return this.perPlayerTarget.get(player);
	}
}

export const TargetingServiceInstance = TargetingService.getInstance();
