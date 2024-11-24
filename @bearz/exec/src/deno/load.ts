import type { ChildProcess, CommandOptions, CommandStatus, Output, Signal } from "../types.ts";
import { Command, convertCommandArgs, ShellCommand } from "../command_abstractions.ts";
import { remove, removeSync } from "@bearz/fs";
import { CommandError, NotFoundOnPathError } from "../errors.ts";
import { pathFinder } from "../path_finder.ts";

const EMPTY = "";

class DenoChildProcess implements ChildProcess {
    #childProcess: Deno.ChildProcess;
    #options: CommandOptions;
    #file: string;

    constructor(childProcess: Deno.ChildProcess, options: CommandOptions, file: string) {
        this.#childProcess = childProcess;
        this.#options = options;
        this.#file = file;
    }

    get stdin(): WritableStream<Uint8Array> {
        return this.#childProcess.stdin;
    }

    get stdout(): ReadableStream<Uint8Array> {
        return this.#childProcess.stdout;
    }

    get stderr(): ReadableStream<Uint8Array> {
        return this.#childProcess.stderr;
    }

    get pid(): number {
        return this.#childProcess.pid;
    }

    get status(): Promise<CommandStatus> {
        return this.#childProcess.status;
    }

    ref(): void {
        return this.#childProcess.ref();
    }

    unref(): void {
        return this.#childProcess.unref();
    }

    async output(): Promise<Output> {
        const out = await this.#childProcess.output();

        return new DenoOutput({
            stdout: this.#options.stdout === "piped" ? out.stdout : new Uint8Array(0),
            stderr: this.#options.stderr === "piped" ? out.stderr : new Uint8Array(0),
            code: out.code,
            signal: out.signal,
            success: out.success,
        }, this.#file);
    }

    kill(signo?: Signal): void {
        return this.#childProcess.kill(signo);
    }

    onDispose: (() => void) | undefined;

    [Symbol.asyncDispose](): Promise<void> {
        if (this.onDispose) {
            this.onDispose();
        }

        return this.#childProcess[Symbol.asyncDispose]();
    }
}

class DenoOutput implements Output {
    #text?: string;
    #lines?: string[];
    #json?: unknown;
    #errorText?: string;
    #errorLines?: string[];
    #errorJson?: unknown;
    #file: string;
    readonly stdout: Uint8Array;
    readonly stderr: Uint8Array;
    readonly code: number;
    readonly signal?: string | undefined;
    readonly success: boolean;

    constructor(output: Deno.CommandOutput, file: string) {
        this.stdout = output.stdout;
        this.stderr = output.stderr;
        this.code = output.code;
        this.signal = output.signal as string;
        this.success = output.success;
        this.#file = file;
    }

    validate(fn?: ((code: number) => boolean) | undefined, failOnStderr?: true | undefined): this {
        fn ??= (code: number) => code === 0;
        if (!fn(this.code)) {
            throw new CommandError({ fileName: this.#file, code: this.code });
        }

        if (failOnStderr && this.stderr.length > 0) {
            throw new CommandError({
                fileName: this.#file,
                code: this.code,
                message: `${this.#file} failed with stderr: ${this.errorText()}`,
            });
        }

        return this;
    }

    text(): string {
        if (this.#text) {
            return this.#text;
        }

        if (this.stdout.length === 0) {
            this.#text = EMPTY;
            return this.#text;
        }

        this.#text = new TextDecoder().decode(this.stdout);
        return this.#text;
    }

    lines(): string[] {
        if (this.#lines) {
            return this.#lines;
        }

        this.#lines = this.text().split(/\r?\n/);
        return this.#lines;
    }

    json(): unknown {
        if (this.#json) {
            return this.#json;
        }

        this.#json = JSON.parse(this.text());
        return this.#json;
    }
    errorText(): string {
        if (this.#errorText) {
            return this.#errorText;
        }

        if (this.stderr.length === 0) {
            this.#errorText = EMPTY;
            return this.#errorText;
        }

        this.#errorText = new TextDecoder().decode(this.stderr);
        return this.#errorText;
    }

    errorLines(): string[] {
        if (this.#errorLines) {
            return this.#errorLines;
        }

        this.#errorLines = this.errorText().split(/\r?\n/);
        return this.#errorLines;
    }

    errorJson(): unknown {
        if (this.#errorJson) {
            return this.#errorJson;
        }

        this.#errorJson = JSON.parse(this.errorText());
        return this.#errorJson;
    }

    toString(): string {
        return this.text();
    }
}

Command.prototype.spawn = function (): ChildProcess {
    const exe = pathFinder.findExeSync(this.file);
    if (exe === undefined) {
        throw new NotFoundOnPathError(this.file);
    }
    const args = this.args ? convertCommandArgs(this.args) : undefined;
    const options = {
        ...this.options,
        args: args,
    } as Deno.CommandOptions;

    if (this.options?.log) {
        this.options?.log(exe, args);
    }

    const process = new Deno.Command(exe, options);
    return new DenoChildProcess(process.spawn(), options, this.file);
};

Command.prototype.outputSync = function (): Output {
    const exe = pathFinder.findExeSync(this.file);
    if (exe === undefined) {
        throw new NotFoundOnPathError(this.file);
    }

    const args = this.args ? convertCommandArgs(this.args) : undefined;
    const options = {
        ...this.options,
        args: args,
    } as Deno.CommandOptions;

    options.stdout ??= "piped";
    options.stderr ??= "piped";
    options.stdin ??= "inherit";
    if (this.options?.log) {
        this.options?.log(exe, args);
    }

    const process = new Deno.Command(exe, options);
    const out = process.outputSync();

    return new DenoOutput({
        stdout: options.stdout === "piped" ? out.stdout : new Uint8Array(0),
        stderr: options.stderr === "piped" ? out.stderr : new Uint8Array(0),
        code: out.code,
        signal: out.signal,
        success: out.success,
    }, this.file);
};
Command.prototype.output = async function (): Promise<Output> {
    const exe = await pathFinder.findExe(this.file);
    if (exe === undefined) {
        throw new NotFoundOnPathError(this.file);
    }
    const args = this.args ? convertCommandArgs(this.args) : undefined;
    const options = {
        ...this.options,
        args: args,
    } as Deno.CommandOptions;

    options.stdout ??= "piped";
    options.stderr ??= "piped";
    options.stdin ??= "inherit";

    if (this.options?.log) {
        this.options?.log(exe, args);
    }

    const process = new Deno.Command(exe, options);
    const out = await process.output();

    return new DenoOutput({
        stdout: options.stdout === "piped" ? out.stdout : new Uint8Array(0),
        stderr: options.stderr === "piped" ? out.stderr : new Uint8Array(0),
        code: out.code,
        signal: out.signal,
        success: out.success,
    }, this.file);
};

ShellCommand.prototype.output = async function (): Promise<Output> {
    const exe = await pathFinder.findExe(this.file);
    if (exe === undefined) {
        throw new NotFoundOnPathError(this.file);
    }
    const { file, generated } = this.getScriptFile();
    const isFile = file !== undefined;
    try {
        const args = this.getShellArgs(isFile ? file : this.script, isFile);
        if (isFile && this.args) {
            const splat = convertCommandArgs(this.args);
            args.push(...splat);
        }

        const options = {
            ...this.options,
            args: args,
        } as Deno.CommandOptions;

        options.stdout ??= "piped";
        options.stderr ??= "piped";
        options.stdin ??= "inherit";
        if (this.options?.log) {
            this.options?.log(exe, args);
        }

        const process = new Deno.Command(exe, options);
        const out = await process.output();

        return new DenoOutput({
            stdout: options.stdout === "piped" ? out.stdout : new Uint8Array(0),
            stderr: options.stderr === "piped" ? out.stderr : new Uint8Array(0),
            code: out.code,
            signal: out.signal,
            success: out.success,
        }, this.file);
    } finally {
        if (isFile && generated) {
            await remove(file);
        }
    }
};

ShellCommand.prototype.outputSync = function (): Output {
    const exe = pathFinder.findExeSync(this.file);
    if (exe === undefined) {
        throw new NotFoundOnPathError(this.file);
    }
    const { file, generated } = this.getScriptFile();
    const isFile = file !== undefined;
    try {
        const args = this.getShellArgs(isFile ? file : this.script, isFile);
        if (isFile && this.args) {
            const splat = convertCommandArgs(this.args);
            args.push(...splat);
        }

        const options = {
            ...this.options,
            args: args,
        };

        options.stdout ??= "piped";
        options.stderr ??= "piped";
        options.stdin ??= "inherit";
        if (this.options?.log) {
            this.options?.log(exe, args);
        }

        const process = new Deno.Command(exe, options);
        const out = process.outputSync();

        return new DenoOutput({
            stdout: options.stdout === "piped" ? out.stdout : new Uint8Array(0),
            stderr: options.stderr === "piped" ? out.stderr : new Uint8Array(0),
            code: out.code,
            signal: out.signal,
            success: out.success,
        }, this.file);
    } finally {
        if (isFile && generated) {
            removeSync(file);
        }
    }
};

ShellCommand.prototype.spawn = function (): ChildProcess {
    const exe = pathFinder.findExeSync(this.file);
    if (exe === undefined) {
        throw new NotFoundOnPathError(this.file);
    }
    const { file, generated } = this.getScriptFile();
    const isFile = file !== undefined;
    const args = this.getShellArgs(isFile ? file : this.script, isFile);
    if (isFile && this.args) {
        const splat = convertCommandArgs(this.args);
        args.push(...splat);
    }

    const options = {
        ...this.options,
        args: args,
    } as Deno.CommandOptions;

    if (this.options?.log) {
        this.options?.log(exe, args);
    }

    const process = new Deno.Command(exe, options);
    const proc = new DenoChildProcess(process.spawn(), options, this.file);
    proc.onDispose = () => {
        if (isFile && generated) {
            removeSync(file);
        }
    };
    return proc;
};

export { Command, ShellCommand };
