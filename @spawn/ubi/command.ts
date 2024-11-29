import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("ubi", {
    name: "ubi",
    envVariable: "UBI_EXE",
    windows: [
        "${LOCALAPPDATA}\\Programs\\bin\\ubi.exe",
        "${LOCALAPPDATA}\\bin\\ubi.exe",
        "${UserProfile}\\bin\\ubi.exe",
        "${UserProfile}\\scoop\\shims\\ubi.exe",
        "${ALLUSERSPROFILE}\\chocolatey\\bin\\ubi.exe",
        "${ChocolateyInstall}\\bin\\ubi.exe",
    ],
    linux: [
        "${HOME}/.local/bin/ubi",
        "/usr/local/bin/ubi",
        "/usr/bin/ubi",
    ],
});

/**
 * Represents an ubi command.
 */
export class UbiCommand extends Command {
    /**
     * Represents the ubi CLI command.
     * @param args - The command arguments.
     * @param options - The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ubi", args, options);
    }
}

/**
 * Invokes the `ubi` cli.
 *
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the UbiCommand class.
 * @see {UbiCommand}
 */
export function ubi(args?: CommandArgs, options?: CommandOptions): UbiCommand {
    return new UbiCommand(args, options);
}
