/**
 * ## Overview
 *
 * The `@rex/ssh-native` module provides rex tasks for running
 * ssh and scp commands and provides helper functions for ssh,
 * scp, sshAdd, and sshKeygen.
 *
 * The primary rex tasks are `sshTask` and `scpTask`
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io/@rex/ssh-native/doc](https://jsr.io/@rex/ssh-native/doc)
 *
 * Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)
 *
 * ## Basic Usage
 *
 * ```ts
 * import { task, fs } from "@rex/rexfile"
 * import { ssh, sshTask } from "@rex/ssh-native"
 *
 * task(`install`, async (rex) => {
 *     const user = rex.env.get(`${vm}_USER`)
 *     const ip = rex.env.get(`${vm}_IP`)
 *
 *     const script = await fs.readTextFile("./scripts/server_setup.sh")
 *
 *     rex.writer.info(`running setup for ${ip}`)
 *     const o = await ssh({
 *         dest: `${user}@${ip}`,
 *         command: script
 *     }).run()
 *
 *     o.validate()
 * });
 *
 * sshTask("uptime", {
 *     user: "user",
 *     host: "10.2.3.3",
 *     command: "uptime"
 * })
 *
 * sshTask("install2", {
 *     user: "${VM_USER}",
 *     host: "${VM_IP}",
 *     file: "./scripts/install.sh"
 * })
 *
 * // rex task uptime
 * ```
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
export { scp, ssh, sshAdd, sshKeygen } from "./commands.ts";
export * from "./tasks.ts";
