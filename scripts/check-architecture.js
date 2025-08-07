#!/usr/bin/env node
/**
 * @file scripts/check-architecture.js
 * @description Simple architecture validation script to prevent controller drift
 */

const fs = require("fs");
const path = require("path");

const CONTROLLERS_DIR = "src/client/controllers";

// Expected controller responsibilities
const EXPECTED_CONTROLLERS = {
	"InputController.ts": {
		purpose: "Raw input mapping",
		maxLines: 200,
		shouldContain: ["InputAction", "handleKeyboardInput", "emitAction"],
		shouldNotContain: ["cooldown", "ability activation", "network call"],
	},
	"MovementController.ts": {
		purpose: "Player movement mechanics",
		maxLines: 150,
		shouldContain: ["WalkSpeed", "jump", "running"],
		shouldNotContain: ["ability", "input mapping", "remote"],
	},
	"AbilityController.ts": {
		purpose: "Ability system management",
		maxLines: 300,
		shouldContain: ["activateAbility", "cooldown", "AbilityRemotes"],
		shouldNotContain: ["input handling", "movement logic"],
	},
	"ZoneController.ts": {
		purpose: "Zone management",
		maxLines: 250,
		shouldContain: ["createZone", "Zone"],
		shouldNotContain: ["ability", "input", "movement"],
	},
	"ClientController.ts": {
		purpose: "Central coordination",
		maxLines: 200,
		shouldContain: ["handleInputAction", "getInstance"],
		shouldNotContain: ["direct game logic", "ui rendering"],
	},
};

function checkArchitecture() {
	console.log("🏗️  Checking Client Controller Architecture...\n");

	const controllersPath = path.join(process.cwd(), CONTROLLERS_DIR);
	let violations = 0;

	if (!fs.existsSync(controllersPath)) {
		console.error(`❌ Controllers directory not found: ${controllersPath}`);
		process.exit(1);
	}

	const files = fs.readdirSync(controllersPath).filter((f) => f.endsWith(".ts") && f !== "index.ts");

	// Check for unexpected controllers
	const expectedFiles = Object.keys(EXPECTED_CONTROLLERS);
	const unexpectedFiles = files.filter((f) => !expectedFiles.includes(f) && f !== "controller-validation.ts");

	if (unexpectedFiles.length > 0) {
		console.log("⚠️  Unexpected controllers found:");
		unexpectedFiles.forEach((file) => {
			console.log(`   - ${file} (consider if this is necessary or could be merged)`);
			violations++;
		});
		console.log("");
	}

	// Check missing controllers
	const missingFiles = expectedFiles.filter((f) => !files.includes(f));
	if (missingFiles.length > 0) {
		console.log("❌ Missing expected controllers:");
		missingFiles.forEach((file) => console.log(`   - ${file}`));
		violations++;
		console.log("");
	}

	// Check each controller
	for (const [filename, expectations] of Object.entries(EXPECTED_CONTROLLERS)) {
		const filePath = path.join(controllersPath, filename);

		if (!fs.existsSync(filePath)) continue;

		const content = fs.readFileSync(filePath, "utf8");
		// Remove comments to avoid false positives from documentation
		const contentWithoutComments = content
			.replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
			.replace(/\/\/.*$/gm, ""); // Remove line comments
		const lines = content.split("\n").length;

		console.log(`📋 Checking ${filename} (${expectations.purpose}):`);

		// Check file size
		if (lines > expectations.maxLines) {
			console.log(`   ❌ Too large: ${lines} lines (max: ${expectations.maxLines})`);
			console.log(`      Consider splitting responsibilities`);
			violations++;
		} else {
			console.log(`   ✅ Size OK: ${lines} lines`);
		}

		// Check required content
		let hasRequired = true;
		for (const required of expectations.shouldContain) {
			if (!contentWithoutComments.toLowerCase().includes(required.toLowerCase())) {
				console.log(`   ❌ Missing expected: "${required}"`);
				hasRequired = false;
				violations++;
			}
		}
		if (hasRequired) {
			console.log(`   ✅ Contains expected functionality`);
		}

		// Check forbidden content
		let hasForbidden = false;
		for (const forbidden of expectations.shouldNotContain) {
			if (contentWithoutComments.toLowerCase().includes(forbidden.toLowerCase())) {
				console.log(`   ❌ Contains forbidden: "${forbidden}"`);
				console.log(`      This suggests responsibility drift`);
				hasForbidden = true;
				violations++;
			}
		}
		if (!hasForbidden) {
			console.log(`   ✅ No forbidden content found`);
		}

		console.log("");
	}

	// Summary
	if (violations === 0) {
		console.log("🎉 Architecture validation passed! All controllers follow expected patterns.");
	} else {
		console.log(`❌ Found ${violations} architectural violations.`);
		console.log("\n📖 See CLIENT_ARCHITECTURE_GUIDELINES.md for detailed guidance.");
		process.exit(1);
	}
}

checkArchitecture();
