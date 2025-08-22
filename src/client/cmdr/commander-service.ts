/**
 * Minimal Cmdr client bootstrap (ModuleScript)
 */
import { CmdrClient } from "@rbxts/cmdr";
import { RunService } from "@rbxts/services";

const ClientCmdrBootstrap = {
	Initialize() {
		CmdrClient.SetEnabled(RunService.IsStudio());
		// Allow multiple keys to open Cmdr to avoid conflicts with UI bindings
		CmdrClient.SetActivationKeys([Enum.KeyCode.Backquote, Enum.KeyCode.Semicolon, Enum.KeyCode.F1]);
		CmdrClient.SetActivationUnlocksMouse(false);
		CmdrClient.SetPlaceName("Soul Steel Alpha");
	},
};

export = ClientCmdrBootstrap;
