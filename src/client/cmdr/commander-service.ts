/**
 * Minimal Cmdr client bootstrap (ModuleScript)
 */
import { CmdrClient } from "@rbxts/cmdr";
import { RunService } from "@rbxts/services";

const ClientCmdrBootstrap = {
	Initialize() {
		CmdrClient.SetEnabled(RunService.IsStudio());
		CmdrClient.SetActivationKeys([Enum.KeyCode.Backquote]);
		CmdrClient.SetActivationUnlocksMouse(false);
		CmdrClient.SetPlaceName("Soul Steel Alpha");
	},
};

export = ClientCmdrBootstrap;
