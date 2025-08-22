/**
 * debug/echo
 * Simple echo command to verify Cmdr wiring.
 */
import { CommandDefinition } from "@rbxts/cmdr";

const Echo: CommandDefinition = {
	Name: "echo",
	Aliases: ["say"],
	Description: "Echo text back to the caller.",
	Group: "debug",
	Args: [{ Type: "string", Name: "text", Description: "Text to echo" }],
	// Server implementation is provided via default export from paired module
};

export = Echo;
