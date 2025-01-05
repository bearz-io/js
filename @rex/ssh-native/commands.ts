import {
    Command,
    type CommandArgs,
    type CommandOptions,
    pathFinder,
    type SplatObject,
} from "@bearz/exec";

pathFinder.set("ssh", {
    name: "ssh",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh.exe",
    ],
    linux: [
        "/usr/bin/ssh",
    ],
});

/**
 * The environment variable name for the ssh askpass program.
 */
export const SSH_ASKPASS = "SSH_ASKPASS";
/**
 * The environment variable name for the ssh authentication socket.
 */
export const SSH_AUTH_SOCK = "SSH_AUTH_SOCK";
/**
 * The environment variable name for the ssh agent pid.
 */
export const SSH_AGENT_PID = "SSH_AGENT_PID";
/**
 * The environment variable name for the ssh askpass require.
 */
export const SSH_ASKPASS_REQUIRE = "SSH_ASKPASS_REQUIRE";

/**
 * Represents a ssh command.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshCommand extends Command {
    /**
     * Creates a new instance of the `SshCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh command line using the SshCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshCommand class.
 *
 * @example
 * ```typescript
 * import { ssh } from "@spawn/xv/ssh";
 *
 * await ssh(["user@host", "ls"]);
 * ```
 */
export function ssh(args?: SshArgs | string | string[], options?: CommandOptions): SshCommand {
    if (typeof args === "object" && !Array.isArray(args)) {
        let protocol = "-2";
        if (args.protocol === 1) {
            protocol = "-1";
        }
        args.splat = {
            argumentNames: ["dest", "command", "arguments"],
            appendArguments: true,
            aliases: {
                "port": "-p",
                "login": "-l",
                "verbose": "-v",
                "version": "-V",
                "x11": "-X",
                "disableX11": "-x",
                "identity": "-i",
                "configFile": "-F",
                "logFile": "-E",
                "dynamicForward": "-D",
                "cipherSpec": "-c",
                "compression": "-C",
                "authForwarding": "-A",
                "disableAuthForwarding": "-a",
                "protocol": protocol,
                "ipv4": "-4",
                "ipv6": "-6",
                "options": "-o",
                "quiet": "-q",
                "redirectStdin": "-n",
                "redirectBackground": "-f",
                "localForward": "-g",
                "forcePseudoTerminal": "-t",
                "disablePseudoTerminal": "-T",
                "tag": "-P",
            },
        };
    }

    return new SshCommand(args, options);
}

/**
 * The arguments for the `ssh` command.
 */
export interface SshArgs extends SplatObject {
    /**
     * The target host which is in the format of [user@]hostname.
     */
    dest: string;
    /**
     * The command to execute on the remote host.
     */
    command?: string;
    /**
     * The arguments to pass to the command.
     */
    arguments?: string | string[];
    /**
     * The port to connect to on the remote host.
     */
    port?: number;
    /**
     * The login name to use on the remote host.
     */
    login?: string;
    /**
     * If set to true, the command will print verbose output.
     */
    verbose?: boolean;
    /**
     * If set to true, the command will print the version information.
     */
    version?: boolean;
    /**
     * Forces the use of x11 forwarding.
     */
    x11?: boolean;
    /**
     * Disables x11 forwarding.
     */
    disableX11?: boolean;
    /**
     * The identity file to use for authentication.
     */
    identity?: string;
    /**
     * The configuration file to use. The default is ~/.ssh/config.
     */
    configFile?: string;
    /**
     * The log file to write to instead of standard error.
     */
    logFile?: string;
    /**
     * Specifies a local “dynamic” application-level port forwarding
     * in the format of [bind_address:]port.
     */
    dynamicForward?: string;
    /**
     * Allows remote hosts to connect to local forwarded ports.
     * If used on a multiplexed connection, then this option
     * must be specified on the master process.
     */
    localForward?: boolean;
    /**
     * Quiet mode.  Causes most warning and diagnostic messages
     * to be suppressed.
     */
    quiet?: boolean;
    /**
     * Selects the cipher specification for encrypting the
     * session.  cipher_spec is a comma-separated list of
     * ciphers listed in order of preference
     */
    cipherSpec?: string;
    /**
     * Enables compression after the user has authenticated
     * successfully.
     */
    compression?: boolean;
    /**
     * Enables authentication agent forwarding.
     */
    authForwarding?: boolean;
    /**
     * Disables authentication agent forwarding.
     */
    disableAuthForwarding?: boolean;
    /**
     * Forces pseudo-terminal allocation.
     */
    forcePseudoTerminal?: boolean;
    /**
     * Disables pseudo-terminal allocation.
     */
    disablePseudoTerminal?: boolean;
    /**
     * Forces the use of ipv4 addresses only.
     */
    ipv4?: boolean;
    /**
     * Forces the use of ipv6 addresses only.
     */
    ipv6?: boolean;
    /**
     * Specify a tag name that may be used to select
     * configuration in ssh_config.
     */
    tag?: string;

    /**
     * An array of options to override the sshd configuration. e.g. -o "StrictHostKeyChecking=no"
     *
     * Commons options are as follows:
     * * AddKeysToAgent
     * * AddressFamily
     * * BatchMode
     * * BindAddress
     * * CanonicalDomains
     * * CanonicalizeFallbackLocal
     * * CanonicalizeHostname
     * * CanonicalizeMaxDots
     * * CanonicalizePermittedCNAMEs
     * * CASignatureAlgorithms
     * * CertificateFile
     * * CheckHostIP
     * * Ciphers
     * * ClearAllForwardings
     * * Compression
     * * ConnectionAttempts
     * * ConnectTimeout
     * * ControlMaster
     * * ControlPath
     * * ControlPersist
     * * DynamicForward
     * * EnableEscapeCommandline
     * * EscapeChar
     * * ExitOnForwardFailure
     * * FingerprintHash
     * * ForkAfterAuthentication
     * * ForwardAgent
     * * ForwardX11
     * * ForwardX11Timeout
     * * ForwardX11Trusted
     * * GatewayPorts
     * * GlobalKnownHostsFile
     * * GSSAPIAuthentication
     * * GSSAPIDelegateCredentials
     * * HashKnownHosts
     * * Host
     * * HostbasedAcceptedAlgorithms
     * * HostbasedAuthentication
     * * HostKeyAlgorithms
     * * HostKeyAlias
     * * Hostname
     * * IdentitiesOnly
     * * IdentityAgent
     * * IdentityFile
     * * IPQoS
     * * KbdInteractiveAuthentication
     * * KbdInteractiveDevices
     * * KexAlgorithms
     * * KnownHostsCommand
     * * LocalCommand
     * * LocalForward
     * * LogLevel
     * * MACs
     * * Match
     * * NoHostAuthenticationForLocalhost
     * * NumberOfPasswordPrompts
     * * PasswordAuthentication
     * * PermitLocalCommand
     * * PermitRemoteOpen
     * * PKCS11Provider
     * * Port
     * * PreferredAuthentications
     * * ProxyCommand
     * * ProxyJump
     * * ProxyUseFdpass
     * * PubkeyAcceptedAlgorithms
     * * PubkeyAuthentication
     * * RekeyLimit
     * * RemoteCommand
     * * RemoteForward
     * * RequestTTY
     * * RequiredRSASize
     * * SendEnv
     * * ServerAliveInterval
     * * ServerAliveCountMax
     * * SessionType
     * * SetEnv
     * * StdinNull
     * * StreamLocalBindMask
     * * StreamLocalBindUnlink
     * * StrictHostKeyChecking
     * * TCPKeepAlive
     * * Tunnel
     * * TunnelDevice
     * * UpdateHostKeys
     * * User
     * * UserKnownHostsFile
     * * VerifyHostKeyDNS
     * * VisualHostKey
     * * XAuthLocation
     */
    options?: string | string[];

    redirectStdin?: boolean;

    redirectBackground?: boolean;
}



pathFinder.set("scp", {
    name: "scp",
    windows: [
        "${ProgramFiles}\\OpenSSH\\scp.exe",
        "${SystemRoot}\\System32\\OpenSSH\\scp.exe",
    ],
    linux: [
        "/usr/bin/scp",
    ],
});

/**
 * Represents a ScpCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class ScpCommand extends Command {
    /**
     * Creates a new instance of the `ScpCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("scp", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the scp command line using the ScpCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the ScpCommand class.
 *
 * @example
 * ```typescript
 * import { scp } from "@spawn/ssh-cli";
 *
 * await scp(["file.txt", "user@host:/path/to/destination"]).run();
 * ```
 */
export function scp(args?: CommandArgs, options?: CommandOptions): ScpCommand {
    return new ScpCommand(args, options);
}

pathFinder.set("ssh-add", {
    name: "ssh-ahh",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh-add.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh-add.exe",
    ],
    linux: [
        "/usr/bin/ssh-add",
    ],
});

/**
 * Represents a ssh add command.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshAddCommand extends Command {
    /**
     * Creates a new instance of the `SshAddCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh-add", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh-add command line using the SshAddCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshAddCommand class.
 *
 * @example
 * ```typescript
 * import { sshAdd } from "@spawn/ssh-cli";
 *
 * await sshAdd(["-K", "id_rsa"]);
 * ```
 */
export function sshAdd(args?: CommandArgs, options?: CommandOptions): SshAddCommand {
    return new SshAddCommand(args, options);
}

pathFinder.set("ssh-keygen", {
    name: "ssh-keygen",
    windows: [
        "${ProgramFiles}\\OpenSSH\\ssh-keygen.exe",
        "${SystemRoot}\\System32\\OpenSSH\\ssh-keygen.exe",
    ],
    linux: [
        "/usr/bin/ssh-keygen",
    ],
});

/**
 * Represents a SshKeygenCommand.
 *
 * When using the SplatObject for CommandArgs, the
 * `prefix` and `assign` properties are set to "-" and "=" respectively.
 */
export class SshKeygenCommand extends Command {
    /**
     * Creates a new instance of the `SshKeygenCommand` class.
     * @param args The command arguments.
     * @param options The command options.
     */
    constructor(args?: CommandArgs, options?: CommandOptions) {
        super("ssh-keygen", args, options);

        if (this.args && (typeof this.args !== "string" && !Array.isArray(args))) {
            const args = this.args as SplatObject;
            args.splat ??= {};
            args.splat.prefix = "--";
        }
    }
}

/**
 * Executes the ssh-keygen command line using the SshKeygenCommand class.
 *
 * @param args The command arguments.
 * @param options The command options.
 * @returns a new instance of the SshKeygenCommand class.
 *
 * @example
 * ```typescript
 * import { ssh-keygen } from "@spawn/ssh-cli";
 *
 * await ssh-keygen(["-t", "rsa", "-b", "4096", "-C", "", "-f", "id_rsa", "-N", ""]).run();
 * ```
 */
export function sshKeygen(args?: CommandArgs, options?: CommandOptions): SshKeygenCommand {
    return new SshKeygenCommand(args, options);
}
