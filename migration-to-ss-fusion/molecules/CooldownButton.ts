/**
 * @file CooldownButton.ts
 * @module CooldownButton
 * @layer Client/UI/Molecules
 * @description A button component with integrated cooldown timer and progress visualization.
 *
 * Combines an IconButton with a ProgressBar to create a complete cooldown system
 * suitable for abilities, actions, or any time-based interactions.
 *
 * @example
 * // Basic cooldown button
 * const button = CooldownButton({
 *   icon: "rbxassetid://123456789",
 *   cooldown: 5, // 5 seconds
 *   onClick: () => castSpell()
 * });
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { ProgressBar } from "@trembus/ss-fusion";
import Fusion, { Value, New, Computed, OnEvent, Children, Observer } from "@rbxts/fusion";

// Simple vertical layout helper
function VerticalLayout(spacing: number = 0) {
	return New("UIListLayout")({
		FillDirection: Enum.FillDirection.Vertical,
		HorizontalAlignment: Enum.HorizontalAlignment.Center,
		VerticalAlignment: Enum.VerticalAlignment.Top,
		Padding: new UDim(0, spacing),
	});
}

export interface CooldownButtonProps extends Fusion.PropertyTable<Frame> {
	/** Icon asset ID to display */
	icon: string;

	/** Cooldown duration in seconds */
	cooldown: number;

	/** Button size variant */
	size?: "small" | "medium" | "large";

	/** Click handler */
	onClick?: () => void;

	/** Hover handler */
	onHover?: () => void;
}
export function CooldownButton(props: CooldownButtonProps) {
	/* -------- Values -------- */
	const cooldownRemaining = Value(0);
	const isHovered = Value(false);
	const cooldownProgressValue = Value(0); // For ProgressBar compatibility

	/* ---- Computed Helpers ---- */
	// Cooldown progress (0-1)
	const cooldownProgress = Computed(() => cooldownRemaining.get() / props.cooldown);
	// Is the button currently on cooldown?
	const isOnCooldown = Computed(() => cooldownProgress.get() > 0);
	// Cooldown text showing remaining time
	const cooldownText = Computed(() => `${math.ceil(cooldownRemaining.get())}s`);

	// Update progress value when cooldown changes using Observer
	const progressObserver = Observer(cooldownProgress);
	progressObserver.onChange(() => {
		cooldownProgressValue.set(cooldownProgress.get());
	});

	/* ---- Functions ---- */
	function startCooldown() {
		cooldownRemaining.set(props.cooldown);
		const interval = 0.1; // Update every 100ms
		const taskId = task.spawn(() => {
			while (cooldownRemaining.get() > 0) {
				task.wait(interval);
				cooldownRemaining.set(math.max(0, cooldownRemaining.get() - interval));
			}
		});
		return taskId;
	}

	// Size configuration
	const buttonSize =
		props.size === "large"
			? UDim2.fromOffset(80, 100)
			: props.size === "small"
				? UDim2.fromOffset(40, 50)
				: UDim2.fromOffset(60, 75); // medium default

	// Main button with icon (simplified without external IconButton)
	const button = New("ImageButton")({
		Name: props.Name ?? "CooldownButton_Icon",
		Size: new UDim2(1, 0, 0.8, 0),
		Image: props.icon,
		BackgroundTransparency: 1,
		[OnEvent("Activated")]: () => {
			if (isOnCooldown.get()) {
				print("Button is on cooldown, cannot click.");
				return;
			}
			props.onClick?.();
			startCooldown();
		},
		[Children]: {
			AspectRatio: New("UIAspectRatioConstraint")({
				AspectRatio: 1,
			}),
		},
	});

	// Cooldown progress bar
	const cooldownBar = ProgressBar({
		Name: "CooldownProgressBar",
		Size: new UDim2(1, 0, 0.2, 0),
		currentValue: cooldownProgressValue, // Use Value instead of Computed
		maxValue: Value(1),
		fillColor: Color3.fromRGB(255, 100, 100),
		showLabel: true,
		labelText: cooldownText,
	});

	return New("Frame")({
		Name: `${props.Name ?? "CooldownButton"}`,
		Size: props.Size ?? buttonSize,
		ZIndex: props.ZIndex ?? 1,
		BackgroundTransparency: 1,
		[OnEvent("MouseEnter")]: () => {
			isHovered.set(true);
			props.onHover?.();
		},
		[OnEvent("MouseLeave")]: () => isHovered.set(false),
		[Children]: [VerticalLayout(2), button, cooldownBar],
	});
}
