import { MessageRemotes } from "shared/network";
import Fusion, { Children, New, OnEvent, Value } from "@rbxts/fusion";
import { SIGNAL_KEYS } from "shared";

const Remotes = {
	SendMessageToPlayer: MessageRemotes.Client.Get(SIGNAL_KEYS.MESSAGE_SEND),
};

export class MessageState {
	private static instance?: MessageState;
	public readonly message = Value<string>("");
	public readonly isVisible = Value(false);
	public readonly messageType = Value("info");
	constructor() {
		if (MessageState.instance) {
			return MessageState.instance;
		}
		MessageState.instance = this;
		this.initialize();
	}
	private initialize() {
		const svc = MessageState.instance;
		Remotes.SendMessageToPlayer.Connect((message) => {
			this.message.set(message.content);
			this.isVisible.set(true);
			this.messageType.set(message.severity);
			task.delay(1, () => {
				this.isVisible.set(false);
			});
		});
	}
}

export const MessageStateInstance = new MessageState();
