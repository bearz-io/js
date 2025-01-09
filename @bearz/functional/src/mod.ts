/**
 * ## Overview
 *
 * The functional module provides the types `Option<T>`, `Result<T, E>`,
 * and `Lazy<T>` with helper functions such as `ok`, `fail`, `some`,
 * `none`, `from`, `lazy`, `tryCatch` and `tryCatchSync`.
 *
 * Option is sometimes called `Maybe` in other libraries and languages.
 *
 * These primitives are useful for avoiding throwing errors and handling
 * nulls using monads.
 *
 * ## Documentation
 *
 * Documentation is available on [jsr.io](https://jsr.io/@bearz/functional/doc)
 *
 * ## Usage
 * ```typescript
 * import { ok, err, some, none, lazy } from "@bearz/functional";
 *
 * const r = ok(10);
 * console.log(r.isOk);
 * console.log(r.isError);
 *
 * console.log(r.map((v) => v.toString()))
 *
 * const o1 = none<number>();
 * console.log(o1.isSome);
 * console.log(o1.isNone);
 *
 * const o = some(10);
 * console.log(o.isSome);
 * console.log(o.isNone);
 *
 * const v = lazy(() => {
 *
 *     let o = "";
 *      // calculate some kind of resource intensive value
 *     return o;
 * });
 *
 * console.log(v.hasValue); // false
 * console.log(v.value); // string output
 * console.log(v.hasValue); // true
 *
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 */

export * from "./option.ts";
export * from "./result.ts";
export * from "./lazy.ts";
export * from "./errors.ts";