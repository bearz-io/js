/**
 * ## Overview
 *
 * @rex/dns provides tasks for registering dns drivers and updating dns records.
 *
 * `registerDnsDriver` is used to make a driver available to the updateDnsTask.
 * `updateDnsTask` is used to add or remove dns records to a zone.
 *
 * If you're using jobs or deployment targets, the tasks will be loaded in order. If you
 * are using task targets, you will need to assign the `registerDnsDriver` and
 * `updateDnsTasks` tasks as required dependencies as needed.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io/@rex/dns/doc](https://jsr.io/@rex/dns/doc)
 *
 * Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)
 *
 * # Register Dns Driver
 *
 * `registerDnsDriver` will register a dns driver by name and driver type. If
 * the driver type has not been imported, it will be auto imported by registering
 * the vault factory responsible for creating vaults and making them globally available.
 *
 * If the driver type module does not exist, then the task will throw an error.
 *
 * When registering a dns driver that has complex configuration, it is best to use the
 * `use` and `with` properties.  For simple configurations, the `uri` property may be easier to use.
 *
 * ```ts
 * // rexfile.ts
 * import { registerDnsDriver } from "@rex/dns"
 *
 * // register the dns driver that uses the flarectl cli.
 * // configuration values can use environment variable interoplation.
 * // for secrets, see the @rex/vaults module
 * registerDnsDriver("flarectl", {
 *     name: "default", // referenced by updateDnsTask to know which dns driver to use
 *     use: "flarectl", // the driver to use.  flarectl will map to @rex/dns-flarectl.
 *     with: {
 *         'api-token': "$CF_API_TOKEN"
 *     }
 * });
 *
 * ```
 *
 * ## Update Dns Records
 *
 * Registering secrets will only pull the secrets that you define into the context as tasks are running.
 *
 * ```ts
 * // rexfile.ts
 * import { updateDnsTask } from "@rex/dns"
 * import { task } from "@rex/tasks"
 *
 * updateDnsTask("update:dns", {
 *     zone: "bearz.host",
 *     use: "default",
 *     records: [{
 *         name: "test1",
 *         type: "A",
 *         value: "10.0.0.70"
 *     }],
 *     remove: ["test2"],
 * }, ["flarectl"]);  // references the flaretcl task
 * ```
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
export * from "./tasks.ts";
export * from "./types.ts";
export * from "./registry.ts";
export * from "./hostfile.ts";
