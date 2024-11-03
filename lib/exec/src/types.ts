/**
 * Options for the {@linkcode splat} function.
 */
export interface SplatOptions extends Record<string, unknown> {
    /**
     * The command to execute.
     */
    command?: string[] | string;
    /**
     * The prefix to use for commandline options. Defaults to `"--"`.
     */
    prefix?: string;

    /**
     * Treats the flags as options that emit values.
     */
    noFlags?: string[] | boolean;

    /**
     * The values for true and false for flags.
     */
    noFlagValues?: { t?: string; f?: string };

    /**
     * A lookup of aliases to remap the keys of the object
     * to the actual commandline option.  e.g. `{ "yes": "-y" }`
     * will map `{ yes: true }` to `["-y"]`.
     */
    aliases?: Record<string, string>;
    /**
     * The assigment token to use with options that have a value. The default
     * is to use a space. The common overrides are `":"` and `"="`.
     * This will turn `{ foo: "bar" }` into `["--foo", "bar"]` by default. If
     * assigned to `"="` it will become `["--foo=bar"]`.
     */
    assign?: string;
    /**
     * Whether to preserve the case of the keys. Defaults to `false`.
     */
    preserveCase?: boolean;

    /**
     * Whether to use short flags. Defaults to `true`.
     */
    shortFlag?: boolean;
    /**
     * Only include the keys that are in the `includes` array. Includes
     * take precedence over excludes.
     */
    includes?: Array<string | RegExp>;
    /**
     * Exclude the keys that are in the `excludes` array.
     */
    excludes?: Array<string | RegExp>;
    /**
     * Whether to ignore flags with `true` values. Defaults to `false`.
     */
    ignoreTrue?: boolean;
    /**
     * Whether to ignore flags with `false` values. Defaults to `false`.
     */
    ignoreFalse?: boolean;
    /**
     * The names of positional arguments. This will gather any keys as arguments
     * in the order of the given array.
     *
     * @example
     * ```ts
     * const args = splat({ foo: "bar", baz: "qux" }, { arguments: ["foo", "baz"] });
     * console.log(args); // ["bar", "qux"]
     * ```
     */
    arguments?: string[];
    /**
     * Whether to append the arguments to the end of the command. Defaults to `false`.
     *
     * @example
     * ```ts
     * const args = splat({ first: 1, foo: "bar", baz: "qux" }, { arguments: ["foo", "baz"], appendArguments: true });
     * console.log(args); // ["--first", "1", "bar", "qux"]
     * ```
     */
    appendArguments?: boolean;
}

/**
 * An object that contains the options for the {@linkcode splat} function.
 *
 * @example
 * ```ts
 * const args = splat({ f: "bar", splat: { shortFlag: true } });
 * console.log(args); // ["-f", "bar"]
 * ```
 */
export interface SplatObject extends Record<string, unknown> {
    splat?: SplatOptions;
}

/**
 * The arguments for a command which can be a string, an array of strings, or
 * an object with options.
 */
export type CommandArgs = string[] | string | SplatObject;

/**
 * The standard io options which are:
 * - `inherit` - The child inherits the corresponding standard stream from the parent process.
 * - `piped` - The corresponding standard stream is piped to the parent process.
 * - `null` - The corresponding standard stream is ignored.
 */
export type Stdio = "inherit" | "piped" | "null";

/**
 * The signal that can be sent to a process.
 */
export type Signal =
    | "SIGABRT"
    | "SIGALRM"
    | "SIGBREAK"
    | "SIGBUS"
    | "SIGCHLD"
    | "SIGCONT"
    | "SIGEMT"
    | "SIGFPE"
    | "SIGHUP"
    | "SIGILL"
    | "SIGINFO"
    | "SIGINT"
    | "SIGIO"
    | "SIGKILL"
    | "SIGPIPE"
    | "SIGPROF"
    | "SIGPWR"
    | "SIGQUIT"
    | "SIGSEGV"
    | "SIGSTKFLT"
    | "SIGSTOP"
    | "SIGSYS"
    | "SIGTERM"
    | "SIGTRAP"
    | "SIGTSTP"
    | "SIGTTIN"
    | "SIGTTOU"
    | "SIGURG"
    | "SIGUSR1"
    | "SIGUSR2"
    | "SIGVTALRM"
    | "SIGWINCH"
    | "SIGXCPU"
    | "SIGXFSZ";

/**
 * The output of a command.
 */
export interface Output {
    /**
     * The standard output of the command.
     */
    stdout: Uint8Array;
    /**
     * The standard error of the command.
     */
    stderr: Uint8Array;
    /**
     * The exit code of the command.
     */
    code: number;
    /**
     * The signal that caused the command to exit.
     */
    signal?: string;
    /**
     * Whether the command was successful.
     */
    success: boolean;

    /**
     * Validates the output of the command.
     * @param fn The function to validate the exit code.
     * @param failOnStderr The flag to fail on stderr.
     */
    validate(fn?: (code: number) => boolean, failOnStderr?: true): this;

    /**
     * Gets the text from the standard output.
     */
    text(): string;
    /**
     * Gets the lines from the standard output.
     */
    lines(): string[];
    /**
     * Gets the JSON from the standard output.
     */
    json(): unknown;

    /**
     * Gets the text from the standard error.
     */
    errorText(): string;
    /**
     * Gets the lines from the standard error.
     */
    errorLines(): string[];
    /**
     * Gets the JSON from the standard error.
     */
    errorJson(): unknown;

    /**
     * Gets the text from the standard output or error.
     */
    toString(): string;
}

/**
 * @category Sub Process
 */
export interface CommandStatus {
    /** If the child process exits with a 0 status code, `success` will be set
     * to `true`, otherwise `false`. */
    success: boolean;
    /** The exit code of the child process. */
    code: number;
    /** The signal associated with the child process. */
    signal: Signal | string | null;
}
/**
 * The interface for handling a child process returned from
 * {@linkcode Deno.Command.spawn}.
 *
 * @category Sub Process
 */
export interface ChildProcess extends AsyncDisposable {
    get stdin(): WritableStream<Uint8Array>;
    get stdout(): ReadableStream<Uint8Array>;
    get stderr(): ReadableStream<Uint8Array>;
    readonly pid: number;
    /** Get the status of the child. */
    readonly status: Promise<CommandStatus>;

    /** Waits for the child to exit completely, returning all its output and
     * status. */
    output(): Promise<Output>;
    /** Kills the process with given {@linkcode Deno.Signal}.
     *
     * Defaults to `SIGTERM` if no signal is provided.
     *
     * @param [signo="SIGTERM"]
     */
    kill(signo?: Signal): void;

    /** Ensure that the status of the child process prevents the Deno process
     * from exiting. */
    ref(): void;
    /** Ensure that the status of the child process does not block the Deno
     * process from exiting. */
    unref(): void;

    [Symbol.asyncDispose](): Promise<void>;
}

export interface CommandOptions {
    /**
     * The working directory of the process.
     *
     * If not specified, the `cwd` of the parent process is used.
     */
    cwd?: string | URL;
    /**
     * Clear environmental variables from parent process.
     *
     * Doesn't guarantee that only `env` variables are present, as the OS may
     * set environmental variables for processes.
     *
     * @default {false}
     */
    clearEnv?: boolean;
    /** Environmental variables to pass to the subprocess. */
    env?: Record<string, string>;
    /**
     * Sets the child process’s user ID. This translates to a setuid call in the
     * child process. Failure in the set uid call will cause the spawn to fail.
     */
    uid?: number;
    /** Similar to `uid`, but sets the group ID of the child process. */
    gid?: number;
    /**
     * An {@linkcode AbortSignal} that allows closing the process using the
     * corresponding {@linkcode AbortController} by sending the process a
     * SIGTERM signal.
     *
     * Not supported in {@linkcode Deno.Command.outputSync}.
     */
    signal?: AbortSignal;

    /** How `stdin` of the spawned process should be handled.
     *
     * Defaults to `"inherit"` for `output` & `outputSync`,
     * and `"inherit"` for `spawn`. */
    stdin?: Stdio;
    /** How `stdout` of the spawned process should be handled.
     *
     * Defaults to `"piped"` for `output` & `outputSync`,
     * and `"inherit"` for `spawn`. */
    stdout?: Stdio;
    /** How `stderr` of the spawned process should be handled.
     *
     * Defaults to `"piped"` for `output` & `outputSync`,
     * and `"inherit"` for `spawn`. */
    stderr?: Stdio;

    /**
     * Log the command that will be executed. Generally used to
     * log to standard output.
     * @param file The executable file that will be invoked.
     * @param args The arguments to pass to the executable.
     * @returns void
     */
    log?: (file: string, args?: string[]) => void;

    /** Skips quoting and escaping of the arguments on windows. This option
     * is ignored on non-windows platforms.
     *
     * @default {false} */
    windowsRawArguments?: boolean;
}

/**
 * Options for a shell command.
 */
export interface ShellCommandOptions extends CommandOptions {
    /**
     * Additional arguments to pass to the shell.
     */
    shellArgs?: string[];

    /**
     * Arguments for the command.
     */
    args?: CommandArgs;

    /**
     * Specifies whether the command is a file.
     */
    isFile?: boolean;
}
