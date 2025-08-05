/**
 * @fileoverview Network Communication module - Client-server communication definitions
 * @module shared/network
 * @layer Shared/Network
 * @description
 * This module defines all client-server communication interfaces using @rbxts/net.
 * It contains remote event and function definitions that enable secure and
 * type-safe communication between client and server code.
 *
 * **Folder Purpose:**
 * - Contains remote event and function definitions for client-server communication
 * - Provides type-safe network interfaces using @rbxts/net
 * - Organizes communication channels by functional area (abilities, game cycle, etc.)
 * - Maintains centralized network protocol definitions
 *
 * **Design Consistency Guidelines:**
 * - All remotes should use @rbxts/net Definitions.Create() pattern
 * - Never manually wrap ServerAsyncFunction return types in Promise<T>
 * - Use descriptive SCREAMING_SNAKE_CASE names for remote identifiers
 * - Include comprehensive type annotations for all remote parameters
 * - Group related remotes into logical categories (abilities, UI, game state, etc.)
 * - Implement proper server-side validation for all client inputs
 * - Follow security best practices - never trust client data without validation
 *
 * **File Creation Guidelines:**
 * - Name files descriptively: `[category]-remotes.ts` (e.g., `ability-remotes.ts`)
 * - Import necessary types from shared modules for parameter typing
 * - Export remote definition objects with clear naming conventions
 * - Include comprehensive TS-Doc headers documenting remote usage and security
 * - Follow pattern: Imports → Type Definitions → Remote Definitions
 * - Consider rate limiting and abuse prevention for client-callable remotes
 * - Document expected behavior and error conditions for each remote
 * - Maintain backwards compatibility when updating remote signatures
 *
 * @author Trembus
 * @license MIT
 * @since 0.1.0
 * @lastUpdated 2025-07-24 by Trembus - Added comprehensive documentation
 */

export * from "./ability-remotes";
export * from "./attribute-remotes";
export * from "./combat-remotes";
export * from "./effect-remotes";
export * from "./game-cycle-remotes";
export * from "./message-remotes";
// export * from "./game-cycle-remotes"; // Currently unused - uncomment when needed
