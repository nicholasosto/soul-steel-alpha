/**
 * DEPRECATED: Use SlicedImage from @trembus/ss-fusion instead.
 * This file is kept temporarily for reference and will be removed.
 */
import Fusion, { New } from "@rbxts/fusion";
const AssetId = "rbxassetid://80375133768026";

export function SliceImageFrame() {
	const image = New("ImageLabel")({
		Name: "SliceImage",
		Size: new UDim2(1, 0, 1, 0),
		BackgroundTransparency: 1,
		Image: AssetId,
		SliceCenter: new Rect(130, 130, 130, 130),
		SliceScale: 0.5,
		ScaleType: Enum.ScaleType.Slice,
		ZIndex: 100,
	});

	return image;
}
