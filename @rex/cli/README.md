# @rex/cli

## Overview

Rex is a developer's sidekick.  Rex runs tasks, jobs, and deployments defined
in a file called rexfile.ts using deno and typescript. Tasks, jobs, and deployments
are defined using a code like DSL.

Because rex runs is powered by deno, Rex can import npm and jsr modules on the fly
without having to run npm install.

Rex tasks are a single unit of work and can be shared with jobs and deployments. When
tasks are called directly, they can call other dependent tasks.

Jobs bundle tasks and run them in sequential order. When a shared task is used for
job, the task dependencies are ignored.

```ts
task("test", (_) => console.log("Hello, world!"));

test("parent" ["test"], _ => console.log("parent:"));

// a job is a collection of tasks that are
// executed in order of declaration
job("build").tasks((task, add) => {
    // adds a top level task to the job. enables reuse.
    add("test");

    // adds a task that is unique to the job.
    // this is added to the job's task map.
    task("test:2", () => console.log("test 2")).if((_) => WINDOWS);
});
```

Deployments are a special kind of job. Deployments support 3 directives: "deploy", "rollback", and 
"destroy".  The default is "deploy"  Deployments have events/hooks that run before
and after the main action that lines up with the directive.  

```ts
deploy({
    id: "local",
    run: (ctx) => {
        console.log(ctx.args);
        console.log("deploying..");
        console.log(ctx.writer.level);
        console.log(ctx.environmentName); // this is set with the --context param in the cli
        ctx.writer.warn("Deploying to the moon");
        ctx.writer.error("Deploying to the moon");
        ctx.writer.debug("Deploying to the moon");
        ctx.writer.info("Deploying to the moon");
    },
    before: (task) => {
        task("before.deploy", (ctx) => {
            console.log("before deploy");
            console.log(ctx.env.get("REX_ENVIRONMENT")); // this the --context param in the cli
        })
    },
    after: (task) => {
        task("after.deploy", () => console.log("after deploy"));
    },
    beforeDestroy: (t) => {
        t("before.destroy", () => console.log("before destroy"));
    },
    destroy: _ => {
        console.log("destroy")
    },

    afterDestroy: (t) => {
        t("after.destroy", (ctx) => {
            console.log(ctx.args);
            console.log("after destroy")
        });
        t("after.destroy:2", (ctx) => {
            console.log(ctx.args);
            console.log("after destroy 2")
        });
    }
});
```

## Install

```bash
deno install --global -A -n rex jsr:@rex/cli@0.0.0-beta.1
```

To install deno, see <https://docs.deno.com/runtime/getting_started/installation/>

## Documentation

Documentation is available on [jsr.io](https://jsr.io/@rex/cli/doc)

## Usage

Basic command line useage.

```bash
deno install --global -A -n rex jsr:@rex/cli@0.0.0-beta.1

# get help
rex -h

# runs the default task
rex task

# runs the default task explicitly
rex task default

# runs a job called build with the debug log level
# options must be passed in before the target or targets.
rex job --log-level debug build
rex job -v debug build

# rex will run a task, job, or deployment if there are not multiple target with
# with the same name with needing to specify the task, deploy, or job sub command.
rex build

# rex will pass in additional arguments to a task, job, or deployment
rex build --my-custom-param value

# pass in environment vars
rex -e "MY_VAR=VALUE" build 

# pass in a dotenv file name
rex --env-file "./path/to/file" build

# deploy a deployment called 'local'
rex deploy local

# rollback a deployment called 'local'
rex rollback local

# destroy a deployment called 'local'
rex destroy local
```

## Rexfile Example

```ts
import { WINDOWS } from "@bearz/runtime-info/os";
import { cmd, job, scriptTask, task, deploy } from "@rex/rexfile";

task("test", (_) => console.log("Hello, world!"));

// a tasks to dependents on other tasks
// the other tasks will run before this task.
task("default", ["test"], async (_) => {
    await cmd("echo", ["Hello, world!"]).run();
})

scriptTask("test:bash", "bash", `
echo 'Hello, world!'
ls -la`);

task("secrets", (ctx) => {
    ctx.secrets.set("secret", "super secret");
});

task("print:secrets", ["secrets"], (ctx) => {
    console.log(ctx.secrets.get("secret"));
    console.log(ctx.env.get("SECRET"));
    ctx.writer.maskLine("My secret is super secret");

    for (const [key, value] of ctx.secrets) {
        console.log(`${key}=${value}`);
    }
});

task("print:env", (ctx) => {
    for (const [key, value] of ctx.env) {
        console.log(`${key}=${value}`);
    }
})
.description("Prints the environment variables");

// use a more declarative style to define a task. 
task({
    id: "inline",
    run: (_) => console.log("inline task"),
    cwd: "/",
});

// a job is a collection of tasks that are
// executed in order of declaration
job("build").tasks((task, add) => {
    // adds a top level task to the job. enables reuse.
    add("test");

    // adds a task that is unique to the job.
    // this is added to the job's task map.
    task("test:2", () => console.log("test 2")).if((_) => WINDOWS);
});

// deploy is a special task/job hybrid where
// the deploy delegate is the primary task.
// before and after are events that will run
// one or more tasks in sequential order, similar
// to job.

// the delegate deploy tasks has a 'before:delpoy'
// and 'after:deploy' event.
// other deploy implementations can implement additional
// custom events that run other sets of tasks.
deploy({
    id: "local",
    run: (ctx) => {
        console.log(ctx.args);
        console.log("deploying..");
        console.log(ctx.writer.level);
        console.log(ctx.environmentName); // this is set with the --context param in the cli
        ctx.writer.warn("Deploying to the moon");
        ctx.writer.error("Deploying to the moon");
        ctx.writer.debug("Deploying to the moon");
        ctx.writer.info("Deploying to the moon");
    },
    before: (task) => {
        task("before.deploy", (ctx) => {
            console.log("before deploy");
            console.log(ctx.env.get("REX_ENVIRONMENT")); // this the --context param in the cli
        })
    },
    after: (task) => {
        task("after.deploy", () => console.log("after deploy"));
    },
    beforeDestroy: (t) => {
        t("before.destroy", () => console.log("before destroy"));
    },
    destroy: _ => {
        console.log("destroy")
    },

    afterDestroy: (t) => {
        t("after.destroy", (ctx) => {
            console.log(ctx.args);
            console.log("after destroy")
        });
        t("after.destroy:2", (ctx) => {
            console.log(ctx.args);
            console.log("after destroy 2")
        });
    }
});

task("get:args", (ctx) => {
    console.log(ctx.args);
});
```


## License

[MIT License](./LICENSE.md)