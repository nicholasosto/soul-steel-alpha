/**
 * Cmdr bootstrap for Soul Steel Alpha (ModuleScript)
 */
import { Cmdr } from "@rbxts/cmdr";
import { RunService } from "@rbxts/services";

export default {
	Initialize() {
		// Register default built-ins and our command folder
		Cmdr.RegisterDefaultCommands();
		const commandsFolder = script.Parent!.FindFirstChild("commands") as Folder | undefined;
		if (commandsFolder !== undefined) {
			Cmdr.RegisterCommandsIn(commandsFolder);
		}

		// Permission hook: allow debug commands only in Studio for now
		Cmdr.RegisterHook("BeforeRun", (context) => {
			const group = context.Group as unknown;
			if (group === "debug" && !RunService.IsStudio()) {
				return "Debug commands are disabled outside Studio.";
			}
			return undefined;
		});
	},
};
