import Fusion, { New, Children } from "@rbxts/fusion";
import { EventButton, EventButtonExamples } from "./buttons/EventButton";
import { SignalKey, EventKey, AbilityKey } from "shared/keys";
import { Players } from "@rbxts/services";

/**
 * @fileoverview EventButton Usage Examples
 * @module client/client-ui/EventButtonExamples
 * @layer Client/UI
 * @description
 * Demonstrates various ways to use the EventButton component with different
 * event keys and signal keys for client-to-server communication.
 * 
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 */

export function createEventButtonExamples() {
    return New("Frame")({
        Name: "EventButtonExamples",
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: {
            // Example 1: Simple ability activation button
            AbilityButton: EventButton({
                ...EventButtonExamples.AbilityButton,
                Position: UDim2.fromScale(0.1, 0.1),
            }),

            // Example 2: Custom ability button with different ability
            EarthquakeButton: EventButton({
                text: "Earthquake",
                signalKey: "ABILITY_ACTIVATE" as SignalKey,
                eventParams: ["Earthquake" as AbilityKey],
                Position: UDim2.fromScale(0.1, 0.2),
                Size: UDim2.fromOffset(150, 60),
                onSignalResponse: (success: unknown) => {
                    if (success) {
                        print("Earthquake ability activated successfully!");
                    } else {
                        warn("Earthquake ability failed to activate");
                    }
                },
                onSignalError: (err: string) => {
                    warn(",error activating Earthquake:",err);
                }
            }),

            // Example 3: Player data request button
            GetDataButton: EventButton({
                ...EventButtonExamples.GetDataButton,
                Position: UDim2.fromScale(0.1, 0.3),
            }),

            // Example 4: Set player data button
            SetDataButton: EventButton({
                text: "Heal to Full",
                signalKey: "SET_PLAYER_DATA" as SignalKey,
                eventParams: [
                    tostring(Players.LocalPlayer?.UserId),
                    { health: 100 } // Partial PlayerData
                ],
                Position: UDim2.fromScale(0.1, 0.4),
                Size: UDim2.fromOffset(150, 40),
                onSignalResponse: (success: unknown) => {
                    if (success) {
                        print("Player data updated successfully!");
                    } else {
                        warn("Failed to update player data");
                    }
                }
            }),

            // Example 5: Fire-and-forget event button
            ClientReadyButton: EventButton({
                ...EventButtonExamples.ClientReadyButton,
                Position: UDim2.fromScale(0.1, 0.5),
            }),

            // Example 6: Custom event with multiple parameters
            CustomEventButton: EventButton({
                text: "Multi-Param Event",
                eventKey: "RESOURCE_UPDATED" as EventKey,
                eventParams: ["gold", 100, "quest_reward"],
                Position: UDim2.fromScale(0.1, 0.6),
                Size: UDim2.fromOffset(150, 40),
                onClick: () => print("Custom multi-parameter event fired")
            }),

            // Example 7: Disabled button state
            DisabledButton: EventButton({
                text: "Disabled",
                signalKey: "ABILITY_ACTIVATE" as SignalKey,
                eventParams: ["Melee" as AbilityKey],
                isDisabled: Fusion.Value(true),
                Position: UDim2.fromScale(0.1, 0.7),
                Size: UDim2.fromOffset(150, 40),
            }),
        }
    });
}

/**
 * Advanced example: Dynamic button creation based on available abilities
 */
export function createAbilityButtonGrid(abilities: AbilityKey[]) {
    const buttons: { [key: string]: Instance } = {};
    
    abilities.forEach((ability, index) => {
        const row = math.floor(index / 3);
        const col = index % 3;
        
        buttons[`${ability}Button`] = EventButton({
            text: ability,
            signalKey: "ABILITY_ACTIVATE" as SignalKey,
            eventParams: [ability],
            Position: UDim2.fromScale(col * 0.35, row * 0.15),
            Size: UDim2.fromOffset(140, 50),
            onSignalResponse: (success: unknown) => {
                print(`${ability} ability result:`, success);
            },
            onSignalError: (err: string) => {
                warn(`${ability} ability error:`,err);
            }
        });
    });

    return New("Frame")({
        Name: "AbilityButtonGrid",
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
        [Children]: buttons
    });
}

/**
 * Example: Event button with confirmation dialog
 */
export function createConfirmationEventButton() {
    const isConfirming = Fusion.Value(false);
    const buttonText = Fusion.Computed(() => isConfirming.get() ? "Confirm?" : "Dangerous Action");
    
    return New("Frame")({
        Name: "ConfirmationButton",
        Size: UDim2.fromOffset(200, 60),
        BackgroundTransparency: 1,
        [Children]: {
            Button: EventButton({
                text: "Dangerous Action", // Static text for now
                signalKey: "SET_PLAYER_DATA" as SignalKey,
                eventParams: [
                    tostring(Players.LocalPlayer?.UserId),
                    { health: 1 } // Set health to 1 (dangerous!)
                ],
                Size: UDim2.fromScale(1, 1),
                onClick: () => {
                    if (!isConfirming.get()) {
                        isConfirming.set(true);
                        // Reset confirmation after 3 seconds
                        task.spawn(() => {
                            task.wait(3);
                            isConfirming.set(false);
                        });
                    }
                },
                onSignalResponse: () => {
                    isConfirming.set(false);
                    print("Dangerous action completed!");
                }
            }),
            
            // Overlay text that changes based on confirmation state
            OverlayText: New("TextLabel")({
                Size: UDim2.fromScale(1, 1),
                BackgroundTransparency: 1,
                Text: buttonText,
                TextColor3: Color3.fromRGB(255, 255, 255),
                TextScaled: true,
                Font: Enum.Font.SourceSansBold,
                ZIndex: 2,
            })
        }
    });
}
