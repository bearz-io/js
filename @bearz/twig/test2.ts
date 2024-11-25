// deno-lint-ignore-file no-explicit-any
import { Client } from "npm:ssh2";

const client = new Client();

const connect = new Promise<void>((resolve, reject) => {
    console.log("Client :: connecting");
    client.on("ready", () => {
        console.log("Client :: ready");
    
        resolve();
    });

    client.on("error", (err: any) => {
        reject(err);
    });

    client.connect({
        host: "192.168.122.145",
        username: "server_admin",
        password: "ZAQ!2wsx",
        debug: console.log
    });
});





const exec = () : Promise<void> => {
    return new Promise((resolve, reject) => {
        client.exec("cd / && ls -lh", (err: any, stream: { on: (arg0: string, arg1: (code: any, signal: any) => void) => { (): any; new(): any; on: { (arg0: string, arg1: (data: string) => void): { (): any; new(): any; stderr: { (): any; new(): any; on: { (arg0: string, arg1: (data: string) => void): void; new(): any; }; }; }; new(): any; }; }; }) => {
            reject(err);
            stream.on("close", (code: any, signal: any) => {
                console.log("Stream :: close :: code: %d, signal: %s", code, signal);
                resolve();
            }).on("data", (data: string) => {
                console.log("STDOUT: " + data);
            }).stderr.on("data", (data: string) => {
                console.log("STDERR: " + data);
            
            });
        });
    });
}

await connect;
await exec();