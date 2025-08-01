import Fusion, { Computed, New, Observer, Value } from "@rbxts/fusion";
import { Debris, Players, UserInputService } from "@rbxts/services";

const LocalPlayer = Players.LocalPlayer;

const MAX_DOUBLE_JUMP_COUNT = 3;
const DEFAULT_SPEED = 20;
const RUNNING_SPEED = 40;

export class PlayerMovementState {
	private static instance?: PlayerMovementState;
	public DoubleJumpCount = Value(0);
	public Running = Value(false);
	private onRunning?: Observer;

	private constructor() {
		print("Player Movement State Created");
	}

	private _initializeObservers() {
		Observer(this.Running).onChange(() => {
			const character = LocalPlayer.Character;
			const humanoid = character?.FindFirstChildOfClass("Humanoid");
			if (humanoid === undefined) return;
			if (this.Running.get() === true) {
				humanoid.WalkSpeed = RUNNING_SPEED;
			} else {
				humanoid.WalkSpeed = DEFAULT_SPEED;
			}
		});
	}
	public static CreateMovementState(): PlayerMovementState {
		if (this.instance === undefined) {
			this.instance = new PlayerMovementState();
			return this.instance;
		} else {
			return this.instance;
		}
	}
}
