import type { InputDescriptor } from "../primitives/primitives.ts";

export const ComposeInputs: InputDescriptor[] = [
    {
        name: "file",
        type: "array",
        required: false,
    },
    {
        name: "projectName",
        type: "string",
        required: false,
    },
    {
        name: "projectDirectory",
        type: "string",
        required: false,
    },
    {
        name: "envFile",
        type: "array",
        required: false,
    },
    {
        name: "parallel",
        type: "number",
        required: false,
    },
    {
        name: "profile",
        type: "array",
        required: false,
    },
    {
        name: "progress",
        type: "string",
        required: false,
    },
    {
        name: "compatibility",
        type: "boolean",
        required: false,
    },
    {
        name: "ansi",
        type: "string",
        required: false,
    },
    {
        name: "dryRun",
        type: "boolean",
        required: false,
    },
    {
        name: "help",
        type: "boolean",
        required: false,
    },
];
