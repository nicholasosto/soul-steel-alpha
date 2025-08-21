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
import {
	makeDefaultAbilityDTO,
	makeDefaultPlayerProgression,
	PersistantPlayerData,
	makeDefaultPlayerControls,
	AbilityKey,
} from "shared";
import { DataRemotes } from "shared/network/data-remotes";
import { ProfileRemotes } from "shared/network/profile-remotes";
import { ControlsRemotes } from "shared/network/controls-remotes";
import type { ProfileSummaryDTO } from "shared/dtos/profile-dtos";
import { ServiceRegistryInstance } from "./service-registry";
import { IDataOperations } from "./service-interfaces";
import { ABILITY_KEYS } from "shared/catalogs/ability-catalog";

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
	Controls: makeDefaultPlayerControls(),
};

// Datastore Name
const DATASTORE_NAME = "A_SoulSteelPlayerProfile";

class DataService {
	private static instance?: DataService;
	private _profileStore = ProfileService.GetProfileStore(DATASTORE_NAME, DefaultData);
	private profiles: Map<Player, Profile<PersistantPlayerData>> = new Map();
	// Simple in-memory rate limiter for save calls (per player)
	private lastHotkeySave: Map<Player, number> = new Map();

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

		// Wire hotkey load/save remotes
		ControlsRemotes.Server.Get("HOTKEY_LOAD").SetCallback((player) => {
			const profile = this.GetProfile(player);
			if (profile === undefined) return undefined;
			const bindings = profile.Data.Controls?.bindings;
			if (bindings === undefined) return undefined;
			// Sanitize before returning to client
			return this.sanitizeBindings(bindings, player);
		});

		ControlsRemotes.Server.Get("HOTKEY_SAVE").SetCallback((player, incoming) => {
			// Rate limit: allow at most one save per 2 seconds
			const now = tick();
			const last = this.lastHotkeySave.get(player);
			if (last !== undefined && now - last < 2) {
				warn(`HOTKEY_SAVE rate limited for ${player.Name}`);
				return false;
			}

			const profile = this.GetProfile(player);
			if (profile === undefined) return false;

			// Validate payload shape explicitly
			if (incoming === undefined || incoming.abilities === undefined) return false;

			const sanitized = this.sanitizeBindings(incoming, player);
			// Save to profile
			if (profile.Data.Controls === undefined) profile.Data.Controls = makeDefaultPlayerControls();
			profile.Data.Controls.bindings = sanitized;
			this.lastHotkeySave.set(player, now);
			return true;
		});
	}

	/** Replace unknown ability keys or invalid key names with defaults; log replacements */
	private sanitizeBindings(incoming: { abilities: Record<string, AbilityKey | undefined> }, player?: Player) {
		const validAbility = new Set<AbilityKey>(ABILITY_KEYS as readonly AbilityKey[]);
		const result: Record<string, AbilityKey> = {};
		let invalidCount = 0;
		for (const [keyName, ability] of pairs(incoming.abilities)) {
			if (typeOf(keyName) !== "string") continue;
			if (ability !== undefined && validAbility.has(ability)) {
				result[keyName] = ability;
			} else if (ability !== undefined) {
				invalidCount += 1;
			}
		}
		// Fill defaults for missing core keys (Q,E,R)
		let filledDefaults = 0;
		if (result["Q"] === undefined) {
			result["Q"] = "Melee";
			filledDefaults += 1;
		}
		if (result["E"] === undefined) {
			result["E"] = "Ice-Rain";
			filledDefaults += 1;
		}
		if (result["R"] === undefined) {
			result["R"] = "Earthquake";
			filledDefaults += 1;
		}
		if (invalidCount > 0 || filledDefaults > 0) {
			const who = player ? player.Name : "unknown";
			warn(`HOTKEY_SANITIZE for ${who}: invalid=${invalidCount}, defaultsFilled=${filledDefaults}`);
		}
		return { abilities: result };
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
