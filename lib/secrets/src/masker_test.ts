import { secretMasker } from "./masker.ts";
import { assertEquals as equals } from "@std/assert";

Deno.test("SecretMasker", () => {
    const masker = secretMasker;
    masker.add("super secret");

    equals(masker.mask("super secret"), "*******");
    equals(masker.mask("another secret"), "another secret");
});

Deno.test("SecretMasker with generator", () => {
    const masker = secretMasker;
    masker.add("super secret");
    masker.addGenerator((secret: string) => {
        return secret.toUpperCase();
    });

    equals(masker.mask("super secret"), "*******");
    equals(masker.mask("SUPER SECRET"), "*******");
});

Deno.test("SecretMasker with generator and multiple secrets", () => {
    const masker = secretMasker;
    masker.add("super secret");
    masker.add("another secret");
    masker.addGenerator((secret: string) => {
        return secret.toUpperCase();
    });

    equals(masker.mask("super secret"), "*******");
    equals(masker.mask("SUPER SECRET"), "*******");
    equals(masker.mask("another secret"), "*******");
    equals(masker.mask("ANOTHER SECRET"), "*******");
});

Deno.test("Lots of text", () => {
    const masker = secretMasker;
    masker.add("super secret");
    masker.add("another secret");
    masker.addGenerator((secret: string) => {
        return secret.toUpperCase();
    });

    const text = "This is a super secret message that should be hidden";
    const masked = masker.mask(text);

    equals(masked, "This is a ******* message that should be hidden");

    const masked2 = masker.mask(masked);
    equals(masked2, "This is a ******* message that should be hidden");
});
