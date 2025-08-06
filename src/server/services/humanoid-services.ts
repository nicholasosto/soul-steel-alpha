import { Players } from "@rbxts/services";

export class HumanoidServices {
	private static instance: HumanoidServices;
	private static _humanoidHealthChanged: Map<Player, RBXScriptConnection> = new Map();

	private constructor() {
		// Private constructor to prevent instantiation
	}

	public static getInstance(): HumanoidServices {
		if (HumanoidServices.instance === undefined) {
			HumanoidServices.instance = new HumanoidServices();
		}
		HumanoidServices.instance.handleExistingPlayers(); // Handle existing players on service initialization
		return HumanoidServices.instance;
	}

	public handleCharacterAdded(characterModel: Model, player: Player): void {
		// Initialize humanoid-related features for the character
		const humanoid = characterModel.FindFirstChildOfClass("Humanoid");
		HumanoidServices._humanoidHealthChanged.get(player)?.Disconnect();

		if (humanoid) {
			HumanoidServices._humanoidHealthChanged.set(
				player,
				humanoid.HealthChanged.Connect((newHealth) => {
					print(`Humanoid health changed for player ${player.Name}: ${newHealth}`);
				}),
			);
		}
	}
	private handleExistingPlayers(): void {
		// Handle existing players when the service is initialized
		Players.GetPlayers().forEach((player) => {
			if (player.Character) {
				this.handleCharacterAdded(player.Character, player);
			}
		});
	}
	public unregisterPlayer(player: Player): void {
		const connection = HumanoidServices._humanoidHealthChanged.get(player);
		if (connection) {
			connection.Disconnect();
			HumanoidServices._humanoidHealthChanged.delete(player);
			print(`Unregistered player ${player.Name} from humanoid health changes.`);
		} else {
			warn(`No humanoid health change connection found for player ${player.Name}.`);
		}
	}
}

export const HumanoidServicesInstance = HumanoidServices.getInstance();

Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((character) => {
		HumanoidServicesInstance.handleCharacterAdded(character, player);
	});
});

Players.PlayerRemoving.Connect((player) => {
	HumanoidServicesInstance.unregisterPlayer(player);
});
