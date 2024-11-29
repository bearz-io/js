import { skip } from "@bearz/testing";
import { equal } from "@bearz/assert";
import { sshKeygen } from "./command.ts";
import { exists, remove } from "@bearz/fs";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noSshKeygen = undefined === await pathFinder.findExe("ssh-keygen");

test("@spawn/ssh/keygen - test rsa creation", skip(noSshKeygen), async () => {
    const result = await sshKeygen("-t rsa -b 4096 -N '' -f ./id_rsa", {
        log: (f, a) => console.log(f, a),
    });

    try {
        equal(result.code, 0);
    } finally {
        if (await exists("./id_rsa")) {
            await remove("./id_rsa");
        }

        if (await exists("./id_rsa.pub")) {
            await remove("./id_rsa.pub");
        }
    }
});
