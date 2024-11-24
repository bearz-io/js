/**
 * A standard output writer, which represents the standard
 * output or error stream of the process.
 */
export interface StdWriter extends Record<string, unknown> {
    /**
     * Writes the specified chunk of data to the stream.
     * @param chunk The data to write.
     * @returns The number of bytes written.
     */
    write(chunk: Uint8Array): Promise<number>;
    /**
     * Writes the specified chunk of data to the stream synchronously.
     * @param chunk The data to write.
     * @returns The number of bytes written.
     */
    writeSync(chunk: Uint8Array): number;
    /**
     * Checks if stream is TTY (terminal).
     *
     * @returns True if the stream is a terminal; otherwise, false.
     */
    isTerm(): boolean;
    /**
     * Closes the stream, if applicable.
     */
    close(): void;
}

/**
 * A standard input reader, which represents the standard input
 * stream of the process.
 */
export interface StdReader extends Record<string, unknown> {
    /**
     * Reads a chunk of data from the stream.
     * @param data The chunk to read data into.
     */
    read(data: Uint8Array): Promise<number | null>;
    /**
     * Reads a chunk of data from the stream synchronously.
     * @param data The chunk to read data into.
     */
    readSync(data: Uint8Array): number | null;

    isTerm(): boolean;

    /**
     * Closes the stream, if applicable.
     */
    close(): void;
}

let stdinValue: StdReader = {
    /**
     * Reads a chunk of data from the stream.
     * @param data The chunk to read data into.
     */
    // deno-lint-ignore no-unused-vars
    read(data: Uint8Array): Promise<number | null> {
        return Promise.resolve(null);
    },

    /**
     * Reads a chunk of data from the stream synchronously.
     * @param data The chunk to read data into.
     */
    // deno-lint-ignore no-unused-vars
    readSync(data: Uint8Array): number | null {
        return null;
    },
    isTerm(): boolean {
        return false;
    },

    /**
     * Closes the stream, if applicable.
     */
    close(): void {
    },
};

/**
 * A standard output writer, which represents the standard
 * output for the current process.
 */
let stdoutValue: StdWriter = {
    buffer: "",
    /**
     * Writes the specified chunk of data to the stream.
     * @param chunk The data to write.
     */
    write(chunk: Uint8Array): Promise<number> {
        return new Promise((resolve) => {
            let msg = new TextDecoder().decode(chunk);
            let buffer = this.buffer as string;
            if (msg.includes("\n")) {
                const messages = msg.split("\n");
                for (let i = 0; i < messages.length - 1; i++) {
                    if (buffer.length > 0) {
                        console.log(buffer + messages[i]);
                        this.buffer = buffer = "";
                        continue;
                    }

                    console.log(messages[i]);
                }

                msg = messages[messages.length - 1];
            }

            if (!msg.endsWith("\n")) {
                this.buffer += msg;
                resolve(chunk.length);
            } else {
                this.buffer = "";
                const lines = buffer + msg;
                console.log(lines);
                resolve(chunk.length);
            }
        });
    },
    /**
     * Writes the specified chunk of data to the stream synchronously.
     * @param chunk The data to write.
     */
    writeSync(chunk: Uint8Array): number {
        let msg = new TextDecoder().decode(chunk);
        let buffer = this.buffer as string;
        if (msg.includes("\n")) {
            const messages = msg.split("\n");
            for (let i = 0; i < messages.length - 1; i++) {
                if (buffer.length > 0) {
                    console.log(buffer + messages[i]);
                    this.buffer = buffer = "";
                    continue;
                }

                console.log(messages[i]);
            }

            msg = messages[messages.length - 1];
        }

        if (!msg.endsWith("\n")) {
            this.buffer += msg;
        } else {
            this.buffer = "";
            const lines = buffer + msg;
            console.log(lines);
        }

        return chunk.length;
    },

    /**
     * Checks if stream is TTY (terminal).
     *
     * @returns True if the stream is a terminal; otherwise, false.
     */
    isTerm(): boolean {
        return false;
    },
    close(): void {
    },
};

/**
 * A standard error writer, which represents the standard error
 * stream of the process.
 */
let stderrValue: StdWriter = {
    buffer: "",
    /**
     * Writes the specified chunk of data to the stream.
     * @param chunk The data to write.
     */
    write(chunk: Uint8Array): Promise<number> {
        return new Promise((resolve) => {
            const msg = new TextDecoder().decode(chunk);
            const buffer = this.buffer as string;

            if (!msg.endsWith("\n")) {
                this.buffer += msg;
                resolve(chunk.length);
            } else {
                this.buffer = "";
                const lines = buffer + msg;
                console.error(lines);
                resolve(chunk.length);
            }
        });
    },
    /**
     * Writes the specified chunk of data to the stream synchronously.
     * @param chunk The data to write.
     */
    writeSync(chunk: Uint8Array): number {
        const msg = new TextDecoder().decode(chunk);
        const buffer = this.buffer as string;

        if (!msg.endsWith("\n")) {
            this.buffer += msg;
        } else {
            this.buffer = "";
            const lines = buffer + msg;
            console.error(lines);
        }

        return chunk.length;
    },
    /**
     * Checks if stream is TTY (terminal).
     *
     * @returns True if the stream is a terminal; otherwise, false.
     */
    isTerm(): boolean {
        return false;
    },
    close(): void {
    },
};

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    stdoutValue = {
        /**
         * Writes the specified chunk of data to the stream.
         * @param chunk The data to write.
         * @returns The number of bytes written.
         */
        write(chunk: Uint8Array): Promise<number> {
            return Deno.stdout.write(chunk);
        },

        /**
         * Writes the specified chunk of data to the stream synchronously.
         * @param chunk The data to write.
         * @returns The number of bytes written.
         */
        writeSync(chunk: Uint8Array): number {
            return Deno.stdout.writeSync(chunk);
        },
        /**
         * Checks if stream is TTY (terminal).
         *
         * @returns True if the stream is a terminal; otherwise, false.
         */
        isTerm(): boolean {
            return Deno.stdout.isTerminal();
        },
        /**
         * Closes the stream, if applicable.
         */
        close(): void {
            Deno.stdout.close();
        },
    };

    stderrValue = {
        /**
         * Writes the specified chunk of data to the stream.
         * @param chunk The data to write.
         * @returns The number of bytes written.
         */
        write(chunk: Uint8Array): Promise<number> {
            return Deno.stderr.write(chunk);
        },
        /**
         * Writes the specified chunk of data to the stream synchronously.
         * @param chunk The data to write.
         * @returns The number of bytes written.
         */
        writeSync(chunk: Uint8Array): number {
            return Deno.stderr.writeSync(chunk);
        },
        /**
         * Checks if stream is TTY (terminal).
         *
         * @returns True if the stream is a terminal; otherwise, false.
         */
        isTerm(): boolean {
            return Deno.stderr.isTerminal();
        },
        /**
         * Closes the stream, if applicable.
         */
        close(): void {
            Deno.stderr.close();
        },
    };

    stdinValue = {
        /**
         * Reads a chunk of data from the stream.
         * @param data The chunk to read data into.
         */
        read(data: Uint8Array): Promise<number | null> {
            return Deno.stdin.read(data);
        },
        /**
         * Reads a chunk of data from the stream synchronously.
         * @param data The chunk to read data into.
         */
        readSync(data: Uint8Array): number | null {
            return Deno.stdin.readSync(data);
        },
        isTerm(): boolean {
            return Deno.stdin.isTerminal();
        },

        /**
         * Closes the stream, if applicable.
         */
        close(): void {
            Deno.stdin.close();
        },
    };
} else if (g.process) {
    const process = g.process as NodeJS.Process;
    const fs = await import("node:fs");

    stdoutValue = {
        /**
         * Writes the specified chunk of data to the stream.
         * @param chunk The data to write.
         * @returns The number of bytes written.
         */
        write(chunk: Uint8Array): Promise<number> {
            return new Promise<number>((resolve, reject) => {
                process.stdout.write(chunk, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(chunk.length);
                    }
                });
            });
        },
        /**
         * Writes the specified chunk of data to the stream synchronously.
         * @param chunk The data to write.
         * @returns The number of bytes written.
         */
        writeSync(chunk: Uint8Array): number {
            return fs.writeSync(process.stdout.fd, chunk);
        },
        /**
         * Checks if stream is TTY (terminal).
         *
         * @returns True if the stream is a terminal; otherwise, false.
         */
        isTerm(): boolean {
            return (process && process.stdout && process.stdout.isTTY) ?? false;
        },
        close(): void {
            process.stdout.end();
        },
    };

    stderrValue = {
        /**
         * Writes the specified chunk of data to the stream.
         * @param chunk The data to write.
         */
        write(chunk: Uint8Array): Promise<number> {
            return new Promise<number>((resolve, reject) => {
                process.stderr.write(chunk, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(chunk.length);
                    }
                });
            });
        },
        /**
         * Writes the specified chunk of data to the stream synchronously.
         * @param chunk The data to write.
         */
        writeSync(chunk: Uint8Array): number {
            return fs.writeSync(process.stderr.fd, chunk);
        },
        /**
         * Checks if stream is TTY (terminal).
         *
         * @returns True if the stream is a terminal; otherwise, false.
         */
        isTerm(): boolean {
            return (process && process.stderr && process.stderr.isTTY) ?? false;
        },
        close(): void {
            process.stderr.end();
        },
    };

    stdinValue = {
        /**
         * Reads a chunk of data from the stream.
         * @param data The chunk to read data into.
         */
        read(data: Uint8Array): Promise<number | null> {
            if (!this.isTerm()) {
                return Promise.resolve(null);
            }
            return new Promise((resolve, reject) => {
                // wait till data is available
                process.stdin.once("readable", () => {
                    const chunk = process.stdin.read(); // node Buffer
                    const data2 = new Uint8Array(chunk); // convert to Uint8Array
                    data.set(data2, 0); // copy to output buffer

                    // resolve with number of bytes read
                    resolve(data2.length);
                });

                process.stdin.once("end", () => {
                    resolve(null);
                });

                process.stdin.once("error", (err) => {
                    const e = err as NodeJS.ErrnoException;
                    switch (e.code) {
                        case "EAGAIN":
                            resolve(0);
                            break;
                        case "EOF":
                            resolve(0);
                            break;

                        default:
                            reject(err);
                    }
                });
            });
        },
        /**
         * Reads a chunk of data from the stream synchronously.
         * @param data The chunk to read data into.
         */
        readSync(data: Uint8Array): number | null {
            if (!this.isTerm()) {
                return null;
            }

            let bytesRead = 0;

            while (bytesRead === 0) {
                try {
                    bytesRead = fs.readSync(process.stdin.fd, data, 0, data.length, null);
                } catch (error) {
                    const e = error as NodeJS.ErrnoException;
                    if (e && typeof e.code === "string") {
                        if (e.code === "EAGAIN") {
                            // no data available, generally on nix systems
                            bytesRead = 0;
                            continue;
                        } else if (e.code === "EOF") {
                            // end of piped stdin, generally on windows
                            bytesRead = 0;
                            continue;
                        }
                    }

                    throw e; // unexpected exception
                }
            }

            return bytesRead;
        },
        isTerm(): boolean {
            return (process && process.stdin && process.stdin.isTTY) ?? false;
        },

        /**
         * Closes the stream, if applicable.
         */
        close(): void {
            process.stdin.end();
        },
    };
}

export const stdin = stdinValue;
export const stdout = stdoutValue;
export const stderr = stderrValue;
