/**
 * @file src/server/services/progression-service.ts
 * @module ProgressionService
 * @layer Server/Services
 * @description Centralized player progression management using signal system
 *
 * Handles all progression-related functionality:
 * - Experience awarding and level calculations
 * - Level-up processing and rewards
 * - Progression data persistence
 * - Signal-based inter-service communication
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Initial creation for progression refactor
 */

import { Players } from "@rbxts/services";
import { PlayerProgression, PersistantPlayerData } from "shared/types/player-data";
import { ProgressionRemotes } from "shared/network/progression-remotes";
import { DataServiceInstance } from "./data-service";
import { SignalServiceInstance } from "./signal-service";
import { ServiceRegistryInstance } from "./service-registry";

/**
 * Progression Service - Manages player experience, levels, and progression
 *
 * Features:
 * - Signal-based experience awarding from any source
 * - Configurable level curves and experience requirements
 * - Level-up rewards and notifications
 * - Persistence through DataService integration
 * - Network synchronization with clients
 */
export class ProgressionService {
	private static instance?: ProgressionService;
	private signalConnections: RBXScriptConnection[] = [];

	// Configuration
	private readonly BASE_EXPERIENCE_REQUIREMENT = 100;
	private readonly EXPERIENCE_MULTIPLIER = 1.2;
	private readonly EXPERIENCE_BONUS = 5;

	private constructor() {
		this.initializeRemotes();
		this.initializeSignalConnections();
		this.initializePlayerConnections();
	}

	public static getInstance(): ProgressionService {
		if (!ProgressionService.instance) {
			ProgressionService.instance = new ProgressionService();
		}
		return ProgressionService.instance;
	}

	/**
	 * Initialize progression-related remotes
	 */
	private initializeRemotes(): void {
		// Handle client requests for progression data
		ProgressionRemotes.Server.Get("GET_PROGRESSION").SetCallback((player) => {
			const progression = DataServiceInstance.GetProgression(player);
			if (progression !== undefined) {
				return progression;
			} else {
				warn(`ProgressionService: No progression found for player ${player.Name}`);
				return undefined;
			}
		});

		// Handle admin/testing experience awards
		ProgressionRemotes.Server.Get("AWARD_EXPERIENCE").SetCallback((player, amount) => {
			// This should only be called by admin systems or specific game events
			// You might want to add additional authorization checks here
			return this.awardExperience(player, amount, "admin");
		});
	}

	/**
	 * Initialize signal system connections
	 */
	private initializeSignalConnections(): void {
		// Listen for experience award requests from other services
		const experienceSignal = SignalServiceInstance.getSignal("ExperienceAwarded");
		if (experienceSignal) {
			const connection = experienceSignal.Connect((data) => {
				this.handleExperienceAwarded(data.player, data.amount, data.source);
			});
			this.signalConnections.push(connection);
		}
	}

	/**
	 * Initialize player lifecycle connections
	 */
	private initializePlayerConnections(): void {
		// Clean up connections when players leave
		const connection = Players.PlayerRemoving.Connect((player) => {
			this.handlePlayerLeaving(player);
		});
		this.signalConnections.push(connection);
	}

	/**
	 * Handle experience awarded signal from other services
	 */
	private handleExperienceAwarded(player: Player, amount: number, source?: string): void {
		this.awardExperience(player, amount, source);
	}

	/**
	 * Handle player leaving cleanup
	 */
	private handlePlayerLeaving(player: Player): void {
		// Currently no per-player cleanup needed, but placeholder for future features
		print(`ProgressionService: Player ${player.Name} leaving - no cleanup needed`);
	}

	/**
	 * Award experience to a player and handle level-ups
	 * @param player Player to award experience to
	 * @param amount Amount of experience to award
	 * @param source Optional source of experience for tracking
	 * @returns Success status
	 */
	public awardExperience(player: Player, amount: number, source?: string): boolean {
		if (amount <= 0) {
			warn(`ProgressionService: Invalid experience amount ${amount} for player ${player.Name}`);
			return false;
		}

		const profile = DataServiceInstance.GetProfile(player);
		if (!profile) {
			warn(`ProgressionService: No profile found for player ${player.Name}`);
			return false;
		}

		const progression = profile.Data.Progression;
		const oldLevel = progression.Level;
		const oldExperience = progression.Experience;

		// Add experience
		progression.Experience += amount;
		print(`ProgressionService: Awarded ${amount} XP to ${player.Name} (Source: ${source ?? "unknown"})`);

		// Calculate level-ups
		let levelsGained = 0;
		while (progression.Experience >= progression.NextLevelExperience) {
			progression.Experience -= progression.NextLevelExperience;
			progression.Level += 1;
			levelsGained += 1;

			// Calculate next level experience requirement
			progression.NextLevelExperience = this.calculateExperienceRequirement(progression.Level);
		}

		// Emit progression updated signal
		SignalServiceInstance.emit("ProgressionUpdated", {
			player,
			progression: { ...progression },
		});

		// Handle level-ups
		if (levelsGained > 0) {
			this.handleLevelUp(player, oldLevel, progression.Level, progression);
		}

		// Send progression update to client
		ProgressionRemotes.Server.Get("PROGRESSION_UPDATED").SendToPlayer(player, progression);

		return true;
	}

	/**
	 * Handle level-up processing and rewards
	 */
	private handleLevelUp(player: Player, oldLevel: number, newLevel: number, progression: PlayerProgression): void {
		print(`ProgressionService: ${player.Name} leveled up from ${oldLevel} to ${newLevel}!`);

		// Emit level-up signal for other services to handle rewards
		SignalServiceInstance.emit("LevelUp", {
			player,
			oldLevel,
			newLevel,
			progression: { ...progression },
		});

		// Send level-up notification to client
		ProgressionRemotes.Server.Get("LEVEL_UP").SendToPlayer(player, newLevel, progression);

		// Here you could add level-up rewards:
		// - Stat increases
		// - Ability unlocks
		// - Currency rewards
		// - Achievement triggers
	}

	/**
	 * Calculate experience requirement for a given level
	 */
	private calculateExperienceRequirement(level: number): number {
		// Simple exponential curve: base * (multiplier ^ (level - 1)) + bonus * level
		return math.floor(
			this.BASE_EXPERIENCE_REQUIREMENT * math.pow(this.EXPERIENCE_MULTIPLIER, level - 1) +
				this.EXPERIENCE_BONUS * level,
		);
	}

	/**
	 * Get current progression data for a player
	 */
	public getProgression(player: Player): PlayerProgression | undefined {
		return DataServiceInstance.GetProgression(player);
	}

	/**
	 * Update progression data (for admin tools or special events)
	 */
	public updateProgression(player: Player, progressionData: Partial<PlayerProgression>): boolean {
		const updated = DataServiceInstance.UpdateProgression(player, progressionData);

		if (updated) {
			const fullProgression = DataServiceInstance.GetProgression(player);
			if (fullProgression) {
				// Emit progression updated signal
				SignalServiceInstance.emit("ProgressionUpdated", {
					player,
					progression: fullProgression,
				});

				// Send update to client
				ProgressionRemotes.Server.Get("PROGRESSION_UPDATED").SendToPlayer(player, fullProgression);
			}
		}

		return updated;
	}

	/**
	 * Cleanup connections when service is destroyed
	 */
	public destroy(): void {
		for (const connection of this.signalConnections) {
			connection.Disconnect();
		}
		this.signalConnections = [];
	}
}

// Export singleton instance
export const ProgressionServiceInstance = ProgressionService.getInstance();
