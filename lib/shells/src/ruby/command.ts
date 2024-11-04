import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    ShellCommand,
    type ShellCommandOptions,
} from "@bearz/exec";
import { isAbsolute, resolve } from "@std/path";
import { makeTempFileSync, writeTextFileSync } from "@bearz/fs";

pathFinder.set("ruby", {
    name: "ruby",
    windows: [],
    linux: [
        "/usr/bin/ruby",
    ],
});

/**
 * File extension for bash scripts.
 */
export const RUBY_EXT = ".rb";

/**
 * Represents a Ruby command.
 */
export class RubyCommand extends Command {
    /**
     * Creates a new instance of the `RubyCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ruby", args, options);
    }
}

/**
 * Represents a bash command executed using the `bash` commandline.
 */
export class RubyScriptCommand extends ShellCommand {
    /**
     * Creates a new instance of the `bashCommand` class.
     * @param script The bash script to execute.
     * @param options The options for the bashell command.
     */
    constructor(script: string, options?: ShellCommandOptions) {
        super("ruby", script.trimEnd(), options);
    }

    /**
     * Gets the file extension associated with bash scripts.
     */
    override get ext(): string {
        return RUBY_EXT;
    }

    override getScriptFile(): { file: string | undefined; generated: boolean } {
        let script = this.script.trimEnd();

        if (!script.match(/\n/) && script.endsWith(this.ext)) {
            script = script.trimStart();
            if (!isAbsolute(script)) {
                script = resolve(script);
            }
            return { file: script, generated: false };
        }

        const file = makeTempFileSync({
            prefix: "script_",
            suffix: this.ext,
        });

        writeTextFileSync(file, script);

        return { file, generated: false };
    }

    /**
     * Gets the bash arguments for executing the bash script.
     * @param script The bash script to execute.
     * @param isFile Specifies whether the script is a file or a command.
     * @returns The bash arguments for executing the script.
     */
    // deno-lint-ignore no-unused-vars
    override getShellArgs(script: string, isFile: boolean): string[] {
        const params = this.shellArgs ?? [];

        params.push(script);

        return params;
    }
}

/**
 * Invokes the `ruby` cli.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the RubyCommand class.
 * @see {RubyCommand}
 * @example
 * ```ts
 * import { ruby } from "@bearz/shells/ruby";
 *
 * const result = await ruby(["-V"]);
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function ruby(args?: CommandArgs, options?: CommandOptions): RubyCommand {
    return new RubyCommand(args, options);
}

/**
 * Executes a ruby inline script or script file using the RubyScriptCommand class.
 *
 * @param script - The ruby script to execute.
 * @param options - Optional options for the ruby shell command.
 * @returns A new instance of the RubyScriptCommand class.
 * @example
 * ```ts
 * import { rubyScript } from "@bearz/shells/ruby";
 *
 * const result = await rubyScript("print('Hello, World!')");
 * console.log(result.code);
 * console.log(result.text());
 * ```
 */
export function rubyScript(script: string, options?: ShellCommandOptions): RubyScriptCommand {
    return new RubyScriptCommand(script, options);
}
