import { MessageRemotes } from "shared/network";

const SendMessageToPlayerRemote = MessageRemotes.Client.Get("SendMessageToPlayer");

SendMessageToPlayerRemote.Connect((message) => {
	// Handle the message received from the server
	print(`Received message: [${message.severity ?? "info"}] ${message.content}`);
	// You can add additional logic here to display the message in the UI or log it
});

print("Message client initialized successfully");
