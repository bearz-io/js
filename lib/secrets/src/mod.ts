/**
 * ## Overview
 *
 * The secrets module provides a secret generator and a secret masker.
 *
 * The secret generator uses a cryptographic random number generator (csrng)
 * defaults to NIST requirements e.g length > 8, 1 upper, 1 lower, 1 digit, and
 * 1 special character.
 *
 * The secret masker works by adding secrets and variants to the masker and then it
 * will replace the secret with '*********' which is useful to protect secrets
 * from logs or CI/CD standard output.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@bearz/secrets/doc)
 *
 * ## Usage
 *
 * ```typescript
 * import { DefaultSecretGenerator, secretMasker } from "@bearz/secrets";
 * import { assertEquals as equal } from "@std/assert"
 *
 * // secret generator / password generator
 * const generator = new DefaultSecretGenerator();
 * generator.addDefaults();
 *
 * console.log(generator.generate());
 * console.log(generator.generate(30));
 *
 * // secret masker
 * const masker = secretMasker;
 * masker.addGenerator((secret: string) => {
 *     return secret.toUpperCase();
 * });
 *
 * masker.add("super secret");
 * masker.add("another secret");
 * equal(masker.mask("super secret"), "*******");
 * equal(masker.mask("SUPER SECRET"), "*******");
 * equal(masker.mask("another secret"), "*******");
 * equal(masker.mask("ANOTHER SECRET"), "*******");
 *
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 */
export * from "./generator.ts";
export * from "./masker.ts";
