// This file has been truncated to avoid import issues.
// It now exports nothing.

export {};
import { Players } from "@rbxts/services";
import Fusion from "@rbxts/fusion";
import { GameMenu, LoadingScreen } from "./components";
import { ProfileRemotes } from "shared/network/profile-remotes";
import { SpawnRemotes } from "shared/network/spawn-remotes";

const { New, Value } = Fusion as typeof import("@rbxts/fusion");

const MIN_DISPLAY_TIME = 0.6;
const LOADING_TIMEOUT = 20;

export function startLoader(): void {
	const player = Players.LocalPlayer;
	const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

	const rootGui = New("ScreenGui")({ Name: "LoaderUI", ResetOnSpawn: false, DisplayOrder: 100, Parent: playerGui });

	const showLoading = Value(true);
	// const showMenu = Value(false); // reserved for future UI state binding
	const isSpawning = Value(false);

	const loading = LoadingScreen({ message: "Loading profile..." });
	loading.Parent = rootGui;

	const readyTime = os.clock();
	const timeoutConn = task.delay(LOADING_TIMEOUT, () => {
		if (showLoading.get()) {
			const label = loading.FindFirstChild("Label") as TextLabel | undefined;
			if (label !== undefined) {
				label.Text = "Taking longer than expected... Please retry or rejoin.";
			}
		}
	});

	ProfileRemotes.Client.Get("PROFILE_READY").Connect((_summary) => {
		const elapsed = os.clock() - readyTime;
		const remaining = MIN_DISPLAY_TIME - elapsed;
		const toMenu = () => {
			showLoading.set(false);
			loading.Destroy();
			const menu = GameMenu({
				onPlay: async () => {
					if (isSpawning.get()) return;
					isSpawning.set(true);
					const result = await SpawnRemotes.Client.Get("REQUEST_SPAWN").CallServerAsync();
					if (result.success === true) {
						rootGui.Destroy();
					} else {
						isSpawning.set(false);
						warn(`Spawn failed: ${result.reason}`);
					}
				},
			});
			menu.Parent = rootGui;
		};
		if (remaining > 0) {
			task.delay(remaining, toMenu);
		} else {
			toMenu();
		}
	});
}
