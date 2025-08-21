/// <reference types="@rbxts/types" />
/**
 * Data service for managing persistant data using @rbxts/profileservice.
 *
 * This service is responsible for loading, saving, and managing player profiles.
 * It handles the initialization of profiles, data retrieval, and persistence.
 * @module DataService
 * @lastUpdated 2025-08-12 - Added comprehensive signal documentation
 *
 * ## Server Signals (Inter-Service Communication)
 * - None - Pure data persistence layer with no signal dependencies
 *
 * ## Client Events (Network Communication)
 * - `GET_PLAYER_DATA` - Handles client requests for player profile data
 *
 * ## Roblox Events (Engine Integration)
 * - `Players.PlayerAdded` - Creates and loads player profiles
 * - `Players.PlayerRemoving` - Saves and releases player profiles
 **/

import ProfileService from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { Players } from "@rbxts/services";
import { makeDefaultAbilityDTO, makeDefaultPlayerProgression, PersistantPlayerData } from "shared";
import { DataRemotes } from "shared/network/data-remotes";
import { ProfileRemotes } from "shared/network/profile-remotes";
import type { ProfileSummaryDTO } from "shared/dtos/profile-dtos";
import { ServiceRegistryInstance } from "./service-registry";
import { IDataOperations } from "./service-interfaces";

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
		this.registerWithServiceRegistry();
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

	/**
	 * Register DataService interface with ServiceRegistry for loose coupling
	 */
	private registerWithServiceRegistry(): void {
		const ops: IDataOperations = {
			getProfile(player: Player) {
				return DataServiceInstance.GetProfile(player);
			},
			saveProfile(player: Player) {
				const profile = DataServiceInstance.GetProfile(player);
				profile?.Save();
			},
			isProfileLoaded(player: Player) {
				return DataServiceInstance.GetProfile(player) !== undefined;
			},
		};
		ServiceRegistryInstance.registerService<IDataOperations>("DataOperations", ops);
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
		print(`[ProfileService] LoadProfileAsync returned for ${player.Name}:`, profile !== undefined);
		profile?.Reconcile();
		profile?.ListenToRelease((releasedProfile) => {
			if (releasedProfile !== undefined) {
				warn(`[ProfileService] Profile released for ${player.Name}`);
				this.profiles.delete(player);
			}
		});
		if (profile === undefined) {
			warn(`[ProfileService] Failed to load profile for ${player.Name}`);
			return;
		}
		this.profiles.set(player, profile);

		// Fire PROFILE_READY to client with a minimal, typed summary once bound
		print(`[ProfileService] PROFILE_READY sending to ${player.Name}`);
		const dto: ProfileSummaryDTO = {
			userId: player.UserId,
			displayName: player.DisplayName,
			level: profile.Data.Progression.Level,
		};
		ProfileRemotes.Server.Get("PROFILE_READY").SendToPlayer(player, dto);
		print(`[ProfileService] PROFILE_READY sent to ${player.Name}`);
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
}
export const DataServiceInstance = DataService.getInstance();
