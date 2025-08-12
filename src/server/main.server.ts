/// <reference types="@rbxts/types" />

import MessageService from "./services/message-service";
import { CombatServiceInstance } from "./services/combat-service";
import { UnifiedNPCServiceInstance } from "./services";
// Touch singletons so their constructors run and register operations/signals
import { ResourceServiceInstance } from "./services/resource-service";
import { AbilityServiceInstance } from "./services/ability-service";
import { HumanoidMonitorServiceInstance } from "./services/humanoid-monitor-service";
import { DataServiceInstance } from "./services/data-service";
import { ProgressionServiceInstance } from "./services/progression-service";

print("Soul Steel Alpha server initialized successfully");
MessageService.getInstance();
// Importing the instances runs their module initializers
// Initialize progression service to set up signal connections (already instantiated by import)
CombatServiceInstance.Initialize();
UnifiedNPCServiceInstance.Initialize();
