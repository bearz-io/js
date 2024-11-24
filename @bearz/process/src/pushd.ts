import { chdir } from "./chdir.ts";
import { history } from "./history.ts";

/**
 * Pushes the current working directory onto the directory
 * stack and changes the current working directory to the
 * specified directory.
 *
 * @param directory The directory to change to.
 * @throws ChangeDirectoryError if chdir is not implemented, if the directory is not found,
 * or if the runtime does not support changing the directory.
 */
export function pushd(directory: string): void {
    chdir(directory);
    history.push(directory);
}
