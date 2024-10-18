import { fail, stringIncludes } from "@bearz/assert";
import { dirname, fromFileUrl } from "@std/path";

const test = Deno.test;

const dir = dirname(fromFileUrl(import.meta.url));

test("process::stdout", async () => {
    const cmd = new Deno.Command("deno", {
        args: ["run", "-A", `${dir}/_write_stdout.ts`],
    });

    const { code, stdout, stderr } = await cmd.output();
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);

    if (code !== 0) {
        fail(`deno run failed ${output} ${errorOutput}`);
    }

    stringIncludes(output, "writeSync");
    stringIncludes(output, "write");
});

test("process::stderr", async () => {
    const cmd = new Deno.Command("deno", {
        args: ["run", "-A", `${dir}/_write_stderr.ts`],
    });

    const { code, stdout, stderr } = await cmd.output();
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);

    if (code !== 0) {
        fail(`deno run failed ${output} ${errorOutput}`);
    }

    stringIncludes(errorOutput, "writeSync");
    stringIncludes(errorOutput, "write");
});

test("process::stdin", async () => {
    const cmd = new Deno.Command("deno", {
        args: ["run", "-A", `${dir}/_read_stdin.ts`],
        stdin: "piped",
        stdout: "piped",
        stderr: "piped",
    });

    const child = cmd.spawn();
    const writer = child.stdin.getWriter();

    writer.write(new TextEncoder().encode("hello world"));
    writer.close();

    const { code, stdout, stderr } = await child.output();
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);

    if (code !== 0) {
        fail(`deno run failed ${output} ${errorOutput}`);
    }

    stringIncludes(output, "hello world");
});
