/**
 * @file src/client/combat-test.client.ts
 * @description Simple test client	print("Combat Test Client loaded!");
	print("Controls:");
	print("  T - Attack nearest target (players or NPCs)");
	print("  N - Attack nearest NPC specifically"); 
	print("  1 - Equip Fists");
	print("  2 - Equip Basic Sword");
	print("  3 - Equip Soul Blade");
	print("  R - Spawn 3 test NPCs and run health demo");combat system
 *
 * This script provides basic testing functionality for the combat service.
 * It allows players to test basic attacks and weapon equipping.
 */

import { Players, UserInputService, Workspace } from "@rbxts/services";
import { CombatRemotes } from "shared/network";
import { SSEntity } from "shared/types";
import { isSSEntity } from "shared/helpers/type-guards";

const localPlayer = Players.LocalPlayer;

// Test combat functionality
function testCombatSystem(): void {
	print("Combat Test Client: Initialized");

	// Listen for combat events
	CombatRemotes.Client.Get("CombatHit").Connect((hitEvent) => {
		print(`Combat Hit: ${hitEvent.attacker.Name} dealt ${hitEvent.damage} damage to ${hitEvent.target.Name}`);
		if (hitEvent.isCritical) {
			print("CRITICAL HIT!");
		}
	});

	CombatRemotes.Client.Get("CombatMiss").Connect((attacker, target, reason) => {
		print(`Combat Miss: ${attacker.Name} missed ${target.Name} (${reason})`);
	});

	CombatRemotes.Client.Get("WeaponEquipped").Connect((equipEvent) => {
		print(`${equipEvent.entity.Name} equipped ${equipEvent.weaponName}`);
	});

	// Key bindings for testing
	UserInputService.InputBegan.Connect((input, gameProcessed) => {
		if (gameProcessed) return;

		if (input.KeyCode === Enum.KeyCode.T) {
			// Test attack on nearest target (player or NPC)
			const nearestTarget = findNearestTarget("all");
			if (nearestTarget !== undefined) {
				print(`Testing attack on ${nearestTarget.Name}`);
				CombatRemotes.Client.Get("ExecuteBasicAttack").SendToServer(nearestTarget);
			} else {
				print("No valid target found for attack test");
			}
		}

		if (input.KeyCode === Enum.KeyCode.N) {
			// Test attack on nearest NPC specifically
			const nearestNPC = findNearestTarget("npcs");
			if (nearestNPC !== undefined) {
				print(`Testing attack on NPC: ${nearestNPC.Name}`);
				CombatRemotes.Client.Get("ExecuteBasicAttack").SendToServer(nearestNPC);
			} else {
				print("No NPCs found for attack test");
			}
		}

		if (input.KeyCode === Enum.KeyCode.One) {
			// Equip fists
			print("Equipping fists");
			CombatRemotes.Client.Get("RequestWeaponEquip").SendToServer("fists");
		}

		if (input.KeyCode === Enum.KeyCode.Two) {
			// Equip basic sword
			print("Equipping basic sword");
			CombatRemotes.Client.Get("RequestWeaponEquip").SendToServer("basic_sword");
		}

		if (input.KeyCode === Enum.KeyCode.Three) {
			// Equip soul blade
			print("Equipping soul blade");
			CombatRemotes.Client.Get("RequestWeaponEquip").SendToServer("soul_blade");
		}

		if (input.KeyCode === Enum.KeyCode.R) {
			// Spawn NPCs and run demo
			print("Requesting NPC demo start");
			CombatRemotes.Client.Get("SpawnTestNPCs").SendToServer();
		}
	});

	print("Combat Test Controls:");
	print("T - Attack nearest target (player or NPC)");
	print("1 - Equip Fists");
	print("2 - Equip Basic Sword");
	print("3 - Equip Soul Blade");
}

function findNearestTarget(targetType: "all" | "npcs" | "players" = "all"): SSEntity | undefined {
	const player = Players.LocalPlayer;
	if (player.Character === undefined) return undefined;

	const character = player.Character as SSEntity;
	const playerPosition = character.HumanoidRootPart?.Position;
	if (playerPosition === undefined) return undefined;

	let nearestTarget: SSEntity | undefined;
	let minDistance = math.huge;
	const allTargets: SSEntity[] = [];

	// Add players if requested
	if (targetType === "all" || targetType === "players") {
		for (const targetPlayer of Players.GetPlayers()) {
			if (targetPlayer !== player && targetPlayer.Character !== undefined) {
				if (isSSEntity(targetPlayer.Character)) {
					allTargets.push(targetPlayer.Character);
				}
			}
		}
	}

	// Add NPCs if requested
	if (targetType === "all" || targetType === "npcs") {
		for (const child of Workspace.GetChildren()) {
			if (classIs(child, "Model") && isSSEntity(child)) {
				allTargets.push(child);
			}
		}
	}

	// Find nearest target (excluding self)
	for (const target of allTargets) {
		const targetPosition = target.HumanoidRootPart?.Position;
		if (targetPosition !== undefined && target !== character) {
			const distance = playerPosition.sub(targetPosition).Magnitude;
			if (distance < minDistance) {
				minDistance = distance;
				nearestTarget = target;
			}
		}
	}

	return nearestTarget;
}

// Initialize the test system
print("Combat Test Client loaded!");
print("Controls:");
print("  T - Attack nearest target (players or NPCs)");
print("  N - Attack nearest NPC specifically");
print("  1 - Equip Fists");
print("  2 - Equip Basic Sword");
print("  3 - Equip Soul Blade");
print("  R - Spawn 3 test NPCs and run health demo");
testCombatSystem();
