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
