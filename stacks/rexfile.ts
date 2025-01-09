import { cmd, fs, job, path, setLogger, task } from "@rex/rexfile";
import * as dotenv from "@bearz/dotenv";
import { parseArgs } from "@std/cli";
import { DefaultSecretGenerator } from "@bearz/secrets/generator";
import { registerSecrets, registerSecretVault } from "@rex/vaults";
import { ssh } from "@rex/ssh-native";
import { registerDnsDriver, updateDnsTask } from "@rex/dns";
import { writer } from "@rex/pipelines/ci";
import { twigTask } from "@rex/twig";
import { deployCompose } from "../@rex/spawn-docker/mod.ts";

setLogger((file, args) => {
    writer.command(file, args);
});

/**
 * new:secret --name=<name> --size=<size>
 */
task("new:secret", async (rex) => {
    const opts = parseArgs(rex.args ?? [], {});
    if (!opts.name) {
        throw new Error("Missing secret name");
    }

    let size = 16;
    if (opts.size) {
        size = parseInt(opts.size);
        if (isNaN(size)) {
            throw new Error("Invalid size");
        }
    }

    const sg = new DefaultSecretGenerator();
    sg.addDefaults();

    const secret = sg.generate(size);
    const file = path.resolve("./etc/secrets.env");
    const dir = path.dirname(file);

    const splat = ["-d", "--config", path.join(dir, ".sops.yaml"), file];
    rex.writer.command("sops", splat);
    const res = await cmd("sops", splat).output();

    if (res.code !== 0) {
        throw new Error("Failed to decrypt secrets");
    }

    const secrets = dotenv.parse(res.text());

    if (secrets[opts.name]) {
        rex.writer.warn(`Secret ${opts.name} already exists`);
        return;
    }

    secrets[opts.name] = secret;

    const data = dotenv.stringify(secrets);
    fs.writeTextFile("./etc/secrets.env", data);

    splat.length = 0;
    splat.push("-e", "--config", path.join(dir, ".sops.yaml"), "--in-place", file);
    rex.writer.command("sops", splat);
    const res2 = await cmd("sops", splat).run();

    if (res2.code !== 0) {
        throw new Error(
            "Failed to encrypt secrets. Do not forget to encrypt the file before committing",
        );
    }

    rex.writer.success(`Secret ${opts.name} created`);
});

registerSecretVault("sops", {
    name: "default",
    use: "sops-cli",
    with: {
        "driver": "age",
        "config": "./etc/.sops.yaml",
        "file": "./etc/secrets.env",
    },
});

job("vms:setup").tasks((task, add, _, map) => {
    add("sops");

    const secrets = [
        "VM_01_PASS",
        "VM_02_PASS",
        "VM_01_IP",
        "VM_02_IP",
        "VM_01_USER",
        "VM_02_USER",
    ];

    registerSecrets(
        "secrets",
        secrets.map((name) => {
            return { name, key: name, use: "default" };
        }),
        map,
    );

    const vms = ["VM_01", "VM_02"];

    for (const vm of vms) {
        task(`${vm}:set-pass`, async (rex) => {
            const pw = rex.env.get(`${vm}_PASS`);
            const user = rex.env.get(`${vm}_USER`);
            const ip = rex.env.get(`${vm}_IP`);

            rex.writer.info(`Setting password for ${user}@${ip}`);
            const o = await ssh({
                dest: `${user}@${ip}`,
                command: `echo "${pw}" | tee ~/.password`,
            }).run();

            o.validate();
        });

        task(`${vm}:install`, async (rex) => {
            const user = rex.env.get(`${vm}_USER`);
            const ip = rex.env.get(`${vm}_IP`);

            const script = await fs.readTextFile("./scripts/server_setup.sh");

            rex.writer.info(`running setup for ${ip}`);
            const o = await ssh({
                dest: `${user}@${ip}`,
                command: script,
            }).run();

            o.validate();
        });
    }
});

job("vm:setup:swarm").tasks((task, add, _, map) => {
    add("sops");
    const secrets = [
        "VM_01_PASS",
        "VM_02_PASS",
        "VM_01_IP",
        "VM_02_IP",
        "VM_01_USER",
        "VM_02_USER",
    ];

    registerSecrets(
        "secrets",
        secrets.map((name) => {
            return { name, key: name, use: "default" };
        }),
        map,
    );

    const children = ["VM_01", "VM_02"];

    let token = "";

    task("swarm:init", async (rex) => {
        const user = rex.env.get("VM_01_USER");
        const ip = rex.env.get("VM_01_IP");
        let o = await ssh({
            dest: `${user}@${ip}`,
            command: `docker info --format '{{.Swarm.LocalNodeState}}'`,
        }).output();

        o.validate();

        const state = o.text().trim();
        if (state === "active") {
            rex.writer.info("Swarm already initialized");
        } else {
            rex.writer.info(`Initializing swarm on ${ip}`);
            o = await ssh({
                dest: `${user}@${ip}`,
                command: `sudo docker swarm init --advertise-addr ${ip}`,
            }, { signal: rex.signal }).run();

            o.validate();
        }

        o = await ssh({
            dest: `${user}@${ip}`,
            command: `sudo docker swarm join-token worker -q`,
        }).output();

        o.validate();

        token = o.text().trim();

        rex.env.set("SWARM_TOKEN", token);
        rex.env.set("MANAGER_IP", ip!);
        rex.writer.info(`Swarm initialized with token ${token}`);

        o = await ssh({
            dest: `${user}@${ip}`,
            command: `sudo docker network inspect ingress`,
        }, { signal: rex.signal }).output();

        const createIngress = o.code !== 0 ||
            // deno-lint-ignore no-explicit-any
            (o.json() as any)[0].IPAM.Config.Subnet !== "172.19.0.0./16";

        if (createIngress) {
            o = await ssh({
                dest: `${user}@${ip}`,
                command: `yes y | docker network rm ingress --force`,
            }).run();

            let code = 0;

            // wait for the network to be removed
            while (code === 0) {
                o = await ssh({
                    dest: `${user}@${ip}`,
                    command: `sudo docker network inspect ingress`,
                }, { signal: rex.signal }).output();

                code = o.code;
                if (code !== 0) {
                    break;
                }
            }

            const c =
                `sudo docker network create --driver overlay --ingress --subnet 172.19.0.0/16 --gateway 172.19.0.1 --opt com.docker.network.driver.mtu=1400 ingress`;
            o = await ssh({
                dest: `${user}@${ip}`,
                command: c,
            }).run();

            o.validate();

            code = 100;

            while (code !== 0) {
                o = await ssh({
                    dest: `${user}@${ip}`,
                    command: `sudo docker network inspect ingress`,
                }, { signal: rex.signal }).output();

                code = o.code;
                if (code === 0) {
                    break;
                }
            }

            rex.writer.info("Ingress network created");
        }

        o = await ssh({
            dest: `${user}@${ip}`,
            command: `sudo docker network ls --format '{{.Name}}`,
        }).output();

        const networks = o.lines()
            .map((x) => x.trim())
            .filter((x) => x.length > 0);

        if (!networks.includes("rex-frontend")) {
            o = await ssh({
                dest: `${user}@${ip}`,
                command:
                    `sudo docker network create -d overlay --subnet 172.20.0.0/16 --gateway 172.20.0.1 --attachable rex-frontend`,
            }).run();

            o.validate();
        }

        if (!networks.includes("rex-backend")) {
            o = await ssh({
                dest: `${user}@${ip}`,
                command:
                    `sudo docker network create -d overlay --subnet 172.21.0.0/16 --gateway 172.21.0.1 --attachable rex-backend`,
            }).run();

            o.validate();
        }
    });

    for (const vm of children) {
        task(`${vm}:swarm:join`, async (rex) => {
            const user = rex.env.get(`${vm}_USER`);
            const ip = rex.env.get(`${vm}_IP`);

            const token = rex.env.get("SWARM_TOKEN");
            const manager = rex.env.get("MANAGER_IP");

            let o = await ssh({
                dest: `${user}@${ip}`,
                command: `docker info --format '{{.Swarm.LocalNodeState}}'`,
            }).output();

            o.validate();

            const state = o.text().trim();
            if (state === "active") {
                rex.writer.info(`Node ${ip} already joined swarm`);
            } else {
                rex.writer.info(`Joining swarm ${manager} with ${ip}`);
                o = await ssh({
                    dest: `${user}@${ip}`,
                    command: `sudo docker swarm join --token ${token} ${manager}:2377`,
                }).run();

                o.validate();
            }
        });
    }
});

registerDnsDriver("flarectl", {
    name: "default",
    use: "flarectl",
    with: {
        "api-token": "$CF_API_TOKEN",
    },
});

updateDnsTask("update:dns", {
    zone: "bearz.host",
    use: "default",
    records: [{
        name: "test1",
        type: "A",
        value: "10.0.0.70",
    }],
    remove: ["test2"],
}, ["flarectl"]);

twigTask("traefik:conf", {
    src: "./src/traefik/etc/traefik.yaml.twig",
    dest: "./src/traefik/etc/${REX_CONTEXT}.traefik.yaml",
    valueFiles: ["./etc/config.${REX_CONTEXT}.yaml"],
});

deployCompose({
    id: "whoami",
    with: {
        files: ["./src/whoami/${REX_CONTEXT}.compose.yaml"],
    },
});
