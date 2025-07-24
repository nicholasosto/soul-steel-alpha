import { GameCycleRemotes, AbilityRemotes } from "shared/network";

AbilityRemotes.Server.Get("START_ABILITY").SetCallback((player, abilityKey) => {
	const randomChance = math.random();
	if (randomChance < 0.5) {
		// Simulate a failure to start the ability
		print(`Player ${player.Name} failed to start ability ${abilityKey} due to random chance.`);
		return false;
	}
	// Logic to start the ability goes here
	print(`Player ${player.Name} successfully started ability ${abilityKey}.`);
	return true; // Placeholder return value
});
