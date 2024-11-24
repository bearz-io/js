import { secretMasker } from "./masker.ts";
import { equal } from "@bearz/assert";

Deno.test("SecretMasker", () => {
    const masker = secretMasker;
    masker.add("super secret");

    equal(masker.mask("super secret"), "*******");
    equal(masker.mask("another secret"), "another secret");
});

Deno.test("SecretMasker with generator", () => {
    const masker = secretMasker;
    masker.add("super secret");
    masker.addGenerator((secret: string) => {
        return secret.toUpperCase();
    });

    equal(masker.mask("super secret"), "*******");
    equal(masker.mask("SUPER SECRET"), "*******");
});

Deno.test("SecretMasker with generator and multiple secrets", () => {
    const masker = secretMasker;
    masker.add("super secret");
    masker.add("another secret");
    masker.addGenerator((secret: string) => {
        return secret.toUpperCase();
    });

    equal(masker.mask("super secret"), "*******");
    equal(masker.mask("SUPER SECRET"), "*******");
    equal(masker.mask("another secret"), "*******");
    equal(masker.mask("ANOTHER SECRET"), "*******");
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

    equal(masked, "This is a ******* message that should be hidden");

    const masked2 = masker.mask(masked);
    equal(masked2, "This is a ******* message that should be hidden");
});
