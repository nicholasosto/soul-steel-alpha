import { Players } from "@rbxts/services";
import { New, Value } from "@rbxts/fusion";
// Import directly to avoid executing all exports in screens/index (which may import heavier UI)
import { LoadingScreen } from "./screens/LoadingScreen";
import { GameMenu } from "./screens/GameMenu";
import { ProfileRemotes } from "shared/network/profile-remotes";
import { SpawnRemotes } from "shared/network/spawn-remotes";
import { DataRemotes } from "shared/network/data-remotes";

const MIN_DISPLAY_TIME = 0.6;
const LOADING_TIMEOUT = 20;

export function startLoader(): void {
	const player = Players.LocalPlayer;
	print("[Loader] startLoader() called for", player.Name);

	// Subscribe before any yields to avoid missing early server event
	let profileReady = false;
	const readyCallbacks: Array<() => void> = [];
	const readyTime = os.clock();
	print("[Loader] Subscribing to PROFILE_READY (pre-yield)");
	ProfileRemotes.Client.Get("PROFILE_READY").Connect((_summary) => {
		print("[Loader] PROFILE_READY received");
		profileReady = true;
		for (const cb of readyCallbacks) cb();
	});

	// Fallback: poll server once for data if event was missed
	spawn(async () => {
		print("[Loader] Fallback GET_PLAYER_DATA check scheduling");
		try {
			const data = await DataRemotes.Client.Get("GET_PLAYER_DATA").CallServerAsync();
			if (data !== undefined) {
				print("[Loader] Fallback GET_PLAYER_DATA indicates ready");
				profileReady = true;
				for (const cb of readyCallbacks) cb();
			}
		} catch (err) {
			warn("[Loader] Fallback GET_PLAYER_DATA failed:", err);
		}
	});

	// Now mount UI (may yield)
	const playerGui =
		(player.FindFirstChild("PlayerGui") as PlayerGui) ?? (player.WaitForChild("PlayerGui") as PlayerGui);
	const rootGui = New("ScreenGui")({
		Name: "LoaderUI",
		ResetOnSpawn: false,
		DisplayOrder: 100,
		IgnoreGuiInset: true,
		Parent: playerGui,
	});

	const showLoading = Value(true);
	// const showMenu = Value(false);
	const isSpawning = Value(false);

	const loading = LoadingScreen({ message: "Loading profile..." });
	loading.Parent = rootGui;
	print("[Loader] LoadingScreen mounted");

	const _timeoutConn = task.delay(LOADING_TIMEOUT, () => {
		if (showLoading.get()) {
			const label = loading.FindFirstChild("Label") as TextLabel | undefined;
			if (label !== undefined) {
				label.Text = "Taking longer than expected... Please retry or rejoin.";
			}
		}
	});

	const handleReady = () => {
		print("[Loader] handleReady invoked");
		const elapsed = os.clock() - readyTime;
		const remaining = MIN_DISPLAY_TIME - elapsed;
		const toMenu = () => {
			print("[Loader] Transition to GameMenu");
			if (showLoading.get() === true && loading.Parent !== undefined) {
				showLoading.set(false);
				loading.Destroy();
			}
			const menu = GameMenu({
				onPlay: async () => {
					print("[Loader] Play clicked; sending REQUEST_SPAWN");
					if (isSpawning.get()) return;
					isSpawning.set(true);
					const result = await SpawnRemotes.Client.Get("REQUEST_SPAWN").CallServerAsync();
					if (result.success === true) {
						print("[Loader] Spawn success; destroying LoaderUI");
						rootGui.Destroy();
					} else {
						print(`[Loader] Spawn failed: ${result.reason}`);
						isSpawning.set(false);
					}
				},
			});
			menu.Parent = rootGui;
		};
		if (remaining > 0) {
			print(`[Loader] Enforcing MIN_DISPLAY_TIME (${remaining}s remaining)`);
			task.delay(remaining, toMenu);
		} else {
			print("[Loader] MIN_DISPLAY_TIME already satisfied; showing menu immediately");
			toMenu();
		}
	};

	if (profileReady) {
		handleReady();
	} else {
		readyCallbacks.push(handleReady);
	}
}
