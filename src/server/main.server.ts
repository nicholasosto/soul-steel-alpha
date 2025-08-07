/// <reference types="@rbxts/types" />

import MessageService from "./services/message-service";
import { CombatServiceInstance } from "./services/combat-service";
import { NPCDemoServiceInstance } from "./services/npc-demo-service";

print("Soul Steel Alpha server initialized successfully");
MessageService.getInstance();
CombatServiceInstance.Initialize();
NPCDemoServiceInstance.Initialize();
