
For tests use deno.

For tests uses `const { test } = Deno` to create a alias define tests using `test`.

Test descriptions should in the format of <module>::<Target> - description where
module is the name of the folder and Target the the focus of the test such as a class or
function.

Tests should use the asserts found in the @bearz/@assert module found in the
@bearz/assert folder. Common functions are `ok` for assert, `equal`, for
assertEquals, `throws` for assertThrows, `nope` for
assertFalse, and `instanceOf`.  
