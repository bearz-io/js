import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { ssh } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

const test = Deno.test;
const noSsh = undefined === await pathFinder.findExe("ssh");

test("@spawn/ssh - args", () => {
    let args = ssh({ dest: "user@host", command: "ls", arguments: "-a" }).toArgs();

    let expected = ["ssh", "user@host", "ls", "-a"];
    equal(args, expected);

    args = ssh({
        dest: "user@host",
        options: ["StrictHostKeyChecking=no"],
        forcePseudoTerminal: true,
    }).toArgs();
    expected = ["ssh", "-o", "StrictHostKeyChecking=no", "-t", "user@host"];

    try {
        equal(args, expected);
    } catch (e) {
        console.log("Expected: ", expected);
        console.log("Actual: ", args);
        throw e;
    }
});

test("@spawn/ssh - version", skip(noSsh), async () => {
    const result = await ssh({ dest: "", version: true });
    equal(result.code, 0);
});
