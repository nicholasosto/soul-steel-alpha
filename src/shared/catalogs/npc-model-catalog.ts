import { ReplicatedStorage } from "@rbxts/services";

/**
 * NPC Model Catalog
 *
 * Maps NPC types to their corresponding models in ReplicatedStorage.
 * This centralizes model management and makes it easy to swap models
 * or add new NPC types.
 */

// NPC Model Type Definitions
export interface NPCModelInfo {
	modelPath: string;
	displayName: string;
	category: "enemy" | "ally" | "neutral" | "boss";
	difficulty: "easy" | "medium" | "hard" | "elite";
	description: string;
}

// NPC Model Catalog
export const NPC_MODEL_CATALOG = {
	// Basic Enemy Types
	goblin: {
		modelPath: "SS Game Package.Rigs.Decay.Zombie",
		displayName: "Goblin Warrior",
		category: "enemy",
		difficulty: "easy",
		description: "A shambling undead creature, perfect for low-level encounters",
	},

	skeleton: {
		modelPath: "SS Game Package.Rigs.Blood.Wendigo",
		displayName: "Skeleton Mage",
		category: "enemy",
		difficulty: "medium",
		description: "A mystical wendigo creature with supernatural powers",
	},

	guard: {
		modelPath: "SS Game Package.Rigs.Robots.Steam Bot",
		displayName: "Steam Guard",
		category: "ally",
		difficulty: "medium",
		description: "A mechanical guardian powered by steam technology",
	},

	// Additional Enemy Types (for future expansion)
	zombie_hipster: {
		modelPath: "SS Game Package.Rigs.Blood.Zombie Hipster",
		displayName: "Zombie Hipster",
		category: "enemy",
		difficulty: "easy",
		description: "A trendy undead with an attitude problem",
	},

	blood_toad: {
		modelPath: "SS Game Package.Rigs.Blood.BloodToad",
		displayName: "Blood Toad",
		category: "enemy",
		difficulty: "easy",
		description: "A corrupted amphibian creature",
	},

	// Elite/Boss Types
	fateless_master: {
		modelPath: "SS Game Package.Rigs.Fateless.Fateless Master",
		displayName: "Fateless Master",
		category: "boss",
		difficulty: "elite",
		description: "A powerful entity that has transcended fate itself",
	},

	evil_lord: {
		modelPath: "SS Game Package.Rigs.Robots.Evil Lord Hal 2000",
		displayName: "Evil Lord HAL",
		category: "boss",
		difficulty: "elite",
		description: "A malevolent AI overlord in mechanical form",
	},

	// Mechanical Units
	mecha_monkey: {
		modelPath: "SS Game Package.Rigs.Robots.Mecha Monkey",
		displayName: "Mecha Monkey",
		category: "enemy",
		difficulty: "medium",
		description: "An agile mechanical primate warrior",
	},

	worker_bot: {
		modelPath: "SS Game Package.Rigs.Robots.Worker Bot",
		displayName: "Worker Bot",
		category: "neutral",
		difficulty: "easy",
		description: "A utility robot repurposed for combat",
	},

	// Spiritual/Elemental Types
	elemental: {
		modelPath: "SS Game Package.Rigs.Spirit.Elemental",
		displayName: "Elemental Spirit",
		category: "enemy",
		difficulty: "hard",
		description: "A manifestation of pure elemental energy",
	},

	dragon_warrior: {
		modelPath: "SS Game Package.Rigs.Spirit.Dragon Boy",
		displayName: "Dragon Warrior",
		category: "enemy",
		difficulty: "hard",
		description: "A fierce draconic humanoid fighter",
	},

	dragon_sorceress: {
		modelPath: "SS Game Package.Rigs.Spirit.Dragon Girl",
		displayName: "Dragon Sorceress",
		category: "enemy",
		difficulty: "hard",
		description: "A powerful draconic spellcaster",
	},

	// Neutral/NPC Types
	anime_female: {
		modelPath: "SS Game Package.Rigs.Spirit.Anime Female",
		displayName: "Spirit Maiden",
		category: "neutral",
		difficulty: "easy",
		description: "A peaceful spiritual entity",
	},
} as const satisfies Record<string, NPCModelInfo>;

// Type for available NPC model keys
export type NPCModelKey = keyof typeof NPC_MODEL_CATALOG;

/**
 * Get the actual Model instance from ReplicatedStorage
 */
export function getNPCModel(modelKey: NPCModelKey): Model | undefined {
	const modelInfo = NPC_MODEL_CATALOG[modelKey];
	if (!modelInfo) {
		warn(`Unknown NPC model key: ${modelKey}`);
		return undefined;
	}

	try {
		// Navigate the path in ReplicatedStorage
		const pathParts = modelInfo.modelPath.split(".");
		let current: Instance = ReplicatedStorage;

		for (const part of pathParts) {
			const child = current.FindFirstChild(part);
			if (!child) {
				warn(`Model path not found: ${modelInfo.modelPath} (missing: ${part})`);
				return undefined;
			}
			current = child;
		}

		if (!current.IsA("Model")) {
			warn(`Expected Model but found ${current.ClassName} at path: ${modelInfo.modelPath}`);
			return undefined;
		}

		return current as Model;
	} catch (error) {
		warn(`Failed to get NPC model ${modelKey}: ${error}`);
		return undefined;
	}
}

/**
 * Clone an NPC model and prepare it for spawning
 */
export function cloneNPCModel(modelKey: NPCModelKey, position: Vector3, name?: string): Model | undefined {
	const sourceModel = getNPCModel(modelKey);
	if (!sourceModel) {
		return undefined;
	}

	try {
		const clonedModel = sourceModel.Clone();
		clonedModel.Name = name ?? NPC_MODEL_CATALOG[modelKey].displayName;

		// Position the model using modern PivotTo method
		clonedModel.PivotTo(new CFrame(position));

		return clonedModel;
	} catch (error) {
		warn(`Failed to clone NPC model ${modelKey}: ${error}`);
		return undefined;
	}
}

/**
 * Get all available NPC models by category
 */
export function getNPCModelsByCategory(category: NPCModelInfo["category"]): NPCModelKey[] {
	const models: NPCModelKey[] = [];

	for (const [key, info] of pairs(NPC_MODEL_CATALOG)) {
		if (info.category === category) {
			models.push(key as NPCModelKey);
		}
	}

	return models;
}

/**
 * Get all available NPC models by difficulty
 */
export function getNPCModelsByDifficulty(difficulty: NPCModelInfo["difficulty"]): NPCModelKey[] {
	const models: NPCModelKey[] = [];

	for (const [key, info] of pairs(NPC_MODEL_CATALOG)) {
		if (info.difficulty === difficulty) {
			models.push(key as NPCModelKey);
		}
	}

	return models;
}
