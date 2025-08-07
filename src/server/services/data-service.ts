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
import { makeDefaultAbilityDTO, PersistantPlayerData } from "shared";
import { DataRemotes } from "shared/network/data-remotes";

/* Remotes */
DataRemotes.Server.Get("GET_PLAYER_DATA").SetCallback((player) => {
	const profile = DataServiceInstance.GetProfile(player);
	if (profile !== undefined) {
		const persistantData = profile.Data as PersistantPlayerData;
		return persistantData || undefined;
	} else {
		warn(`No profile found for player ${player.Name} when requesting data.`);
		return undefined;
	}
});

const DefaultData: PersistantPlayerData = {
	Level: 1,
	Abilities: makeDefaultAbilityDTO(),
};

// Datastore Name
const DATASTORE_NAME = "A_SoulSteelPlayerProfile";

class DataService {
	private static instance?: DataService;
	private _profileStore = ProfileService.GetProfileStore(DATASTORE_NAME, DefaultData);
	private profiles: Map<Player, Profile<PersistantPlayerData>> = new Map();

	private constructor() {
		this._initConnections();
	}

	public static getInstance(): DataService {
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
		const svc = DataService.getInstance();
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
	public GetProfile(player: Player): Profile<PersistantPlayerData> | undefined {
		return this.profiles.get(player);
	}
	public GetAbilities(player: Player): PersistantPlayerData["Abilities"] | undefined {
		const profile = this.GetProfile(player);
		if (profile) {
			return profile.Data.Abilities;
		}
		warn(`No profile found for player ${player.Name}`);
		return undefined;
	}
}
export const DataServiceInstance = DataService.getInstance();
