/**
 * @file scripts/ui-completion-tracker.js
 * @description Node.js script to track UI component completion status
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

const fs = require("fs");
const path = require("path");

// Configuration
const UI_BASE_PATH = "./src/client/client-ui";
const SCREENS_PATH = "./src/client/screens";

// Expected components based on roadmap
const EXPECTED_COMPONENTS = {
	atoms: [
		"ProgressBar.ts",
		"IconButton.ts",
		"MessageBox.ts",
		"CloseButton.ts",
		"Layout.ts",
		"SliceImageFrame.ts",
		"LoadingSpinner.ts", // Missing
		"Tooltip.ts", // Missing
	],
	molecules: [
		"cooldown-button/AbilityButton.ts",
		"cooldown-button/CooldownButton.ts",
		"MenuButton.ts",
		"TitleBar.ts",
		"SearchBar.ts", // Missing
		"HealthBar.ts", // Missing
		"InputField.ts", // Missing
		"ToggleSwitch.ts", // Missing
	],
	organisms: [
		"button-bars/AbilityButtons.ts",
		"button-bars/MenuButtons.ts",
		"button-bars/ButtonBar.ts",
		"resource-bars/ResourceBars.ts",
		"panels/PanelWindow.ts",
		"inventory/InventoryGrid.ts", // Missing
		"chat/ChatPanel.ts", // Missing
		"settings/SettingsPanel.ts", // Missing
		"character/CharacterPanel.ts", // Missing
		"minimap/MiniMap.ts", // Missing
		"social/Leaderboard.ts", // Missing
	],
	screens: [
		"PlayerHUD.ts",
		"TextAndLabelDemo.ts",
		"MainMenu.ts", // Missing
		"SettingsScreen.ts", // Missing
		"InventoryScreen.ts", // Missing
		"CharacterScreen.ts", // Missing
	],
};

/**
 * Check if a file exists
 */
function fileExists(filePath) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (e) {
		return false;
	}
}

/**
 * Check if a directory exists
 */
function dirExists(dirPath) {
	try {
		return fs.statSync(dirPath).isDirectory();
	} catch (e) {
		return false;
	}
}

/**
 * Get completion status for a component category
 */
function getCompletionStatus(category, basePath) {
	const expected = EXPECTED_COMPONENTS[category];
	const results = {
		completed: [],
		missing: [],
		total: expected.length,
		completionRate: 0,
	};

	for (const component of expected) {
		const fullPath = path.join(basePath, category, component);
		if (fileExists(fullPath)) {
			results.completed.push(component);
		} else {
			results.missing.push(component);
		}
	}

	results.completionRate = Math.round((results.completed.length / results.total) * 100);
	return results;
}

/**
 * Get screens completion status
 */
function getScreensCompletion() {
	const expected = EXPECTED_COMPONENTS.screens;
	const results = {
		completed: [],
		missing: [],
		total: expected.length,
		completionRate: 0,
	};

	for (const screen of expected) {
		const fullPath = path.join(SCREENS_PATH, screen);
		if (fileExists(fullPath)) {
			results.completed.push(screen);
		} else {
			results.missing.push(screen);
		}
	}

	results.completionRate = Math.round((results.completed.length / results.total) * 100);
	return results;
}

/**
 * Generate completion report
 */
function generateReport() {
	console.log("🎨 Soul Steel Alpha - UI Completion Status");
	console.log("=".repeat(50));

	const categories = ["atoms", "molecules", "organisms"];
	let totalCompleted = 0;
	let totalExpected = 0;

	// Check UI components
	for (const category of categories) {
		const status = getCompletionStatus(category, UI_BASE_PATH);
		totalCompleted += status.completed.length;
		totalExpected += status.total;

		console.log(
			`\n📦 ${category.toUpperCase()}: ${status.completionRate}% (${status.completed.length}/${status.total})`,
		);

		if (status.completed.length > 0) {
			console.log(`  ✅ Completed: ${status.completed.join(", ")}`);
		}

		if (status.missing.length > 0) {
			console.log(`  ❌ Missing: ${status.missing.join(", ")}`);
		}
	}

	// Check screens
	const screensStatus = getScreensCompletion();
	totalCompleted += screensStatus.completed.length;
	totalExpected += screensStatus.total;

	console.log(
		`\n🖥️  SCREENS: ${screensStatus.completionRate}% (${screensStatus.completed.length}/${screensStatus.total})`,
	);

	if (screensStatus.completed.length > 0) {
		console.log(`  ✅ Completed: ${screensStatus.completed.join(", ")}`);
	}

	if (screensStatus.missing.length > 0) {
		console.log(`  ❌ Missing: ${screensStatus.missing.join(", ")}`);
	}

	// Overall completion
	const overallCompletion = Math.round((totalCompleted / totalExpected) * 100);
	console.log(`\n🎯 OVERALL COMPLETION: ${overallCompletion}% (${totalCompleted}/${totalExpected})`);

	// Next priorities
	console.log("\n🚀 IMMEDIATE PRIORITIES:");

	const allMissing = [
		...getCompletionStatus("atoms", UI_BASE_PATH).missing.map((f) => `atoms/${f}`),
		...getCompletionStatus("molecules", UI_BASE_PATH).missing.map((f) => `molecules/${f}`),
		...getCompletionStatus("organisms", UI_BASE_PATH).missing.map((f) => `organisms/${f}`),
		...screensStatus.missing.map((f) => `screens/${f}`),
	];

	const priorities = [
		"atoms/LoadingSpinner.ts",
		"molecules/HealthBar.ts",
		"molecules/InputField.ts",
		"screens/SettingsScreen.ts",
		"screens/MainMenu.ts",
	];

	priorities.forEach((priority, index) => {
		if (allMissing.includes(priority)) {
			console.log(`  ${index + 1}. ${priority}`);
		}
	});

	console.log("\n📈 Run this script regularly to track progress!");
}

/**
 * Generate TODO list for missing components
 */
function generateTodoList() {
	const todos = [];

	const categories = ["atoms", "molecules", "organisms"];
	for (const category of categories) {
		const status = getCompletionStatus(category, UI_BASE_PATH);
		status.missing.forEach((component) => {
			todos.push(`- [ ] Create ${category}/${component}`);
		});
	}

	const screensStatus = getScreensCompletion();
	screensStatus.missing.forEach((screen) => {
		todos.push(`- [ ] Create screens/${screen}`);
	});

	return todos;
}

// Main execution
if (require.main === module) {
	const command = process.argv[2];

	switch (command) {
		case "report":
		case undefined:
			generateReport();
			break;

		case "todo":
			console.log("📋 UI Component TODO List:\n");
			generateTodoList().forEach((todo) => console.log(todo));
			break;

		case "json":
			const data = {
				atoms: getCompletionStatus("atoms", UI_BASE_PATH),
				molecules: getCompletionStatus("molecules", UI_BASE_PATH),
				organisms: getCompletionStatus("organisms", UI_BASE_PATH),
				screens: getScreensCompletion(),
			};
			console.log(JSON.stringify(data, undefined, 2));
			break;

		default:
			console.log("Usage: node ui-completion-tracker.js [report|todo|json]");
	}
}

module.exports = {
	getCompletionStatus,
	getScreensCompletion,
	generateReport,
	generateTodoList,
};
