import { Definitions } from "@rbxts/net";
import { SIGNAL_KEYS } from "shared/keys";
import type { HotkeyBindingsDTO } from "shared";

export const ControlsRemotes = Definitions.Create({
	/** Load the player's saved hotkey bindings. Returns undefined if no profile yet. */
	[SIGNAL_KEYS.HOTKEY_LOAD]: Definitions.ServerAsyncFunction<() => HotkeyBindingsDTO | undefined>(),
	/** Save the player's hotkey bindings to their profile. Returns true on success. */
	[SIGNAL_KEYS.HOTKEY_SAVE]: Definitions.ServerAsyncFunction<(bindings: HotkeyBindingsDTO) => boolean>(),
});
