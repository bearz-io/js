import { deployCompose } from "@rex/docker";
import { registerSecretVault, registerSecrets } from "@rex/vaults";
import { task } from "@rex/rexfile";

registerSecretVault({
    name: "default",
    uri: "sops-cli:./etc/test.env",
    with: {
        'driver': 'age',
        'config': "./etc/.sops.yaml",
        'age-key-file': "./etc/keys.txt",
    }
})

registerSecrets([{
    name: "MY_SECRET",
    key: "SECRET_ONE",
}]);

task("show-secrets", ["load-vault", "load-secrets"], (ctx) => {
    for (const [key, value] of ctx.secrets) {
        console.log(`${key}: ${value}`);
    }
});


deployCompose({
    id: "whoami",
    with: {
        files: ["./stacks/whoami/compose.yaml"],
    },
    before: (task, add, _, map) => {
        add("load-vault");
        registerSecrets([{
            name: "MY_SECRET",
            key: "SECRET_ONE",
        }], map);
-
        task("show-secrets", (ctx) => {
             for (const [key, value] of ctx.secrets) {
                console.log(`${key}: ${value}`);
             }

             for (const [key, value] of ctx.env) {
                console.log(`${key}: ${value}`);
             }

             throw new Error("This is an error");
        });
    }
});
