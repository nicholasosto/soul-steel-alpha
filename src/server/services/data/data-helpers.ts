import { AbilityKey, ABILITY_KEYS } from "shared";

/** Replace unknown ability keys or invalid key names with defaults; log replacements */
export function sanitizeBindings(incoming: { abilities: Record<string, AbilityKey | undefined> }, player?: Player) {
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
