/**
 * @file src/client/controllers/TargetingController.ts
 * @module TargetingController
 * @layer Client/Controllers
 * @description Client-side targeting controller: hover + lock + server validation
 */

import { Players, Workspace, UserInputService, CollectionService, RunService } from "@rbxts/services";
import { PlayerStateInstance } from "client/states/player-state";
import { TargetingRemotes } from "shared/network";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";
import { TARGET_TAGS } from "shared/keys/target-keys";

export class TargetingController {
	private static instance: TargetingController | undefined;
	private debounce = 0;
	private hoverInterval = 0.12; // seconds
	private raycastParams: RaycastParams;

	private tryLockRemote = TargetingRemotes.Client.Get("TryLockTarget");
	private clearRemote = TargetingRemotes.Client.Get("ClearTarget");

	private constructor() {
		this.raycastParams = new RaycastParams();
		this.raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		const player = Players.LocalPlayer;
		const character = player.Character || player.CharacterAdded.Wait()[0];
		const ignore: Instance[] = [];
		if (character) ignore.push(character);
		const hrp = character?.FindFirstChild("HumanoidRootPart");
		if (hrp && hrp.IsA("BasePart")) ignore.push(hrp);
		this.raycastParams.FilterDescendantsInstances = ignore;

		// Periodic hover raycast
		RunService.RenderStepped.Connect((dt) => {
			this.debounce += dt;
			if (this.debounce >= this.hoverInterval) {
				this.debounce = 0;
				this.updateHoverFromMouse();
			}
		});

		// Listen for server authoritative updates (optional usage)
		TargetingRemotes.Client.Get("TargetUpdated").Connect((target?) => {
			PlayerStateInstance.target.set(target);
		});
	}

	public static getInstance(): TargetingController {
		if (!this.instance) this.instance = new TargetingController();
		return this.instance;
	}

	/** Perform a short ray from camera to mouse; set hoverTarget if hit a targetable SSEntity */
	private updateHoverFromMouse(): void {
		const cam = Workspace.CurrentCamera;
		if (!cam) return;
		const mousePos = UserInputService.GetMouseLocation();
		const ray = cam.ViewportPointToRay(mousePos.X, mousePos.Y, 0);
		const result = Workspace.Raycast(ray.Origin, ray.Direction.mul(500), this.raycastParams);
		const prev = PlayerStateInstance.hoverTarget.get();
		if (!result) {
			if (prev !== undefined) PlayerStateInstance.hoverTarget.set(undefined);
			return;
		}
		const hit = result.Instance;
		const model = hit?.FindFirstAncestorOfClass("Model");
		if (model && isSSEntity(model) && this.isTargetable(model)) {
			if (prev !== model) PlayerStateInstance.hoverTarget.set(model);
		} else if (prev !== undefined) {
			PlayerStateInstance.hoverTarget.set(undefined);
		}
	}

	/** Simple targetable check via tag or humanoid health */
	private isTargetable(model: SSEntity): boolean {
		if (!model.IsDescendantOf(Workspace)) return false;
		if (CollectionService.HasTag(model, TARGET_TAGS.TARGETABLE) !== true) return false;
		const humanoid = model.FindFirstChild("Humanoid") as Humanoid | undefined;
		return humanoid !== undefined && humanoid.Health > 0;
	}

	/** Attempt to lock current hover target; server validates */
	public async tryLockHoverTarget(): Promise<boolean> {
		const candidate = PlayerStateInstance.hoverTarget.get();
		if (candidate === undefined) return false;
		try {
			const ok = await this.tryLockRemote.CallServerAsync(candidate);
			if (ok) PlayerStateInstance.target.set(candidate);
			return ok;
		} catch (e) {
			return false;
		}
	}

	/** Force clear local and inform server */
	public async clearTarget(reason?: string): Promise<void> {
		PlayerStateInstance.target.set(undefined);
		try {
			await this.clearRemote.CallServerAsync();
		} catch (e) {
			// ignore network error on clear
		}
	}
}

export const TargetingControllerInstance = TargetingController.getInstance();
