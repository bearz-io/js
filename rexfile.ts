import { WINDOWS } from "@bearz/runtime-info/os";
import { cmd, deploy, job, scriptTask, task } from "@rex/rexfile";

task("test", (_) => console.log("Hello, world!"));

// a tasks to dependents on other tasks
// the other tasks will run before this task.
task("default", ["test"], async (_) => {
    await cmd("echo", ["Hello, world!"]).run();
})
    // only run on non-windows
    .if((_) => !WINDOWS);

scriptTask(
    "test:bash",
    "bash",
    `
echo 'Hello, world!'     
ls -la`,
);

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

task({
    id: "inline",
    run: (_) => console.log("inline task"),
    description: "An inline task",
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
    id: "deploy",
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
        });
    },
    after: (task) => {
        task("after.deploy", () => console.log("after deploy"));
    },
    beforeDestroy: (t) => {
        t("before.destroy", () => console.log("before destroy"));
    },
    destroy: (_) => {
        console.log("destroy");
    },

    afterDestroy: (t) => {
        t("after.destroy", (ctx) => {
            console.log(ctx.args);
            console.log("after destroy");
        });
        t("after.destroy:2", (ctx) => {
            console.log(ctx.args);
            console.log("after destroy 2");
        });
    },
});

task("get:args", (ctx) => {
    console.log(ctx.args);
});
