import { DefaultSecretGenerator } from "./generator.ts";
import { nope, notEqual } from "@bearz/assert";

Deno.test("SecretGenerator", () => {
    const generator = new DefaultSecretGenerator();
    generator.add("abc");
    generator.add("def");
    generator.add("ghi");
    generator.add("1234567890");
    generator.add("ABCDEFGHI");
    generator.add("#_-!@");

    const secret = generator.generate(10);
    console.log(secret);
    notEqual(secret, "abcdefghi");
    nope(secret.includes("j"));
    nope(secret.includes("k"));
    nope(secret.includes("l"));
});
