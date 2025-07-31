import { Definitions } from "@rbxts/net";
import { MessageType } from "shared/types";

export const MessageRemotes = Definitions.Create({
	SendMessageToPlayer: Definitions.ServerToClientEvent<[message: MessageType]>(),
});
