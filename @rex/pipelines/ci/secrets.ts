import { DefaultSecretMasker } from "@bearz/secrets/masker";
import { encodeBase64 } from "@std/encoding/base64";

const masker = new DefaultSecretMasker();
masker.addGenerator((s) => {
    return encodeBase64(new TextEncoder().encode(s));
});

/**
 * The secret masker used to mask secrets in the output.
 */
export const secretMasker = masker;
