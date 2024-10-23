let execPathValue = "";

const g = globalThis as Record<string, unknown>;
if (g.Deno) {
    try {
        let readPermission = await Deno.permissions.request({ name: "read" });
        if (readPermission.state === "prompt") {
            console.log("Read permission is requred for Deno.execPath()");
            readPermission = await Deno.permissions.request({ name: "read" });
        }

        if (readPermission.state === "granted") {
            execPathValue = Deno.execPath();
        } else {
            console.warn("Deno.execPath() permission denied. setting to empty string");
            execPathValue = "";
        }
    } catch {
        console.warn("Deno.execPath() permission denied. setting to empty string");
        execPathValue = "";
    }
} else if (g.process) {
    const process = g.process as NodeJS.Process;
    execPathValue = process.execPath;
}

export const execPath = execPathValue;
