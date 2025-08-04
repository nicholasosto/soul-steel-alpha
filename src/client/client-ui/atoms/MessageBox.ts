import { Children, Computed, New } from "@rbxts/fusion";
import { MessageState } from "client/states/message-state";
import { SliceImageFrame } from "./SliceImageFrame";

/**
 * Creates a reactive message box UI component that displays temporary messages to the player.
 *
 * The MessageBox is a centered overlay that shows messages with different color coding based on message type.
 * It uses Fusion's reactive state system to automatically update visibility and content when the message state changes.
 *
 * @param messageState - The reactive message state containing message content, type, and visibility
 * @returns A Frame instance containing the message box UI
 *
 * @example
 * ```typescript
 * const messageState = new MessageState();
 * const messageBox = MessageBox(messageState);
 * messageBox.Parent = playerGui.ScreenGui;
 * ```
 *
 * @remarks
 * - Automatically handles message type color coding (error: red, warning: orange, info: blue, default: white)
 * - Uses SliceImageFrame for consistent visual styling
 * - Positioned at screen center (35% from left, 45% from top)
 * - Takes up 30% screen width and 10% screen height
 * - Text is automatically scaled and wrapped for readability
 */
export const MessageBox = (messageState: MessageState) => {
	// Create the text label that displays the message content with dynamic styling
	const Label = New("TextLabel")({
		Name: "MessageLabel",
		Size: new UDim2(1, 0, 1, 0),
		BackgroundTransparency: 1,
		Text: Computed(() => messageState.message.get()),
		// Dynamic text color based on message type for visual categorization
		TextColor3: Computed(() => {
			switch (messageState.messageType.get()) {
				case "error":
					return Color3.fromRGB(255, 0, 0); // Red for errors
				case "warning":
					return Color3.fromRGB(255, 165, 0); // Orange for warnings
				case "info":
					return Color3.fromRGB(0, 0, 255); // Blue for info
				default:
					return Color3.fromRGB(255, 255, 255); // White for default
			}
		}),
		TextScaled: true,
		TextWrapped: true,
		TextXAlignment: Enum.TextXAlignment.Center,
		TextYAlignment: Enum.TextYAlignment.Center,
	});

	// Main container frame with centered positioning and background styling
	const messageFrame = New("Frame")({
		Name: "MessageBox",
		Size: new UDim2(0.3, 0, 0.1, 0), // 30% width, 10% height
		Position: new UDim2(0.35, 0, 0.45, 0), // Centered on screen
		BackgroundColor3: Color3.fromRGB(50, 50, 50), // Dark gray background
		BorderSizePixel: 0,
		Visible: Computed(() => messageState.isVisible.get()), // Reactive visibility
		[Children]: {
			SliceImage: SliceImageFrame(), // Decorative border/styling
			Label,
		},
	});

	return messageFrame;
};
