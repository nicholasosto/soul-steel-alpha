/**
 * @file src/server/services/npc-migration-helper.ts
 * @module NPCMigrationHelper
 * @layer Server/Services
 * @description Helper functions to migrate from old NPC services to the unified service
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 */

import { UnifiedNPCServiceInstance, type NPCConfig } from "./unified-npc-service";
import type { BasicNPCType, BasicNPCConfig } from "./npc-service";
import type { NPCType, NPCConfig as EnhancedNPCConfig } from "./enhanced-npc-service";

/**
 * Migration helper for transitioning from old NPC services
 */
export class NPCMigrationHelper {
	/**
	 * Migrate from BasicNPCService to UnifiedNPCService
	 * Drop-in replacement for NPCServiceInstance.SpawnNPC()
	 */
	public static SpawnBasicNPC(npcType: BasicNPCType, position: Vector3, config?: BasicNPCConfig) {
		const unifiedConfig: NPCConfig = {
			mode: "basic",
			level: config?.level,
			health: config?.health,
			enableCombat: false,
			enableResourceManagement: false,
			enableAdvancedAI: false,
		};

		return UnifiedNPCServiceInstance.SpawnNPC(npcType, position, unifiedConfig);
	}

	/**
	 * Migrate from EnhancedNPCService to UnifiedNPCService
	 * Drop-in replacement for EnhancedNPCServiceInstance.SpawnNPC()
	 */
	public static SpawnEnhancedNPC(npcType: NPCType, position: Vector3, config?: EnhancedNPCConfig) {
		const unifiedConfig: NPCConfig = {
			mode: "enhanced",
			level: config?.level,
			health: config?.health,
			aggroRange: config?.aggroRange,
			isHostile: config?.isHostile,
			enableCombat: true,
			enableResourceManagement: true,
			enableAdvancedAI: true,
		};

		return UnifiedNPCServiceInstance.SpawnNPC(npcType, position, unifiedConfig);
	}

	/**
	 * Create a lightweight NPC (minimal features for performance)
	 */
	public static SpawnLightweightNPC(npcType: string, position: Vector3, config?: Partial<NPCConfig>) {
		const lightweightConfig: NPCConfig = {
			mode: "basic",
			enableCombat: false,
			enableResourceManagement: false,
			enableAdvancedAI: false,
			isHostile: false,
			...config,
		};

		return UnifiedNPCServiceInstance.SpawnNPC(npcType, position, lightweightConfig);
	}

	/**
	 * Create a full-featured combat NPC
	 */
	public static SpawnCombatNPC(npcType: string, position: Vector3, config?: Partial<NPCConfig>) {
		const combatConfig: NPCConfig = {
			mode: "enhanced",
			enableCombat: true,
			enableResourceManagement: true,
			enableAdvancedAI: true,
			isHostile: true,
			...config,
		};

		return UnifiedNPCServiceInstance.SpawnNPC(npcType, position, combatConfig);
	}
}

// Use NPCMigrationHelper.SpawnBasicNPC() etc. directly
