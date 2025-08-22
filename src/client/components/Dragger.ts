import Fusion, { Computed, New, StateObject } from "@rbxts/fusion";

export const Dragger = (targetInstance?: Fusion.CanBeState<Instance>) => {
	const dragDetector = New("UIDragDetector")({
		Enabled: true,
	});

	const dragWatcher = Computed(() => {
		print(dragDetector.DragUDim2.X, dragDetector.DragUDim2.Y);
		print(targetInstance);
	});

	return dragDetector;
};
