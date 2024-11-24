/**
 * The ANSI mode of the terminal.
 */
export enum AnsiMode {
    /**
     * Automatically detect the ANSI mode.
     */
    Auto = -1,
    /**
     * No ANSI support.
     */
    None = 0,
    /**
     * 3-bit ANSI support.
     */
    ThreeBit = 1,
    /**
     * 4-bit ANSI support.
     */
    FourBit = 2,
    /**
     * 8-bit ANSI support.
     */
    EightBit = 4,
    /**
     * 24-bit ANSI support.
     */
    TwentyFourBit = 8,
}

/**
 * The ANSI log level.
 */
export enum AnsiLogLevel {
    /**
     * No ANSI log level.
     */
    None = 0,
    /**
     * Critical ANSI log level.
     */
    Critical = 2,
    /**
     * Error ANSI log level.
     */
    Error = 3,
    /**
     * Warning ANSI log level.
     */
    Warning = 4,
    /**
     * Notice ANSI log level.
     */
    Notice = 5,
    /**
     * Information ANSI log level.
     */
    Information = 6,
    /**
     * Debug ANSI log level.
     */
    Debug = 7,
    /**
     * Trace ANSI log level.
     */
    Trace = 8,
}
