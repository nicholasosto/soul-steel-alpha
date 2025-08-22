import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import { MessageType } from "shared/types";

export const MessageRemotes = Definitions.Create({
	[SIGNAL_KEYS.MESSAGE_SEND]: Definitions.ServerToClientEvent<[message: MessageType]>(),
});
