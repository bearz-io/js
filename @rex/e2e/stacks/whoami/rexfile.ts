import { secretVault } from "@rex/vaults";
import { deployCompose } from "@rex/docker";

deployCompose({
    id: "whoami",
    with: {
        files: ["compose.yaml"],
    },
});
