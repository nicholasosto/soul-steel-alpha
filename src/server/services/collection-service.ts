import { CollectionService } from "@rbxts/services";
import { SignalServiceInstance } from "./signal-service";

export const LavaParts: Array<Instance> = CollectionService.GetTagged("LavaPart") as Array<Instance>;
const partConnections: Map<Part, RBXScriptConnection> = new Map();

function addLavaTouchHandler(part: Part) {
	if (partConnections.has(part)) {
		print(`Lava part ${part.Name} already has a touch handler.`);
		return; // Prevent duplicate connections
	}
	const connection = part.Touched.Connect((hit) => {
		if (hit.Parent?.IsA("Model") && hit.Parent.FindFirstChildOfClass("Humanoid")) {
			const humanoid = hit.Parent.FindFirstChildOfClass("Humanoid") as Humanoid;
			if (humanoid?.HasTag("LavaTouched")) {
				print(`Lava already touched by ${hit.Parent.Name}, skipping damage.`);
				return; // Prevent double damage if already tagged
			}

			// Find the player associated with this character
			const player = game.GetService("Players").GetPlayerFromCharacter(hit.Parent);
			if (player) {
				// Use signal-based damage request instead of direct humanoid damage
				SignalServiceInstance.emit("HealthDamageRequested", {
					player,
					amount: 10,
					source: "Lava",
				});
			} else {
				// Fallback to direct damage for NPCs or other entities
				humanoid.TakeDamage(10);
			}

			humanoid.AddTag("LavaTouched");
			task.delay(1, () => {
				humanoid.RemoveTag("LavaTouched");
			});
			print(`Lava touched by ${hit.Parent.Name}, dealt damage.`);
		}
	});
	partConnections.set(part, connection);
	print(`Added touch handler for lava part: ${part.Name}`);
}
LavaParts.forEach((part) => {
	if (part.IsA("Part")) {
		addLavaTouchHandler(part);
	}
});
export function RunLavaParts() {
	CollectionService.GetInstanceAddedSignal("LavaPart").Connect((part) => {
		if (part.IsA("Part")) {
			LavaParts.push(part);
			addLavaTouchHandler(part);
			print(`Lava part added: ${part.Name}`);
		}
	});

	CollectionService.GetInstanceRemovedSignal("LavaPart").Connect((part) => {
		if (part.IsA("Part")) {
			const index = LavaParts.indexOf(part);
			if (index !== -1) {
				LavaParts.remove(index);
				partConnections.get(part)?.Disconnect();
				partConnections.delete(part);
				print(`Lava part removed: ${part.Name}`);
			}
		}
	});
}
