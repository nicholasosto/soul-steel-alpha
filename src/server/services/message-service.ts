/**
 * @file src/server/services/MessageService.ts
 * @module MessageService
 * @owner Trembus
 * @since 0.2.0
 * @lastUpdate 2025-07-12
 * @remarks
 * Handles Message data construction and provides utility methods for other services.
 */

import { Players, RunService } from "@rbxts/services";
import { MessageType, MessageLibrary } from "shared/types";
import { MessageRemotes } from "shared/network";

/// <reference types="@rbxts/types" />

/*──── Constants ──────────────────────────────────────────────────────*/
const SERVICE_NAME = "MessageService";

/*──── Signals ─────────────────────────────────────────────────────────*/
const SendMessageToPlayerRemote = MessageRemotes.Server.Get("SendMessageToPlayer");

/*──── Service Class ──────────────────────────────────────────────────*/
export default class MessageService {
	private static _instance?: MessageService;
	public static getInstance(): MessageService {
		if (!this._instance) this._instance = new MessageService();
		return this._instance;
	}
	public static Destroy(): void {
		this._instance?.destroyInternal();
		this._instance = undefined;
	}

	private constructor() {
		if (RunService.IsStudio()) print(`${SERVICE_NAME} started`);
	}

	/** Sends a message to a specific player. */
	public SendMessageToPlayer(player: Player, message: MessageType) {
		warn(`Message to ${player.Name}: [${message.severity ?? "info"}] ${message.content}`);
		SendMessageToPlayerRemote.SendToPlayer(player, message);
	}

	/** Sends an error message to a specific player. */
	public SendErrorToPlayer(player: Player, message: string) {
		this.SendMessageToPlayer(player, {
			severity: "error",
			content: message,
			id: "",
			timestamp: DateTime.now().UnixTimestamp,
			title: "Error",
			textColor: new Color3(0.8, 0.2, 0.2),
		});
	}

	public SendInfoToPlayer(player: Player, message: string) {
		this.SendMessageToPlayer(player, {
			severity: "info",
			content: message,
			id: "",
			timestamp: DateTime.now().UnixTimestamp,
			title: "Info",
			textColor: new Color3(0.2, 0.6, 0.8),
		});
	}

	public SendSuccessToPlayer(player: Player, message: string) {
		this.SendMessageToPlayer(player, {
			severity: "success",
			content: message,
			id: "",
			timestamp: DateTime.now().UnixTimestamp,
			title: "Success",
			textColor: new Color3(0.2, 0.8, 0.2),
		});
	}

	/** Sends a message to all connected players. */
	public SendServerWideMessage(message: MessageType) {
		for (const player of Players.GetPlayers()) {
			this.SendMessageToPlayer(player, message);
		}
	}

	private destroyInternal() {
		if (RunService.IsStudio()) warn(`${SERVICE_NAME} destroyed`);
	}
}
export const MessageServiceInstance = MessageService.getInstance();
MessageServiceInstance.SendServerWideMessage(MessageLibrary.DataLoadedSuccess);
