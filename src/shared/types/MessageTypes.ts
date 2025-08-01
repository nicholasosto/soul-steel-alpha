/**
 * @file src/shared/definitions/Message.ts
 * @module MessageDefinitions
 * @owner Trembus
 * @since 0.2.0
 * @lastUpdate 2025-07-12
 * @remarks
 * Defines the structure for messages used in the game, including types and utility functions.
 */

import { HttpService } from "@rbxts/services";

export const SEVERITY_KEYS = ["info", "warning", "error", "success", "prompt"] as const;
export type SeverityKey = (typeof SEVERITY_KEYS)[number];

/*──── Types ──────────────────────────────────────────────────────────*/
export interface MessageType {
	/* -- DTO -- */
	id: string;
	timestamp: number;
	title: string; // Optional title for the message
	content: string; // #TODO Replace with combined types of message content
	/* -- Metadata -- */
	severity: SeverityKey; // Use SeverityKey type
	textColor: Color3; // Optional text color for the message
}

export type MessageMeta = Omit<MessageType, "id" | "timestamp" | "content" | "title">;

export const MessageMetaRecord: Record<SeverityKey, MessageMeta> = {
	info: {
		severity: "info",
		textColor: new Color3(0.2, 0.6, 0.8),
	},
	warning: {
		severity: "warning",
		textColor: new Color3(0.8, 0.6, 0.2),
	},
	error: {
		severity: "error",
		textColor: new Color3(0.8, 0.2, 0.2),
	},
	success: {
		severity: "success",
		textColor: new Color3(0.2, 0.8, 0.2),
	},
	prompt: {
		severity: "prompt",
		textColor: new Color3(0.2, 0.2, 0.8),
	},
};

export function createMessage(
	title: string,
	content: string,
	severity: SeverityKey = "info",
	textColor?: Color3,
): MessageType {
	return {
		id: HttpService.GenerateGUID(),
		timestamp: os.time(),
		title,
		content,
		severity,
		textColor: textColor ?? MessageMetaRecord[severity].textColor,
	};
}

export const MessageLibrary: Record<string, MessageType> = {
	DataLoadedSuccess: createMessage("Data Loaded", "Your game data has been successfully loaded.", "success"),
	PlayerDataLoadedSuccess: createMessage(
		"Player Data Loaded",
		"Your player data has been successfully loaded.",
		"success",
	),
	ProfileUpdateSuccess: createMessage("Profile Updated", "Your profile has been successfully updated.", "success"),
	ProfileUpdateError: createMessage(
		"Profile Update Error",
		"An error occurred while updating your profile. Please try again later.",
		"error",
	),
	InvalidProfileData: createMessage(
		"Invalid Profile Data",
		"Your profile data is invalid or corrupted. Please contact support.",
		"error",
	),
	NetworkError: createMessage(
		"Network Error",
		"An error occurred while communicating with the server. Please check your internet connection.",
		"error",
	),
	AbilityOnCooldown: createMessage(
		"Ability On Cooldown",
		"Your ability is currently on cooldown. Please wait before using it again.",
		"warning",
	),
	AbilityUnlocked: createMessage("Ability Unlocked", "Congratulations! You have unlocked a new ability.", "success"),
	LevelUp: createMessage("Level Up", "Congratulations! You have leveled up.", "success"),
	InsufficientResources: createMessage(
		"Insufficient Resources",
		"You do not have enough resources to perform this action.",
		"error",
	),
	InvalidAction: createMessage("Invalid Action", "The action you attempted is invalid or not allowed.", "error"),
};
