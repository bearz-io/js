/**
 * A stack frame in the stack trace.
 */
export interface StackFrame {
    /**
     * The name of the function, if available.
     */
    functionName?: string;

    /**
     * The name of the file, if available.
     */
    fileName?: string;

    /**
     * The line number in the file, if available.
     */
    lineNumber?: number;

    /**
     * The column number in the file, if available.
     */
    columnNumber?: number;
}

/**
 * Represents a stack trace.
 *
 * @description
 * The StackTrace class is used to represent a stack trace. It
 * is currently experimental and may change in the future.
 *
 * @example
 * ```ts
 * import { StackTrace } from "@gnome/errors/stacktrace";
 *
 * try {
 *      throw new Error("An error occurred.");
 * } catch (error) {
 *      const stackTrace = StackTrace.fromError(error);
 *      for (let i = 0; i < stackTrace.length; i++) {
 *              const frame = stackTrace.at(i);
 *              console.log(`at ${frame.functionName} (${frame.fileName}:${frame.lineNumber}:${frame.columnNumber})`);
 *      }
 * }
 *
 * @category experimental
 */
export class StackTrace {
    private frames: StackFrame[];

    /**
     * Creates a new instance of the StackTrace class.
     */
    constructor() {
        this.frames = [];
    }

    /**
     * Gets the stack frame at the specified index.
     * @param index The index of the stack frame.
     * @returns The stack frame at the specified index.
     */
    at(index: number): StackFrame {
        if (index < 0 || index >= this.frames.length) {
            throw new RangeError(`Index ${index} is out of range.`);
        }

        return this.frames[index];
    }

    /**
     * Adds a stack frame to the stack trace.
     * @param frame The stack frame to add.
     */
    add(frame: StackFrame) {
        this.frames.push(frame);
    }

    /**
     * Removes the stack frame at the specified index.
     * @param index The index of the stack frame to remove.
     */
    removeAt(index: number) {
        if (index < 0 || index >= this.frames.length) {
            throw new RangeError(`Index ${index} is out of range.`);
        }

        this.frames.splice(index, 1);
    }

    /**
     * Gets the number of stack frames in the stack trace.
     */
    get length(): number {
        return this.frames.length;
    }

    /**
     * Creates a stack trace from an error.
     * @param error The error to create a stack trace from.
     * @returns The stack trace.
     */
    static fromError(error: Error): StackTrace {
        return StackTrace.fromTrace(error.stack ?? "");
    }

    /**
     * Creates a stack trace from a trace string.
     * @param trace The trace to create a stack trace from.
     * @returns The stack trace.
     */
    static fromTrace(trace: string): StackTrace {
        const stackTrace = new StackTrace();
        const stack = trace.split("\n");
        for (const stackLine of stack) {
            let line: string = stackLine.trim();
            const frame: StackFrame = {};
            if (line.startsWith("at")) {
                if (line.includes("at new ")) {
                    continue;
                }

                line = line.substring(3);

                const parts = line.split(" ");
                let lineInfo = parts.find((p) => p.startsWith("(") || p.includes(":"));

                if (lineInfo) {
                    const og = lineInfo;
                    lineInfo = lineInfo.trim();
                    if (lineInfo.startsWith("(")) {
                        lineInfo = lineInfo.substring(1, lineInfo.length - 1);
                    }

                    let fileName: string | undefined = lineInfo;
                    let lineNumber: number | undefined = undefined;
                    let columnNumber: number | undefined = undefined;
                    if (lineInfo.includes(":")) {
                        if (lineInfo.includes("://")) {
                            const uri = new URL(lineInfo);
                            const parts = uri.pathname.split(":");

                            switch (parts.length) {
                                case 1:
                                    fileName = uri.origin + parts[0];
                                    break;
                                case 2:
                                    fileName = uri.origin + parts[0];
                                    lineNumber = parseInt(parts[1]);
                                    break;
                                case 3:
                                    fileName = uri.origin + parts[0];
                                    lineNumber = parseInt(parts[1]);
                                    columnNumber = parseInt(parts[2]);
                                    break;
                            }
                        } else {
                            const parts = lineInfo.split(":");
                            if (parts.length === 2) {
                                fileName = parts[0];
                                lineNumber = parseInt(parts[1]);
                            } else if (parts.length === 3) {
                                fileName = parts[0];
                                lineNumber = parseInt(parts[1]);
                                columnNumber = parseInt(parts[2]);
                            }
                        }
                    }

                    frame.fileName = fileName;
                    frame.lineNumber = lineNumber;
                    frame.columnNumber = columnNumber;

                    const index = parts.indexOf(og);
                    if (index > 0) {
                        frame.functionName = parts[index - 1];
                    }

                    stackTrace.add(frame);
                }
            }
        }

        return stackTrace;
    }
}

/**
 * Converts an error to a stack trace.
 * @param error The error to convert.
 * @returns The stack trace.
 */
export function toStackTrace(error: Error): StackTrace {
    return StackTrace.fromError(error);
}
