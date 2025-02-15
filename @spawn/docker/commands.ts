import { docker as command, login, logout, search } from "./command.ts";
import * as context from "./context/mod.ts";
import * as config from "./config/mod.ts";
import * as container from "./container/mod.ts";
import * as image from "./image/mod.ts";
import * as network from "./network/mod.ts";
import * as node from "./node/mod.ts";
import * as secret from "./secret/mod.ts";
import * as service from "./service/mod.ts";
import * as stack from "./stack/mod.ts";
import * as swarm from "./swarm/mod.ts";
import * as system from "./system/mod.ts";
import * as volume from "./volume/mod.ts";

export {
    command,
    config,
    container,
    context,
    image,
    login,
    logout,
    network,
    node,
    search,
    secret,
    service,
    stack,
    swarm,
    system,
    volume,
};

/**
 * Creates an executable DockerCommand that attaches to a running container.
 * @param args The arguments for the Docker attach command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export const attach = container.attach;
/**
 * Creates an executable DockerCommand that builds an image from a Dockerfile.
 * @param args The arguments for the Docker build command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export const build = image.build;
/**
 * Creates an executable DockerCommand that commits a container's changes to an image.
 * @param args The arguments for the Docker commit command.
 * @param options The options for the Docker command.
 * @returns `DockerCommand`.
 */
export const commit = container.commit;
export const cp = container.cp;
export const create = container.create;
export const diff = container.diff;
export const exec = container.exec;
export const exports = container.exports;
export const events = system.events;
export const imports = image.imports;
export const info = system.info;
export const inspect = container.inspect;
export const kill = container.kill;
export const load = image.load;
export const logs = container.logs;
export const pause = container.pause;
export const port = container.port;
export const pull = image.pull;
export const push = image.push;
export const ps = container.ls;
export const rename = container.rename;
export const restart = container.restart;
export const rm = container.rm;
export const rmi = image.rm;
export const run = container.run;
export const save = image.save;
export const start = container.start;
export const stats = container.stat;
export const stop = container.stop;
export const tag = image.tag;
export const top = container.top;
