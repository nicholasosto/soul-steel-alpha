/// <reference types="@rbxts/types" />
/**
 * Data service for managing persistant data using @rbxts/profileservice.
 *
 * This service is responsible for loading, saving, and managing player profiles.
 * It handles the initialization of profiles, data retrieval, and persistence.
 * @module DataService
 **/

import ProfileService from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { Players } from "@rbxts/services";

export interface PlayerProfileData {
	level: number;
	experience: number;
	Attributes: {
		vitality: number;
		intellect: number;
		strength: number;
		agility: number;
		luck: number;
	};
	Abilities: {
		[Melee: string]: boolean;
		["Ice-Rain"]: boolean;
	};
}
const DefaultData: PlayerProfileData = {
	level: 1,
	experience: 0,
	Attributes: {
		vitality: 10,
		intellect: 10,
		strength: 10,
		agility: 10,
		luck: 10,
	},
	Abilities: {
		Melee: true,
		"Ice-Rain": false,
	},
};

// Datastore Name
const DATASTORE_NAME = "A_SoulSteelPlayerProfile";

class DataService {
	private static instance?: DataService;
	private _profileStore = ProfileService.GetProfileStore(DATASTORE_NAME, DefaultData);
	private profiles: Map<Player, Profile<PlayerProfileData>> = new Map();

	private constructor() {
		this._initConnections();
	}

	public static Start(): DataService {
		if (DataService.instance === undefined) {
			DataService.instance = new DataService();
		}
		return DataService.instance;
	}

	private _initConnections() {
		Players.PlayerAdded.Connect((player) => {
			this.handlePlayerAdded(player);
		});
		Players.PlayerRemoving.Connect((player) => {
			this.handlePlayerRemoving(player);
		});
	}

	private handlePlayerAdded(player: Player) {
		const svc = DataService.Start();
		if (svc.profiles.has(player)) {
			warn(`Profile for player ${player.Name} already exists.`);
			return;
		}
		warn(`Creating profile for player ${player.Name}`);
		// Create a new profile for the player
		if (!this._profileStore) {
			warn("Profile store is not initialized.");
			return;
		}

		const profile = this._profileStore.LoadProfileAsync(tostring(player.UserId), "ForceLoad");
		print(`Profile for player ${player.Name} loaded:`, profile);
		profile?.Reconcile();
		profile?.ListenToRelease((releasedProfile) => {
			if (releasedProfile) {
				warn(`Profile for player ${player.Name} has been released.`);
				this.profiles.delete(player);
			}
		});
		if (profile === undefined) {
			warn(`Failed to load profile for player ${player.Name}.`);
			return;
		}
		this.profiles.set(player, profile);
	}

	private handlePlayerRemoving(player: Player) {
		const profile = this.profiles.get(player);
		if (profile) {
			this.profiles.get(player)?.Save();
			warn(`Saving profile for player ${player.Name}`);
			profile.Release();
			this.profiles.delete(player);
		}
	}
	public GetProfile(player: Player): Profile<PlayerProfileData> | undefined {
		return this.profiles.get(player);
	}
}
export const DataServiceInstance = DataService.Start();
