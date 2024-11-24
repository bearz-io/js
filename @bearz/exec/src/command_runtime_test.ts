import { equal, fail, nope, notEqual, ok, throws } from "@bearz/assert";
import { skip } from "@bearz/assert/skip";
import { Command, exec, ShellCommand, type ShellCommandOptions } from "./command.ts";
import { RUNTIME, WINDOWS } from "@bearz/runtime-info";
import { env } from "@bearz/env";
import { remove, writeTextFile } from "@bearz/fs";
import { dirname, fromFileUrl } from "@std/path";
import { pathFinder } from "./path_finder.ts";

const test = Deno.test;
const EOL = WINDOWS ? "\r\n" : "\n";
const g = globalThis as { DEBUG?: boolean };
const debug = g.DEBUG;

if (WINDOWS) {
    pathFinder.set("echo", {
        name: "echo",
        "envVariable": "ECHO_EXE",
        windows: [
            "C:\\Program Files\\Git\\usr\\bin\\echo.exe",
            "C:\\Program Files(x86)\\Git\\usr\\bin\\echo.exe",
        ],
    });

    pathFinder.set("ls", {
        name: "ls",
        "envVariable": "LS_EXE",
        windows: [
            "C:\\Program Files\\Git\\usr\\bin\\ls.exe",
            "C:\\Program Files(x86)\\Git\\usr\\bin\\ls.exe",
        ],
    });

    pathFinder.set("grep", {
        name: "grep",
        "envVariable": "GREP_EXE",
        windows: [
            "C:\\Program Files\\Git\\usr\\bin\\grep.exe",
            "C:\\Program Files(x86)\\Git\\usr\\bin\\grep.exe",
        ],
    });

    pathFinder.set("cat", {
        name: "cat",
        "envVariable": "CAT_EXE",
        windows: [
            "C:\\Program Files\\Git\\usr\\bin\\cat.exe",
            "C:\\Program Files(x86)\\Git\\usr\\bin\\cat.exe",
        ],
    });
}

const echo = await pathFinder.findExe("echo");
const ls = await pathFinder.findExe("ls");
const grep = await pathFinder.findExe("grep");
const cat = await pathFinder.findExe("cat");
const pwsh = await pathFinder.findExe("pwsh");
const git = await pathFinder.findExe("git");

test("exec::Command - with simple output", async () => {
    let exe = "deno";
    let cmd = "which";
    switch (RUNTIME) {
        case "node":
            exe = "node";
            break;
        case "bun":
            exe = "bun";
            break;
    }

    if (WINDOWS) {
        exe += ".exe";
        cmd = "where.exe";
    }

    const cmd2 = new Command(cmd, [exe]);
    const output = await cmd2.output();
    equal(output.code, 0);
    ok(output.text().trim().endsWith(exe));
});

test("exec::Command - with inherit returns no output", skip(!echo), async () => {
    const cmd = new Command("echo", ["hello"], { stdout: "inherit" });
    const output = await cmd.output();
    equal(output.code, 0);
    equal(output.stdout.length, 0);
    equal(output.text(), "");
});

test("exec::Command - with bad command returns error", skip(!git), async () => {
    const cmd = new Command("git", ["clone"], { stderr: "piped", stdout: "piped" });
    const output = await cmd.output();
    ok(output.code !== 0);
    notEqual(output.stderr.length, 0);
    notEqual(output.errorText(), "");
});

test("exec::exec runs inline command", skip(!git), async () => {
    const cmd = exec(`git status \
    --porcelain`);
    const output = await cmd.output();
    ok(output.code === 0);
});

test("exec::Command - set cwd", skip(!ls), async () => {
    const dir = dirname(fromFileUrl(import.meta.url));
    const cmd2 = new Command("ls", ["-l"], { cwd: dir });
    const output2 = await cmd2.output();
    equal(output2.code, 0);
    ok(output2.text().includes("command.ts"));

    const home = env.get("HOME") || env.get("USERPROFILE") || ".";
    const cmd = new Command("ls", ["-l"], { cwd: home });
    const output = await cmd.output();
    equal(output.code, 0);
    nope(output.text().includes("base.ts"));
});

test("exec::Command - spawn", skip(!echo), async () => {
    const cmd = new Command("echo", ["hello"]);
    const process = await cmd.spawn();
    const output = await process.output();
    equal(output.code, 0);
    // should default to inherits
    equal(output.stdout.length, 0);
});

test("exec::Command - spawn with piped options", skip(!echo), async () => {
    const cmd = new Command("echo", ["hello"], {
        stdout: "piped",
        stderr: "piped",
    });
    const process = await cmd.spawn();
    const output = await process.output();
    equal(output.code, 0);
    // should default to inherits
    equal(output.stdout.length, 6);
});

test("exec::Command - await the command", async () => {
    const cmd = new Command("echo", ["hello"]);
    const output = await cmd;
    equal(output.code, 0);
    equal(output.text(), "hello\n");
});

test("exec::Command return text", skip(!echo), async () => {
    const cmd = new Command("echo", ["hello"]);
    const output = await cmd.text();
    equal(output, "hello\n");
});

test("exec::Command return lines", skip(!echo), async () => {
    const cmd = new Command("echo", ["hello"]);
    const output = await cmd.lines();
    equal(output.length, 2);
    equal(output[0], "hello");
    equal(output[1], "");
});

test(
    "exec::Command - pipe to invoke echo, grep, and cat",
    skip(!echo || !grep || !cat),
    async () => {
        const result = await new Command("echo", "my test")
            .pipe("grep", "test")
            .pipe("cat")
            .output();

        equal(result.code, 0);

        if (debug) {
            console.log(result.text());
        }
    },
);

test("exec::Command - output to json", skip(!echo), async () => {
    const cmd = new Command("echo", ['{"hello": "world"}']);
    const output = await cmd.json() as Record<string, string>;
    equal(output.hello, "world");
});

test("exec::Command with log", skip(!echo), async () => {
    let f: string = "";
    let args: string[] | undefined = [];

    const cmd = new Command(echo!, ["hello"], {
        log: (file, a) => {
            f = file;
            args = a;
        },
    });
    const output = await cmd.output();
    equal(output.code, 0);
    if (WINDOWS) {
        ok(f.endsWith("echo.exe"));
    } else {
        ok(f.endsWith("echo"));
    }

    ok(args !== undefined, "args is undefined");
    equal(args.length, 1);
});

test("exec::Command - use validate on output", skip(!echo), async () => {
    const cmd = new Command("echo", ["hello"]);
    const output = await cmd.output();
    try {
        output.validate();
    } catch (_e) {
        fail("Should not throw");
    }

    const cmd2 = new Command("git", ["clone"], { stderr: "piped", stdout: "piped" });
    const output2 = await cmd2.output();
    throws(() => output2.validate());
    try {
        output2.validate((_) => true);
    } catch (_e) {
        fail("Should not throw");
    }
});

class Pwsh extends ShellCommand {
    constructor(script: string, options?: ShellCommandOptions) {
        super("pwsh", script, options);
    }

    override get ext(): string {
        return ".ps1";
    }

    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ??
            ["-NoProfile", "-NonInteractive", "-NoLogo", "-ExecutionPolicy", "ByPass"];
        if (isFile) {
            params.push("-File", script);
        } else {
            params.push("-Command", script);
        }

        return params;
    }
}

test("exec::ShellCommand - get expected shell args for pwsh", skip(!pwsh), () => {
    const cmd = new Pwsh("hello.ps1");
    const args = cmd.getShellArgs("hello.ps1", true);
    equal(args.length, 7);
    equal(args[0], "-NoProfile");
    equal(args[1], "-NonInteractive");
    equal(args[2], "-NoLogo");
    equal(args[3], "-ExecutionPolicy");
    equal(args[4], "ByPass");
    equal(args[5], "-File");
});

test("exec::ShellCommand - get ext from command", () => {
    // this isn't executed
    const cmd = new Pwsh("Write-Host 'Hello, World!'");
    const ext = cmd.ext;
    equal(ext, ".ps1");
});

test("exec::ShellCommand - run inline script", skip(!pwsh), async () => {
    const cmd = new Pwsh("Write-Host 'Hello, World!'");
    const output = await cmd.output();
    equal(output.code, 0);
    equal(output.text(), `Hello, World!${EOL}`);
});

test("exec::ShellCommand - run file", skip(!pwsh), async () => {
    await writeTextFile("hello.ps1", "Write-Host 'Hello, World!'");

    try {
        const cmd = new Pwsh("hello.ps1");
        const output = await cmd.output();
        equal(output.code, 0);
        equal(output.text(), `Hello, World!${EOL}`);
    } finally {
        await remove("hello.ps1");
    }
});

test("exec:ShellCommand - use spawn", skip(!pwsh), async () => {
    await writeTextFile("hello2.ps1", "Write-Host 'Hello, World!'");

    try {
        const cmd = new Pwsh("hello2.ps1", { stdout: "piped", stderr: "piped" });
        await using process = cmd.spawn();

        const output = await process.output();
        equal(output.code, 0);
        equal(output.text(), `Hello, World!${EOL}`);
    } finally {
        await remove("hello2.ps1");
    }
});
