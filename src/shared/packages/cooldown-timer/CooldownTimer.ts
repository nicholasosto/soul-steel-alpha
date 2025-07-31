/// <reference types="@rbxts/types" />

/**
 * @file        CooldownTimer.ts
 * @module      CooldownTimer
 * @layer       Shared/Util
 * @description Simple, self-contained stop-watch for ability cool-downs.
 *
 * ╭───────────────────────────────╮
 * │  Soul Steel · Coding Guide    │
 * │  Fusion v4 · Strict TS · ECS  │
 * ╰───────────────────────────────╯
 *
 * @author       Trembus
 * @license      MIT
 * @since        0.2.2
 * @lastUpdated  2025-06-27 by Luminesa – Fix Signal import, tidy types
 *
 * @dependencies
 *   @rbxts/fusion  ^0.4.0
 *   @rbxts/maid    ^1.3.0
 *   @rbxts/signal  ^1.1.0
 */

import { RunService } from "@rbxts/services";
import Maid from "@rbxts/maid";
import Signal from "@rbxts/signal";
import { Value } from "@rbxts/fusion";

/** Fraction 1 → 0 while cooling, 0 when ready */
export type CooldownProgress = Value<number>;

export class CooldownTimer {
	/** Public reactive progress (1 → 0). Bind directly in Fusion UI. */
	public readonly Progress: CooldownProgress = Value(0);

	private readonly maid = new Maid();
	private readonly done = new Signal(); // fires with no args
	private readonly duration: number;
	private startTs = 0;

	constructor(durationSeconds: number) {
		this.duration = math.max(durationSeconds, 0);
	}

	/** Begin a fresh cool-down; auto-resets any existing one. */
	start(): void {
		print(`Starting cooldown for ${this.duration} seconds`);

		this.cancel(); // ensures only one update loop
		this.startTs = os.clock();
		this.Progress.set(1);

		const update = () => {
			const elapsed = os.clock() - this.startTs;
			const remaining = math.max(this.duration - elapsed, 0);
			this.Progress.set(remaining / this.duration);

			if (remaining === 0) {
				this.done.Fire();
				this.cancel();
			}
		};

		if (RunService.IsClient()) {
			this.maid.GiveTask(RunService.Heartbeat.Connect(update));
		} else {
			// Server: ~30 fps polling is sufficient and cheaper
			this.maid.GiveTask(
				task.spawn(() => {
					while (!this.isReady()) {
						update();
						task.wait();
					}
				}),
			);
		}
	}

	/** Abort the timer and reset to ready state (progress = 0). */
	cancel(): void {
		this.maid.DoCleaning();
		this.Progress.set(0);
	}

	/** True when the timer is idle and an ability can fire. */
	isReady(): boolean {
		return this.Progress.get() === 0;
	}

	/**
	 * Connect a one-shot callback that runs when the cool-down ends.
	 * @returns RBXScriptConnection – remember to Disconnect / maid.giveTask
	 */
	onComplete(cb: () => void): RBXScriptConnection {
		print("Connecting cooldown completion callback");
		return this.done.Connect(cb);
	}

	/** Full GC cleanup – use when the owning object is destroyed. */
	destroy(): void {
		this.cancel();
		this.done.Destroy();
	}
}
