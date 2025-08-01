/**
 * @file ProgressBar.ts
 * @module ProgressBar
 * @layer Client/UI/Atoms
 * @description Reusable progress bar component for health, mana, cooldowns, etc.
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import Fusion, { Children, Computed, New, Value } from "@rbxts/fusion";

export interface ProgressBarProps extends Fusion.PropertyTable<Frame> {
	/** Current progress value (0-1 for percentage, or actual value if using maxValue) */
	progress: Fusion.StateObject<number>;

	/** Maximum value for calculating percentage. If provided, progress is treated as current/max */
	maxValue?: Fusion.StateObject<number>;

	/** Color of the progress fill */
	fillColor: Color3;

	/** Direction of fill: "horizontal" | "vertical" */
	direction?: "horizontal" | "vertical";

	/** Whether to show a text label */
	showLabel?: boolean;

	/** Custom label text. If not provided, shows "current/max" or "percentage%" */
	labelText?: Fusion.StateObject<string>;

	/** Label text color */
	labelColor?: Color3;

	/** Minimum height in pixels for horizontal bars, minimum width for vertical */
	minSize?: number;

	/** Whether the bar should animate smoothly */
	animated?: boolean;
}

export function ProgressBar(props: ProgressBarProps): Frame {
	// Default values
	const direction = props.direction ?? "horizontal";
	const showLabel = props.showLabel ?? false;
	const labelColor = props.labelColor ?? Color3.fromRGB(255, 255, 255);
	const minSize = props.minSize ?? 4;
	const animated = props.animated ?? false;

	// Calculate fill percentage
	const fillPercentage = Computed(() => {
		const progress = props.progress.get();
		const maxValue = props.maxValue?.get();

		if (maxValue !== undefined) {
			// Progress is actual value, calculate percentage
			return maxValue > 0 ? math.clamp(progress / maxValue, 0, 1) : 0;
		} else {
			// Progress is already a percentage (0-1)
			return math.clamp(progress, 0, 1);
		}
	});

	// Calculate fill size based on direction
	const fillSize = Computed(() => {
		const percentage = fillPercentage.get();

		if (direction === "horizontal") {
			return new UDim2(percentage, 0, 1, 0);
		} else {
			// Vertical - fill from bottom up
			return new UDim2(1, 0, percentage, 0);
		}
	});

	// Calculate fill position for vertical bars (anchor to bottom)
	const fillPosition = Computed(() => {
		if (direction === "vertical") {
			const percentage = fillPercentage.get();
			return new UDim2(0, 0, 1 - percentage, 0);
		} else {
			return new UDim2(0, 0, 0, 0);
		}
	});

	// Generate label text
	const displayText = Computed(() => {
		if (props.labelText) {
			return props.labelText.get();
		}

		const progress = props.progress.get();
		const maxValue = props.maxValue?.get();

		if (maxValue !== undefined) {
			// Show current/max format
			return `${math.floor(progress)}/${math.floor(maxValue)}`;
		} else {
			// Show percentage format
			const percentage = math.floor(fillPercentage.get() * 100);
			return `${percentage}%`;
		}
	});

	// Create the progress bar components
	const children: { [key: string]: Instance } = {};

	// Background fill
	children.Background = New("Frame")({
		Name: "Background",
		Size: new UDim2(1, 0, 1, 0),
		BackgroundColor3: Color3.fromRGB(20, 20, 20),
		BorderSizePixel: 0,
	});

	// Progress fill
	children.Fill = New("Frame")({
		Name: "Fill",
		Size: fillSize,
		Position: fillPosition,
		BackgroundColor3: props.fillColor,
		BorderSizePixel: 0,
		ZIndex: 2,
	});

	// Add label if requested
	if (showLabel) {
		children.Label = New("TextLabel")({
			Name: "ResourceLabel",
			BackgroundTransparency: 1,
			Text: displayText,
			TextColor3: labelColor,
			TextScaled: true,
			TextStrokeTransparency: 0,
			TextStrokeColor3: Color3.fromRGB(0, 0, 0),
			Size: new UDim2(1, 0, 1, 0),
			Font: Enum.Font.GothamBold,
			ZIndex: 3,
		});
	}

	return New("Frame")({
		Name: props.Name ?? "ProgressBar",
		Size: props.Size ?? new UDim2(1, 0, 0, minSize),
		Position: props.Position,
		AnchorPoint: props.AnchorPoint,
		BackgroundColor3: props.BackgroundColor3 ?? Color3.fromRGB(40, 40, 40),
		BorderColor3: props.BorderColor3 ?? Color3.fromRGB(100, 100, 100),
		ZIndex: props.ZIndex,

		[Children]: children,
	});
}
