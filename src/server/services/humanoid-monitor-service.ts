/**
 * @file src/server/services/humanoid-monitor-service.ts
 * @module HumanoidMonitorService
 * @layer Server/Services
 * @description Monitors Roblox Humanoid events and translates them to our signal system
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-12 - Added comprehensive signal documentation
 *
 * ## Server Signals (Inter-Service Communication)
 * - `HumanoidHealthChanged` - Emits when Roblox Humanoid health changes for resource tracking
 * - `HumanoidDied` - Emits when Roblox Humanoid dies for death handling systems
 *
 * ## Client Events (Network Communication)
 * - None - Pure signal emission service with no client communication
 *
 * ## Roblox Events (Engine Integration)
 * - `Players.PlayerAdded` - Monitors new players for character spawning
 * - `Players.PlayerRemoving` - Cleans up monitoring for leaving players
 * - `Players.GetPlayers()` - Initializes monitoring for existing players
 * - `humanoid.HealthChanged` - Roblox Humanoid health change events
 * - `humanoid.Died` - Roblox Humanoid death events
 */

import { Players } from "@rbxts/services";
import { SignalServiceInstance } from "./signal-service";

/**
 * HumanoidMonitorService - Bridges Roblox Humanoid API with our signal system
 *
 * This service specifically handles:
 * - Monitoring Humanoid health changes
 * - Detecting character death
 * - Converting Roblox events to our standardized signals
 *
 * Other services should listen to our signals instead of directly to Humanoid events
 */
export class HumanoidMonitorService {
	private static instance?: HumanoidMonitorService;
	private humanoidConnections = new Map<Model, RBXScriptConnection[]>();

	private constructor() {
		this.initializeConnections();
	}

	public static getInstance(): HumanoidMonitorService {
		if (!HumanoidMonitorService.instance) {
			HumanoidMonitorService.instance = new HumanoidMonitorService();
		}
		return HumanoidMonitorService.instance;
	}

	/**
	 * Initialize player and character connections
	 */
	private initializeConnections(): void {
		// Handle existing players
		for (const player of Players.GetPlayers()) {
			this.setupPlayerConnections(player);
		}

		// Handle new players
		Players.PlayerAdded.Connect((player) => {
			this.setupPlayerConnections(player);
		});

		// Handle player leaving
		Players.PlayerRemoving.Connect((player) => {
			if (player.Character) {
				this.cleanupCharacterConnections(player.Character);
			}
		});
	}

	/**
	 * Setup connections for a specific player
	 */
	private setupPlayerConnections(player: Player): void {
		// Handle existing character
		if (player.Character) {
			this.setupCharacterConnections(player, player.Character);
		}

		// Handle new characters
		player.CharacterAdded.Connect((character) => {
			this.setupCharacterConnections(player, character);
		});

		// Handle character removal
		player.CharacterRemoving.Connect((character) => {
			this.cleanupCharacterConnections(character);
		});
	}

	/**
	 * Setup Humanoid monitoring for a character
	 */
	private setupCharacterConnections(player: Player, character: Model): void {
		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid === undefined) {
			warn(`HumanoidMonitorService: No Humanoid found for character of player ${player.Name}`);
			return;
		}

		const connections: RBXScriptConnection[] = [];

		// Monitor health changes
		connections.push(
			humanoid.HealthChanged.Connect((newHealth) => {
				SignalServiceInstance.emit("HumanoidHealthChanged", {
					player,
					character,
					newHealth,
					maxHealth: humanoid.MaxHealth,
				});
			}),
		);

		// Monitor death
		connections.push(
			humanoid.Died.Connect(() => {
				SignalServiceInstance.emit("HumanoidDied", {
					player,
					character,
				});
			}),
		);

		// Store connections for cleanup
		this.humanoidConnections.set(character, connections);

		print(`HumanoidMonitorService: Connected to humanoid for ${player.Name}`);
	}

	/**
	 * Cleanup connections when character is removed
	 */
	private cleanupCharacterConnections(character: Model): void {
		const connections = this.humanoidConnections.get(character);
		if (connections) {
			connections.forEach((connection) => connection.Disconnect());
			this.humanoidConnections.delete(character);
			print(`HumanoidMonitorService: Cleaned up connections for character ${character.Name}`);
		}
	}

	/**
	 * Get the current health of a player's character
	 */
	public getPlayerHealth(player: Player): number | undefined {
		const character = player.Character;
		if (!character) return undefined;

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		return humanoid?.Health;
	}

	/**
	 * Get the max health of a player's character
	 */
	public getPlayerMaxHealth(player: Player): number | undefined {
		const character = player.Character;
		if (!character) return undefined;

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		return humanoid?.MaxHealth;
	}
}

// Export singleton instance
export const HumanoidMonitorServiceInstance = HumanoidMonitorService.getInstance();
