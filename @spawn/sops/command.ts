import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("sops", {
    name: "sops",
    envVariable: "SOPS_EXE",
    windows: [
        "${LOCALAPPDATA}\\Programs\\bin\\sops.exe",
        "${LOCALAPPDATA}\\bin\\sops.exe",
        "${UserProfile}\\bin\\sops.exe",
        "${UserProfile}\\scoop\\shims\\sops.exe",
        "${ALLUSERSPROFILE}\\chocolatey\\bin\\sops.exe",
        "${ChocolateyInstall}\\bin\\sops.exe",
    ],
    linux: [
        "${HOME}/.local/bin/sops",
        "/usr/local/bin/sops",
        "/usr/bin/sops",
    ],
});

/**
 * Represents an sops command.
 */
export class SopsCommand extends Command {
    /**
     * Represents the sops CLI command.
     * @param args - The command arguments.
     * @param options - The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("sops", args, options);
    }
}

/**
 * Invokes the `sops` cli.
 *
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the SopsCommand class.
 * @see {SopsCommand}
 */
export function sops(args?: CommandArgs, options?: CommandOptions): SopsCommand {
    return new SopsCommand(args, options);
}