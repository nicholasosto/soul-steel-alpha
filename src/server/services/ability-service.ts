import { AbilityKey } from "shared/keys";
import { AbilityRemotes } from "shared/network";
import { SSEntity } from "shared/types/SSEntity";

class AbilityService {
	private static instance: AbilityService | undefined;
	private characterAbilityMap: Map<SSEntity, AbilityKey[]> = new Map();

	public static Start(): AbilityService {
		if (AbilityService.instance === undefined) {
			AbilityService.instance = new AbilityService();
		}
		return AbilityService.instance;
	}

	private constructor() {
		// Initialize the service
		this.initializeRemotes();
	}

	private initializeRemotes(): void {
		AbilityRemotes.Server.Get("START_ABILITY").SetCallback((player, abilityKey) => {
			return this.handleAbilityStart(player, abilityKey);
		});
	}

	public RegisterModel(entity: SSEntity, abilityKeys: AbilityKey[]): void {
		if (this.characterAbilityMap.has(entity)) {
			print(`Entity ${entity} already registered with abilities.`);
			return;
		}
		this.characterAbilityMap.set(entity, abilityKeys);
		print(`Registered entity ${entity} with abilities: ${abilityKeys.join(", ")}`);
	}

	private validateAbility(abilityKey: AbilityKey): boolean {
		// Implement your validation logic here
		const random = math.random();
		if (random < 0.5) {
			print(`Ability ${abilityKey} validation failed due to random chance.`);
			return false;
		} else {
			print(`Ability ${abilityKey} validation succeeded.`);
		}
		return true; // Placeholder return value
	}

	private handleAbilityStart(player: Player, abilityKey: AbilityKey): boolean {
		if (!this.validateAbility(abilityKey)) {
			return false;
		}
		return true; // Placeholder return value
	}
}
export const AbilityServiceInstance = AbilityService.Start();
