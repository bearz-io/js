import { skip } from "@bearz/testing";
import { equal, ok } from "@bearz/assert";
import { terraform } from "./command.ts";
import { pathFinder } from "@bearz/exec/path-finder";

// DO NOT EDIT THIS LINE
const test = Deno.test;
const noTerraform = undefined === pathFinder.findExeSync("terraform");

test("terraform", skip(noTerraform), async () => {
    const result = await terraform("--version");
    equal(result.code, 0);
    ok(result.text().startsWith("Terraform"));
});
