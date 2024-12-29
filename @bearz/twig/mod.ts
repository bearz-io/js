/**
 * ## Overview
 *
 * Extends twig with additional functions and filters. Exports twig
 * as `{ Twig }` rather than a default export.
 *
 * ## LICENSE
 *
 * [MIT License](./LICENSE.md) and additional MIT License for the
 * inflection code, see [License](./LICENSE.md) for details.
 */
// @ts-types="npm:@types/twig@^1.12.16"
import Twig from "twig";
import { underscore } from "@bearz/strings";
import { dasherize } from "@bearz/strings/dasherize";
import { camelize } from "@bearz/strings/camelize";
import { capitalize } from "@bearz/strings/capitalize";

Twig.extendFunction("underscore", (value: string) => underscore(value));
Twig.extendFunction("dasherize", (value: string) => dasherize(value));
Twig.extendFunction("screaming", (value: string) => underscore(value, { screaming: true }));
Twig.extendFunction("camelize", (value: string) => camelize(value));
Twig.extendFunction("pascalize", (value: string) => capitalize(camelize(value)));

export { Twig };
