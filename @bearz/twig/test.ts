// deno-lint-ignore-file no-explicit-any
import { Client } from "@bearz/node-ssh2";
import { ClientChannel } from "../node-ssh2/types.d.ts";

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
})
});





const exec = () : Promise<void> => {
    return new Promise((resolve, reject) => {
        client.exec("cd / && ls -lh", (err?: Error, stream?: ClientChannel) => {
            console.log("exec");
            if (err) {
                reject(err);
                return;
            }
                

            if (!stream) {
                reject(new Error("Stream is undefined"));
                return;
            }
               

            stream.on("close", (code: any, signal: any) => {
                console.log("Stream :: close :: code: %d, signal: %s", code, signal);
                stream.destroy();
                client.destroy();
                resolve(void 0);
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
