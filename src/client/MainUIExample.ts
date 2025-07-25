import Fusion, { New, Children, Value } from "@rbxts/fusion";
import { EventButton } from "./client-ui/buttons/EventButton";
import { SignalKey, EventKey, AbilityKey, ABILITY_KEYS } from "shared/keys";
import { Players } from "@rbxts/services";

/**
 * @fileoverview Example integration of EventButton into main UI
 * @module client/MainUIExample
 * @layer Client/UI
 * @description
 * Shows how to integrate EventButton components into your main game UI
 * for ability activation, player data management, and game events.
 * 
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 */

function createMainGameUI() {
    // Reactive states for UI
    const playerHealth = Value(100);
    const playerMana = Value(50);
    const isInCombat = Value(false);

    return New("ScreenGui")({
        Name: "MainGameUI",
        ResetOnSpawn: false,
        [Children]: {
            // Main UI Frame
            MainFrame: New("Frame")({
                Name: "MainFrame",
                Size: UDim2.fromScale(1, 1),
                BackgroundTransparency: 1,
                [Children]: {
                    // Ability Bar
                    AbilityBar: createAbilityBar(),
                    
                    // Player Info Panel
                    PlayerInfoPanel: createPlayerInfoPanel(playerHealth, playerMana),
                    
                    // Game Control Buttons
                    GameControls: createGameControls(),
                }
            })
        }
    });
}

function createAbilityBar() {
    const buttons: { [key: string]: Instance } = {};
    
    // Create a button for each ability
    ABILITY_KEYS.forEach((ability, index) => {
        // Convert ability name for display (e.g., "Ice-Rain" to "Ice Rain")
        const parts = ability.split("-");
        const displayName = parts.join(" ");
        
        buttons[`${ability}Button`] = EventButton({
            text: displayName,
            signalKey: "ABILITY_ACTIVATE" as SignalKey,
            eventParams: [ability],
            Position: UDim2.fromScale(index * 0.25, 0.9),
            Size: UDim2.fromOffset(120, 50),
            onSignalResponse: (response: unknown) => {
                const success = response as boolean;
                if (success) {
                    print(`${ability} activated successfully!`);
                    // You could trigger visual effects here
                } else {
                    warn(`${ability} failed to activate`);
                    // Show error feedback to user
                }
            },
            onSignalError: (err: string) => {
                warn(`Network error activating ${ability}:`,err);
                // Show network error message
            }
        });
    });

    return New("Frame")({
        Name: "AbilityBar",
        Size: UDim2.fromScale(1, 0.1),
        Position: UDim2.fromScale(0, 0.9),
        BackgroundTransparency: 0.5,
        BackgroundColor3: Color3.fromRGB(0, 0, 0),
        [Children]: buttons
    });
}

function createPlayerInfoPanel(playerHealth: Fusion.Value<number>, playerMana: Fusion.Value<number>) {
    return New("Frame")({
        Name: "PlayerInfoPanel",
        Size: UDim2.fromOffset(200, 150),
        Position: UDim2.fromOffset(10, 10),
        BackgroundTransparency: 0.3,
        BackgroundColor3: Color3.fromRGB(50, 50, 50),
        [Children]: {
            // Refresh Data Button
            RefreshButton: EventButton({
                text: "Refresh Stats",
                signalKey: "GET_PLAYER_DATA" as SignalKey,
                eventParams: [tostring(Players.LocalPlayer?.UserId)],
                Position: UDim2.fromScale(0.05, 0.05),
                Size: UDim2.fromOffset(180, 30),
                onSignalResponse: (data: unknown) => {
                    // Type guard the response
                    if (data as { health: number; mana: number }) {
                        const playerData = data as { health: number; mana: number };
                        playerHealth.set(playerData.health);
                        playerMana.set(playerData.mana);
                        print("Player data refreshed!");
                    }
                },
                onSignalError: (err: string) => {
                    warn("Failed to refresh player data:",err);
                }
            }),

            // Quick Heal Button
            HealButton: EventButton({
                text: "Quick Heal",
                signalKey: "SET_PLAYER_DATA" as SignalKey,
                eventParams: [
                    tostring(Players.LocalPlayer?.UserId),
                    { health: 100 }
                ],
                Position: UDim2.fromScale(0.05, 0.3),
                Size: UDim2.fromOffset(85, 30),
                onSignalResponse: (response: unknown) => {
                    const success = response as boolean;
                    if (success) {
                        playerHealth.set(100);
                        print("Healed to full health!");
                    }
                }
            }),

            // Quick Mana Button  
            ManaButton: EventButton({
                text: "Restore MP",
                signalKey: "SET_PLAYER_DATA" as SignalKey,
                eventParams: [
                    tostring(Players.LocalPlayer?.UserId),
                    { mana: 100 }
                ],
                Position: UDim2.fromScale(0.52, 0.3),
                Size: UDim2.fromOffset(85, 30),
                onSignalResponse: (response: unknown) => {
                    const success = response as boolean;
                    if (success) {
                        playerMana.set(100);
                        print("Mana restored!");
                    }
                }
            }),

            // Health Display
            HealthLabel: New("TextLabel")({
                Text: Fusion.Computed(() => `Health: ${playerHealth.get()}`),
                Position: UDim2.fromScale(0.05, 0.55),
                Size: UDim2.fromOffset(180, 20),
                BackgroundTransparency: 1,
                TextColor3: Color3.fromRGB(255, 255, 255),
                TextScaled: true,
                Font: Enum.Font.SourceSans,
            }),

            // Mana Display
            ManaLabel: New("TextLabel")({
                Text: Fusion.Computed(() => `Mana: ${playerMana.get()}`),
                Position: UDim2.fromScale(0.05, 0.75),
                Size: UDim2.fromOffset(180, 20),
                BackgroundTransparency: 1,
                TextColor3: Color3.fromRGB(100, 150, 255),
                TextScaled: true,
                Font: Enum.Font.SourceSans,
            }),
        }
    });
}

function createGameControls() {
    return New("Frame")({
        Name: "GameControls",
        Size: UDim2.fromOffset(200, 100),
        Position: UDim2.fromOffset(10, 200),
        BackgroundTransparency: 0.3,
        BackgroundColor3: Color3.fromRGB(50, 50, 50),
        [Children]: {
            // Ready Button (Event-based)
            ReadyButton: EventButton({
                text: "Mark Ready",
                eventKey: "CLIENT_READY" as EventKey,
                eventParams: [],
                Position: UDim2.fromScale(0.05, 0.1),
                Size: UDim2.fromOffset(180, 35),
                onClick: () => {
                    print("Marked as ready! Server will be notified.");
                }
            }),

            // Resource Update Notification (Event-based)
            ResourceButton: EventButton({
                text: "Found Treasure!",
                eventKey: "RESOURCE_UPDATED" as EventKey,
                eventParams: ["gold", 50, "treasure_chest"],
                Position: UDim2.fromScale(0.05, 0.55),
                Size: UDim2.fromOffset(180, 35),
                onClick: () => {
                    print("Notified server about treasure find!");
                }
            }),
        }
    });
}

// Export for use in main client script
export { createMainGameUI };
