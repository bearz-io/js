# @bearz/shells

# Overview 

A cross-runtime module for running shell scripts. By default, the module
supports supports running scripts for the following shells/languages:

- bash
- bun
- cmd
- deno
- node
- powershell
- pwsh
- python
- ruby (experimental)
- sh
- tsx

Others can be added by implementing them and then adding the script handler
to the registry.

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@bearz/shells/doc)

## Usage
```typescript
import { equal } from "@bearz/assert";
import { script } from "@bearz/shells";
import { pwshScript } from "@bearz/pwsh";

// on windows this is powershell, for others this is bash
// this will work on both
const cmd0 = await script("echo 'Hello, World!'");
equal(cmd0.text().trim(), "Hello, World!");
equal(0, cmd0.code);

// this will script using deno
const cmd1 = await script("console.log('Hello, World!')" , { shell: 'deno' });
equal(cmd1.text(), "Hello, World!\n");
equal(0, cmd1.code);

// this will script using tsx (if installed and found on the path)
const cmd2 = await script("console.log('Hello, World!')" , { shell: 'tsx' });
equal(cmd2.text(), "Hello, World!\n");
equal(0, cmd2.code);

// pass in environment variables.
const cmd3 = await script("console.log('Hello, ' + Deno.env.get(\"HELLO\"))" , { 
    shell: 'deno', 
    env: { "HELLO": "WORLD" } 
});
equal(cmd3.text(), "Hello, WORLD\n");    
equal(0, cmd3.code);

// run comes from the @bearz/exec library and will use set stdout to inherit
// will output to the console rather can capturing the output.
await script("console.log('Hello, World!')" , { shell: 'deno' }).run();

// this will capture the output, which is the default 
const output = await pwshScript("Write-Host 'Hi from powershell'").output();
console.log(output.text());

// this can be shortened to only get the text.
const text = await pwshScript("Write-Host 'Hi from powershell'").text();
console.log(text);
```

## License

[MIT License](./LICENSE.md)