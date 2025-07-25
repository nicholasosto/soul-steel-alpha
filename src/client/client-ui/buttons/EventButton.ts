import Fusion, { Value, Children, New, Computed, OnEvent, Observer } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";
import { SignalKey, EventKey, AbilityKey } from "shared/keys";
import { AbilityRemotes } from "shared/network";
import { Players } from "@rbxts/services";
import { UI_SIZES } from "shared/constants/ui-constants";

/**
 * @fileoverview EventButton - A Fusion component that can fire client-to-server events
 * @module client/client-ui/buttons/EventButton
 * @layer Client/UI
 * @description
 * A reusable button component that can fire different types of events:
 * - Signal events (client-to-server remote functions that expect responses)
 * - Fire-and-forget events (client-to-server events with no response)
 * 
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 */

export interface EventButtonProps extends Fusion.PropertyTable<ImageButton> {
    /** The text to display on the button */
    text: string;
    
    /** Optional icon to display */
    icon?: string;
    
    /** Background image for the button */
    BackgroundImageId?: string;
    
    /** Whether the button is currently selected */
    isSelected?: Value<boolean>;
    
    /** Whether the button is currently hovered */
    isHovered?: Value<boolean>;
    
    /** Whether the button is disabled */
    isDisabled?: Value<boolean>;
    
    /** Signal key for client-to-server remote functions */
    signalKey?: SignalKey;
    
    /** Event key for fire-and-forget events */
    eventKey?: EventKey;
    
    /** Custom click handler (called after event firing) */
    onClick?: () => void;
    
    /** Parameters to pass to the remote function/event */
    eventParams?: unknown[];
    
    /** Callback for when a signal response is received */
    onSignalResponse?: (response: unknown) => void;
    
    /** Callback for when a signal fails */
    onSignalError?: (err: string) => void;
}

export function EventButton(props: EventButtonProps) {
    const isHovered = props.isHovered ?? Value(false);
    const isSelected = props.isSelected ?? Value(false);
    const isDisabled = props.isDisabled ?? Value(false);

    /** Handle button activation - fires the appropriate event */
    const handleActivation = async () => {
        if (isDisabled.get()) return;
        
        try {
            // Handle signal events (remote functions that expect responses)
            if (props.signalKey) {
                switch (props.signalKey) {
                    case "ABILITY_ACTIVATE":
                        const abilityResult = await AbilityRemotes.Client.Get(props.signalKey).CallServerAsync(
                            ...(props.eventParams as [AbilityKey]) // Ability key
                        );
                        props.onSignalResponse?.(abilityResult);
                        break;
                        
                    case "GET_PLAYER_DATA":
                        const playerData = await AbilityRemotes.Client.Get(props.signalKey).CallServerAsync(
                            ...(props.eventParams as [string]) // Player ID
                        );
                        props.onSignalResponse?.(playerData);
                        break;
                        
                    case "SET_PLAYER_DATA":
                        const setResult = await AbilityRemotes.Client.Get(props.signalKey).CallServerAsync(
                            ...(props.eventParams as [string, Partial<unknown>]) // Player ID, data
                        );
                        props.onSignalResponse?.(setResult);
                        break;
                }
            }
            
            // Handle fire-and-forget events
            if (props.eventKey) {
                // You would implement event firing here based on your event system
                // For example, if you have game cycle events:
                // GameCycleRemotes.Client.Get(props.eventKey).FireServer(...props.eventParams);
                print(`Firing event: ${props.eventKey}`, props.eventParams);
            }
            
            // Call custom click handler
            props.onClick?.();
            
        } catch (err) {
            warn(`EventButton error for ${props.signalKey || props.eventKey}:`,err);
            props.onSignalError?.(tostring(error));
        }
    };

    /** Optional icon image */
    const IconImage = props.icon ? New("ImageLabel")({
        Name: "IconImage",
        Size: UDim2.fromScale(0.2, 0.6),
        AnchorPoint: new Vector2(0, 0.5),
        Position: UDim2.fromScale(0.05, 0.5),
        Image: props.icon,
        ImageColor3: Computed(() => {
            if (isDisabled.get()) return Color3.fromRGB(100, 100, 100);
            if (isHovered.get()) return Color3.fromRGB(255, 255, 255);
            return Color3.fromRGB(200, 200, 200);
        }),
        BackgroundTransparency: 1,
    }) : undefined;

    /** Button text label */
    const TextLabel = New("TextLabel")({
        Name: "ButtonText",
        Size: props.icon ? UDim2.fromScale(0.7, 0.8) : UDim2.fromScale(0.9, 0.8),
        AnchorPoint: new Vector2(0.5, 0.5),
        Position: props.icon ? UDim2.fromScale(0.65, 0.5) : UDim2.fromScale(0.5, 0.5),
        Text: props.text,
        TextColor3: Computed(() => {
            if (isDisabled.get()) return Color3.fromRGB(100, 100, 100);
            if (isSelected.get()) return Color3.fromRGB(255, 255, 255);
            if (isHovered.get()) return Color3.fromRGB(240, 240, 240);
            return Color3.fromRGB(200, 200, 200);
        }),
        TextScaled: true,
        Font: Enum.Font.SourceSansBold,
        BackgroundTransparency: 1,
    });

    /** Main button component */
    const buttonComponent = New("ImageButton")({
        Name: props.Name || "EventButton",
        Size: props.Size ?? UI_SIZES.BUTTON_LARGE,
        Image: props.BackgroundImageId ?? ImageConstants.IconButtonBackground ?? "",
        BackgroundTransparency: Computed(() => {
            if (isDisabled.get()) return 0.8;
            if (isSelected.get()) return 0.2;
            if (isHovered.get()) return 0.5;
            return 0.7;
        }),
        BackgroundColor3: Computed(() => {
            if (isDisabled.get()) return Color3.fromRGB(60, 60, 60);
            if (isSelected.get()) return Color3.fromRGB(46, 209, 237);
            if (isHovered.get()) return Color3.fromRGB(217, 227, 71);
            return Color3.fromRGB(100, 100, 100);
        }),
        Active: Computed(() => !isDisabled.get()),
        [Children]: {
            IconImage: IconImage,
            TextLabel: TextLabel,
        },
        [OnEvent("MouseEnter")]: () => {
            if (!isDisabled.get()) {
                isHovered.set(true);
            }
        },
        [OnEvent("MouseLeave")]: () => isHovered.set(false),
        [OnEvent("Activated")]: () => {
            if (!isDisabled.get()) {
                handleActivation();
            }
        }
    });

    /** Observer for selection state changes */
    Observer(isSelected).onChange(() => {
        print("Observer: EventButton selected state changed to", isSelected.get());
        buttonComponent.SetAttribute("IsSelected", isSelected.get());
    });

    return buttonComponent;
}

/** Example button configurations */
export const EventButtonExamples = {
    /** Button that activates an ability */
    AbilityButton: {
        text: "Ice Rain",
        signalKey: "ABILITY_ACTIVATE" as SignalKey,
        eventParams: ["Ice-Rain" as AbilityKey], // Ability key
        Size: UI_SIZES.BUTTON_LARGE,
        onSignalResponse: (success: unknown) => {
            print("Ability activation result:", success);
        },
        onSignalError: (err: string) => {
            warn("Ability activation failed:", err);
        }
    },
    
    /** Button that requests player data */
    GetDataButton: {
        text: "Get My Data",
        signalKey: "GET_PLAYER_DATA" as SignalKey,
        eventParams: [tostring(Players.LocalPlayer?.UserId)],
        Size: UI_SIZES.SIZE_150_40,
        onSignalResponse: (playerData: unknown) => {
            print("Player data received:", playerData);
        }
    },
    
    /** Button that signals client ready */
    ClientReadyButton: {
        text: "Ready!",
        eventKey: "CLIENT_READY" as EventKey,
        eventParams: [],
        Size: UI_SIZES.SIZE_100_40,
        onClick: () => print("Client marked as ready")
    }
};
