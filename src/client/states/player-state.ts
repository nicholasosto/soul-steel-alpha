import Fusion, { Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { ResourceStateMap } from "shared/catalogs/resources-catalog";
import { DataRemotes } from "shared/network/data-remotes";

class PlayerState {
	private player: Player = Players.LocalPlayer;
	public resourceStateMap?: ResourceStateMap;
	constructor(playerData: ResourceStateMap) {
		this.resourceStateMap = playerData;
		print("PlayerState initialized for", this.player.Name, "with resources:", this.resourceStateMap);
	}
}

DataRemotes.Client.Get("GET_PLAYER_DATA")
	.CallServerAsync()
	.then((playerData) => {
		if (playerData) {
			const playerState = new PlayerState(playerData);
		}
	});
