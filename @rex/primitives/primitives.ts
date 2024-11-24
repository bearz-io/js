export type PipelinePrimitives =
    | "string"
    | "number"
    | "boolean"
    | "integer"
    | "bigint"
    | "array"
    | "object"
    | "date";

export interface InputDescriptor {
    name: string;
    description?: string;
    type: PipelinePrimitives;
    required?: boolean;
    default?: unknown;
    secret?: boolean;
}

export interface OutputDescriptor {
    name: string;
    description?: string;
    required?: boolean;
    type: PipelinePrimitives;
}
