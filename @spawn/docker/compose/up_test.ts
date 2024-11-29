import { equal, ok } from "@bearz/assert";
import { skip } from "@bearz/testing";
import { up, type UpArgs } from "./up.ts";

import { pathFinder } from "@bearz/exec/path-finder";

const test = Deno.test;
const noDocker = undefined === await pathFinder.findExe("docker");

test("@spawn/docker::compose parse up args", () => {
    const params: UpArgs = {
        file: ["docker-compose.yml", "docker-compose.override.yml"],
        projectName: "test",
        wait: true,
        services: ["one"],
    };

    const args = up(params).toArgs();
    const expected = [
        "docker",
        "compose",
        "--file",
        "docker-compose.yml",
        "--file",
        "docker-compose.override.yml",
        "--project-name",
        "test",
        "up",
        "--wait",
        "one",
    ];
    try {
        equal(args, expected);
    } catch (e) {
        console.log(args);
        console.log(expected);
        throw e;
    }
});

test("compose::up help", skip(noDocker), async () => {
    const result = await up({ help: true });
    equal(result.code, 0);
    ok(result.text().trim().startsWith("Usage"));
});
