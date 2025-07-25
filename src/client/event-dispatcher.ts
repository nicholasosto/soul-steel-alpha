import { AbilityKey, SignalKey } from "shared/keys";
import { AbilityRemotes } from "shared/network";
const Activate = AbilityRemotes.Client.Get("ABILITY_ACTIVATE");

export function ServerFunction(signalName: SignalKey, payload?: unknown) {
	switch (signalName) {
		case "ABILITY_ACTIVATE": {
			AbilityRemotes.Client.Get(signalName).CallServerAsync(payload as AbilityKey);
			break;
		}
		default: {
			warn(`ServerFunction: Unknown signal name ${signalName}`);
			break;
		}
	}
}
