/**
 * @file src/server/services/npc-service.ts
 * @module NPCService
 * @layer Server/Services
 * @description Production NPC service that spawns catalog models around Spawn points
 *
 * Responsibilities:
 * - Discover spawn anchors (SpawnLocation instances or parts named "SpawnPoint")
 * - Spawn configured NPC catalog models around each anchor
 * - Track spawned NPCs for potential future cleanup/management
 *
 * Notes:
 * - Uses the shared NPC model catalog (cloneNPCModel)
 * - Keeps scope small: spawning only (no AI/combat here)
 */
import { Workspace } from "@rbxts/services";
import { cloneNPCModel } from "shared/catalogs/npc-model-catalog";
import type { NPCModelKey } from "shared/catalogs/npc-model-catalog";

interface SpawnedNPC {
	id: string;
	model: Model;
	spawnAnchor: BasePart;
}

export class NPCService {
	private static instance?: NPCService;
	public static getInstance(): NPCService {
		if (!NPCService.instance) NPCService.instance = new NPCService();
		return NPCService.instance;
	}

	private initialized = false;
	private spawned: SpawnedNPC[] = [];

	// Initial catalog keys to spawn around each anchor
	// Assumption: these keys exist in NPC_MODEL_CATALOG
	private readonly initialNPCKeys: NPCModelKey[] = ["goblin", "skeleton", "blood_toad"];

	private constructor() {}

	/** Initialize NPC spawning once on server start */
	public Initialize(): void {
		if (this.initialized) return;
		this.initialized = true;

		const anchors = this.findSpawnAnchors();
		if (anchors.size() === 0) {
			warn("NPCService: No SpawnLocation or 'SpawnPoint' anchors found in Workspace.");
			return;
		}

		for (const anchor of anchors) {
			this.spawnAroundAnchor(anchor, this.initialNPCKeys);
		}

		print(`NPCService: Spawned NPCs at ${anchors.size()} spawn anchor(s).`);
	}

	/** Find SpawnLocations or parts named 'SpawnPoint' as anchors */
	private findSpawnAnchors(): BasePart[] {
		const anchors: BasePart[] = [];
		for (const inst of Workspace.GetDescendants()) {
			// SpawnLocation is a class; also allow any BasePart named 'SpawnPoint'
			if (inst.IsA("SpawnLocation")) {
				anchors.push(inst);
			} else if (inst.IsA("BasePart") && inst.Name === "SpawnPoint") {
				anchors.push(inst);
			}
		}
		// Fallback: if nothing found, use first SpawnLocation directly under Workspace if present
		const rootSpawn = Workspace.FindFirstChildOfClass("SpawnLocation");
		if (anchors.size() === 0 && rootSpawn) anchors.push(rootSpawn);
		return anchors;
	}

	/** Spawn a ring of NPCs around a given anchor */
	private spawnAroundAnchor(anchor: BasePart, modelKeys: NPCModelKey[], radius = 14): void {
		const center = anchor.Position.add(new Vector3(0, 0, 0));
		const count = modelKeys.size();
		if (count === 0) return;

		for (let i = 0; i < count; i++) {
			const theta = (i / count) * math.pi * 2;
			const offset = new Vector3(math.cos(theta) * radius, 0, math.sin(theta) * radius);
			const pos = center.add(offset);

			const key = modelKeys[i];
			const model = cloneNPCModel(key, pos, `${key}_NPC_${i + 1}`);
			if (!model) {
				warn(`NPCService: Failed to clone NPC model '${key}'.`);
				continue;
			}

			// Parent and basic setup
			model.Parent = Workspace;

			// Track
			this.spawned.push({ id: `${key}_${i + 1}_${tostring(time())}`, model, spawnAnchor: anchor });
		}
	}

	/** Despawn all NPCs spawned by this service */
	public DespawnAll(): void {
		for (const npc of this.spawned) {
			if (npc.model.Parent) npc.model.Destroy();
		}
		this.spawned.clear();
		print("NPCService: Despawned all managed NPCs.");
	}
}

export const NPCServiceInstance = NPCService.getInstance();
