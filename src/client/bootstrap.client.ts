/**
 * @file src/client/bootstrap.client.ts
 * @description Minimal bootstrap that only starts the Loading UI as early as possible.
 * This isolates the loader from other module import errors in main.client.ts.
 */
import { startLoader } from "./loader";

startLoader();
