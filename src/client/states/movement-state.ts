import Fusion, { Computed, New, Observer, Value } from "@rbxts/fusion";

const MAX_DOUBLE_JUMP_COUNT = 3;

export const PlayerMovementState = {
	jumpCount: Value(0),
};

const jumpCountObserver = Observer(PlayerMovementState.jumpCount);

jumpCountObserver.onChange(() => {
	const latestJumpCount = PlayerMovementState.jumpCount.get();
	print(`Current jump count: ${latestJumpCount}`);
});
