/**
 * ## Overview
 *
 * The @rex/docker module contains deployment and tasks for docker to use with the
 * rex cli and `rexfile.ts` files.  Additionally it containers various functions for
 * interacting with docker and docker compose.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io/@rex/docker/doc](https://jsr.io/@rex/docker/doc)
 *
 * Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)
 *
 * ## Basic Usage
 *
 * ```ts
 * import { deployCompose } from "@rex/docker"
 *
 * deployCompose({
 *     id: "whoami",
 *     with: {
 *         files: ["./src/whoami/${REX_CONTEXT}.compose.yaml"],
 *     },
 * })
 *
 * // rex deploy whoami
 * ```
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
export { down, up } from "./tasks.ts";
export type { ComposeDownTaskDef, ComposeUpTaskDef } from "./tasks.ts";
export { deployCompose } from "./deployments.ts";
export type { ComposeDeploymentDef } from "./deployments.ts";
export * from "./commands.ts";
export { compose } from "./compose/command.ts";
