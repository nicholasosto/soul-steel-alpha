import { IconButton, ProgressBar } from "../../atoms";
import Fusion, { Value, New, Computed, OnEvent, Children } from "@rbxts/fusion";
import { VerticalLayout } from "../../helpers";
import { UI_SIZES } from "shared";

export interface CooldownButtonProps extends Fusion.PropertyTable<Frame> {
	icon: string; // Icon asset ID
	cooldown: number; // Cooldown duration in seconds
	onClick?: () => void; // Click handler
	onHover?: () => void; // Optional hover handler
}
export function CooldownButton(props: CooldownButtonProps) {
	/* -------- Values -------- */
	const cooldownRemaining = Value(0);
	const isHovered = Value(false);

	/* ---- Computed Helpers ---- */
	// Cooldown progress (0-1)
	const cooldownProgress = Computed(() => cooldownRemaining.get() / props.cooldown);
	// Is the button currently on cooldown?
	const isOnCooldown = Computed(() => cooldownProgress.get() > 0);
	// Cooldown text showing remaining time
	const cooldownText = Computed(() => `${math.ceil(cooldownRemaining.get())}s`);

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

	// Main button with icon
	const button = IconButton({
		Name: props.Name ?? "CooldownButton",
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: props.Position ?? new UDim2(0.5, 0, 0.5, 0), // Centered by default
		Size: new UDim2(1, 0, 0.8, 0),
		icon: props.icon,
		onClick: () => {
			if (isOnCooldown.get()) {
				print("Button is on cooldown, cannot click.");
				return; // Prevent action if on cooldown
			}
			props.onClick?.(); // Call the click handler if provided
			startCooldown(); // Start the cooldown
		},
	});

	// Cooldown progress bar
	const cooldownBar = ProgressBar({
		Name: "CooldownProgressBar",
		Size: new UDim2(1, 0, 0.2, 0), // Fill the bottom part of the button
		progress: cooldownProgress,
		fillColor: Color3.fromRGB(255, 100, 100), // Red for cooldown
		showLabel: true,
		labelText: cooldownText,
		labelColor: Color3.fromRGB(255, 255, 255),
	});

	return New("Frame")({
		Name: `${props.Name ?? "CooldownButton"}`,
		Size: UI_SIZES.BUTTON_COOLDOWN,
		ZIndex: props.ZIndex ?? 1,
		BackgroundTransparency: 1, // Transparent background
		[OnEvent("MouseEnter")]: () => {
			isHovered.set(true);
			props.onHover?.(); // Call hover handler if provided
		},
		[OnEvent("MouseLeave")]: () => isHovered.set(false),
		[Children]: [VerticalLayout(2), button, cooldownBar],
	});
}
