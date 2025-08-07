/**
 * @file src/client/controllers/controller-validation.ts
 * @module ControllerValidation
 * @layer Client/Controllers
 * @description Runtime validation to prevent architectural drift
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-07 - Created to prevent controller responsibility drift
 */

/**
 * Controller responsibilities documentation for reference
 */
export const CONTROLLER_RESPONSIBILITIES = {
	InputController: [
		"Map keyboard/mouse inputs to semantic actions",
		"Handle input validation and filtering",
		"Emit actions to registered handlers",
		"Manage configurable key mappings",
	],
	MovementController: [
		"Running state management",
		"Jump mechanics and double-jump",
		"Walk speed changes",
		"Movement-related physics",
	],
	AbilityController: [
		"Ability activation via network calls",
		"Cooldown tracking and management",
		"Effect triggering",
		"UI integration with reactive progress values",
	],
	ZoneController: [
		"Zone creation and management",
		"Zone event handling",
		"Player zone tracking",
		"Zone configuration application",
	],
	ClientController: [
		"Initialize and manage controller lifecycle",
		"Route input actions to appropriate controllers",
		"Provide access to sub-controllers",
		"System integration and cleanup",
	],
} as const;

/**
 * Anti-patterns to avoid in each controller
 */
export const CONTROLLER_ANTI_PATTERNS = {
	InputController: [
		"DO NOT add game logic (cooldown checks, ability validation)",
		"DO NOT make network calls directly",
		"DO NOT manage game state (health, mana, etc.)",
		"DO NOT handle UI updates or rendering",
	],
	MovementController: [
		"DO NOT handle input mapping (use InputController)",
		"DO NOT handle abilities (use AbilityController)",
		"DO NOT make network calls outside movement domain",
		"DO NOT handle UI state management",
	],
	AbilityController: [
		"DO NOT handle input mapping (use InputController)",
		"DO NOT handle movement logic (use MovementController)",
		"DO NOT handle zone interactions (use ZoneController)",
		"DO NOT duplicate network setup from other controllers",
	],
	ZoneController: [
		"DO NOT handle input processing (use InputController)",
		"DO NOT handle ability activation (use AbilityController)",
		"DO NOT handle movement mechanics (use MovementController)",
		"DO NOT duplicate functionality from other controllers",
	],
	ClientController: [
		"DO NOT add game logic (abilities, movement, zones)",
		"DO NOT handle UI rendering or state management",
		"DO NOT make direct network calls",
		"DO NOT duplicate functionality from sub-controllers",
	],
} as const;

/**
 * Helper to suggest correct controller for functionality
 */
export function suggestCorrectController(functionality: string): string {
	const lowerFunc = functionality.lower();

	if (
		lowerFunc.find("input")[0] !== undefined ||
		lowerFunc.find("key")[0] !== undefined ||
		lowerFunc.find("mouse")[0] !== undefined
	) {
		return "InputController";
	}

	if (
		lowerFunc.find("movement")[0] !== undefined ||
		lowerFunc.find("running")[0] !== undefined ||
		lowerFunc.find("jump")[0] !== undefined
	) {
		return "MovementController";
	}

	if (
		lowerFunc.find("ability")[0] !== undefined ||
		lowerFunc.find("cooldown")[0] !== undefined ||
		lowerFunc.find("effect")[0] !== undefined
	) {
		return "AbilityController";
	}

	if (
		lowerFunc.find("zone")[0] !== undefined ||
		lowerFunc.find("area")[0] !== undefined ||
		lowerFunc.find("region")[0] !== undefined
	) {
		return "ZoneController";
	}

	return "Consider creating a new controller if this is a distinct domain with 3+ responsibilities";
}

/**
 * Print architectural guidelines for reference
 */
export function printArchitecturalGuidelines(): void {
	print("=== CLIENT CONTROLLER ARCHITECTURE GUIDELINES ===");
	print("");

	for (const [controller, responsibilities] of pairs(CONTROLLER_RESPONSIBILITIES)) {
		print(`${controller} Responsibilities:`);
		for (const responsibility of responsibilities) {
			print(`  ✅ ${responsibility}`);
		}
		print("");

		const antiPatterns = CONTROLLER_ANTI_PATTERNS[controller as keyof typeof CONTROLLER_ANTI_PATTERNS];
		if (antiPatterns) {
			print(`${controller} Anti-Patterns:`);
			for (const antiPattern of antiPatterns) {
				print(`  ❌ ${antiPattern}`);
			}
			print("");
		}
	}

	print("=== DECISION FRAMEWORK ===");
	print("1. Does this belong in an existing controller? → Add to existing");
	print("2. Is this a new domain with 3+ responsibilities? → Create new controller");
	print("3. Would this create overlap? → Refactor to eliminate overlap");
	print("");
}

// Development helper - print guidelines in development builds
if (game.PlaceId === 0) {
	// Local testing environment
	task.spawn(() => {
		task.wait(2); // Wait for initialization
		printArchitecturalGuidelines();
	});
}
