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
import { makeDefaultAbilityDTO, makeDefaultPlayerProgression, PersistantPlayerData } from "shared";
import { DataRemotes } from "shared/network/data-remotes";
import { ProgressionRemotes } from "shared/network/progression-remotes";

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

ProgressionRemotes.Server.Get("GET_PROGRESSION").SetCallback((player) => {
	const progression = DataServiceInstance.GetProgression(player);
	if (progression !== undefined) {
		return progression;
	} else {
		warn(`No progression found for player ${player.Name}`);
		return undefined;
	}
});

ProgressionRemotes.Server.Get("AWARD_EXPERIENCE").SetCallback((player, amount) => {
	// This should only be called by admin systems or specific game events
	// You might want to add additional authorization checks here
	return DataServiceInstance.AddExperience(player, amount);
});

const DefaultData: PersistantPlayerData = {
	Abilities: makeDefaultAbilityDTO(),
	Progression: makeDefaultPlayerProgression(),
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
			if (releasedProfile !== undefined) {
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

	public GetProgression(player: Player): PersistantPlayerData["Progression"] | undefined {
		const profile = this.GetProfile(player);
		if (profile) {
			return profile.Data.Progression;
		}
		warn(`No profile found for player ${player.Name}`);
		return undefined;
	}

	public UpdateProgression(player: Player, progressionData: Partial<PersistantPlayerData["Progression"]>): boolean {
		const profile = this.GetProfile(player);
		if (profile) {
			// Merge the new progression data with existing data
			profile.Data.Progression = { ...profile.Data.Progression, ...progressionData };
			return true;
		}
		warn(`No profile found for player ${player.Name}`);
		return false;
	}

	public AddExperience(player: Player, experienceToAdd: number): boolean {
		const profile = this.GetProfile(player);
		if (profile === undefined) {
			warn(`No profile found for player ${player.Name}`);
			return false;
		}

		const progression = profile.Data.Progression;
		const oldLevel = progression.Level;
		progression.Experience += experienceToAdd;

		// Handle level up logic
		while (progression.Experience >= progression.NextLevelExperience) {
			progression.Experience -= progression.NextLevelExperience;
			progression.Level += 1;

			// Calculate next level experience requirement (simple formula - you can customize)
			progression.NextLevelExperience = progression.Level * 100;
		}

		// Fire level up event if level changed
		if (progression.Level > oldLevel) {
			print(`Player ${player.Name} leveled up to ${progression.Level}!`);
			ProgressionRemotes.Server.Get("LEVEL_UP").SendToPlayer(player, progression.Level, progression);
		}

		// Always fire progression updated event
		ProgressionRemotes.Server.Get("PROGRESSION_UPDATED").SendToPlayer(player, progression);

		return true;
	}
}
export const DataServiceInstance = DataService.getInstance();
