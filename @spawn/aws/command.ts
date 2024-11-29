import { Command, type CommandArgs, type CommandOptions, pathFinder } from "@bearz/exec";

pathFinder.set("aws", {
    name: "aws",
    envVariable: "AWS_EXE",
    windows: ["${ProgramFiles}\\Amazon\\AWSCLIV2\\aws.exe"],
    linux: ["/usr/bin/aws"],
});

/**
 * Represents an AWS command.
 */
export class AwsCommand extends Command {
    /**
     * Represents the AWS CLI command.
     * @param args - The command arguments.
     * @param options - The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("aws", args, options);
    }
}

/**
 * Invokes the `aws` cli.
 *
 * @param args - The command arguments.
 * @param options - The command options.
 * @returns A new instance of the  class.
 * @see {AwsCommand}
 */
export function aws(args?: CommandArgs, options?: CommandOptions): AwsCommand {
    return new AwsCommand(args, options);
}
