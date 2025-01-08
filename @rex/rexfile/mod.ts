/**
 * # @rex/rexfile
 *
 * The rex module is a meta module that makes it
 * easy to pull in core tasks, jobs, deployment primitives
 * and scripting helpers for writing tasks.
 *
 * ## Documentation
 *
 * See the [cli module](https://jsr.io/@rex/cli/doc) for a basic overview.
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 * @module
 */
export * from "./scripting.ts";
export {
    Inputs,
    type LoggingMessageBus,
    LogLevel,
    Outputs,
    type RexWriter,
    StringMap,
} from "@rex/primitives";

export {
    output,
    rexTaskHandlerRegistry,
    rexTasks,
    type RunDelegate,
    type Task,
    task,
    TaskBuilder,
    type TaskContext,
    type TaskHandler,
    TaskMap,
    toError,
    usesTask,
} from "@rex/tasks";
export { type Job, job, JobBuilder, type JobContext, JobMap, REX_JOBS } from "@rex/jobs";
export { script, scriptTask, ScriptTaskBuilder } from "@rex/tasks-scripts";
export {
    type Deploy,
    deploy,
    type Deployment,
    DeploymentBuilder,
    type DeploymentContext,
    type DeploymentHandler,
    DeploymentMap,
    REX_DEPLOYMENT_REGISTRY,
    REX_DEPLOYMENTS,
} from "@rex/deployments";
