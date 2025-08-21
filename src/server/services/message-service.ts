/**
 * @file src/server/services/MessageService.ts
 * @module MessageService
 * @owner Trembus
 * @since 0.2.0
 * @lastUpdate 2025-08-12 - Added comprehensive signal documentation
 * @remarks
 * Handles Message data construction and provides utility methods for other services.
 *
 * ## Server Signals (Inter-Service Communication)
 * - None - Pure messaging utility service with no signal dependencies
 *
 * ## Client Events (Network Communication)
 * - `SendMessageToPlayer` - Sends individual messages to specific players
 *
 * ## Roblox Events (Engine Integration)
 * - `Players.GetPlayers()` - Used for broadcasting messages to all players
 */

import { Players, RunService } from "@rbxts/services";
import { MessageType, MessageLibrary } from "shared/types";
import { MessageRemotes } from "shared/network";
import { ServiceRegistryInstance } from "./service-registry";
import { IMessageOperations } from "./service-interfaces";

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
		this.registerWithServiceRegistry();
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

	/**
	 * Register MessageService interface with ServiceRegistry for loose coupling
	 */
	private registerWithServiceRegistry(): void {
		const ops: IMessageOperations = {
			sendInfoToPlayer(player: Player, message: string) {
				MessageServiceInstance.SendInfoToPlayer(player, message);
			},
			sendWarningToPlayer(player: Player, message: string) {
				MessageServiceInstance.SendMessageToPlayer(player, {
					severity: "warning",
					content: message,
					id: "",
					timestamp: DateTime.now().UnixTimestamp,
					title: "Warning",
					textColor: new Color3(0.8, 0.6, 0.2),
				});
			},
			sendErrorToPlayer(player: Player, message: string) {
				MessageServiceInstance.SendErrorToPlayer(player, message);
			},
			sendServerWideMessage(message: string) {
				MessageServiceInstance.SendServerWideMessage({
					severity: "info",
					content: message,
					id: "",
					timestamp: DateTime.now().UnixTimestamp,
					title: "Server",
					textColor: new Color3(0.6, 0.6, 0.6),
				});
			},
		};
		ServiceRegistryInstance.registerService<IMessageOperations>("MessageOperations", ops);
	}

	private destroyInternal() {
		if (RunService.IsStudio()) warn(`${SERVICE_NAME} destroyed`);
	}
}
export const MessageServiceInstance = MessageService.getInstance();
MessageServiceInstance.SendServerWideMessage(MessageLibrary.DataLoadedSuccess);
