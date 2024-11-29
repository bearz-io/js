import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("terraform", {
    name: "terraform",
    envVariable: "TERRAFORM_EXE",
    windows: [
        "${LOCALAPPDATA}\\bin\\terraform.exe",
        "${LOCALAPPDATA}\\Programs\\bin\\terraform.exe",
        "${UserProfile}\\bin\\terraform.exe",
        "${UserProfile}\\scoop\\shims\\terraform.exe",
        "${ALLUSERSPROFILE}\\chocolatey\\bin\\terraform.exe",
        "${ChocolateyInstall}\\bin\\terraform.exe",
    ],

    linux: [
        "${HOME}/.local/bin/terraform",
        "${HOME}/bin/terraform",
        "/usr/bin/terraform",
        "/usr/local/bin/terraform",
    ],
});

/**
 * Represents a terraform command.
 */
export class TerraformCommand extends Command {
    /**
     * Creates a new instance of the `ttCliCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("terraform", args, options);
    }
}

/**
 * Creates a new instance of the TerraformCommand class.
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns An instance of the TerraformCommand class.
 */
export function terraform(args?: CommandArgs, options?: CommandOptions): TerraformCommand {
    return new TerraformCommand(args, options);
}
