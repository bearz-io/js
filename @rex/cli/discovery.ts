import { RexfileDiscovery, DiscoveryPipeline, type DiscoveryPipelineContext } from "@rex/pipelines/discovery";
import { writer } from "@rex/pipelines/ci";
import { ObjectMap, StringMap, Outputs, type ExecutionContext } from "@rex/primitives";
import { DefaultLoggingMessageBus } from "@rex/pipelines/bus";
import { TaskMap } from "@rex/tasks";
import { JobMap } from "@rex/jobs";
import { DeploymentMap } from "@rex/deployments";

const discoveryPipeline = new DiscoveryPipeline();
discoveryPipeline.use(new RexfileDiscovery());

let tasksCache : undefined | string[] = undefined;
let jobsCache : undefined | string[] = undefined;   
let deploymentsCache : undefined | string[] = undefined;
let allCache : undefined | string[] = undefined;

export async function discoverTargets(): Promise<void> {
    if (tasksCache === undefined) {
        const ctx: ExecutionContext = {
            services: new ObjectMap(),
            secrets: new StringMap(),
            variables: new ObjectMap(),
            env: new StringMap(),
            cwd: Deno.cwd(),
            outputs: new Outputs(),
            writer: writer,
            bus: new DefaultLoggingMessageBus(),
            signal: new AbortController().signal,
            environmentName:  "local",
        };

        const discoveryContext: DiscoveryPipelineContext = Object.assign({}, ctx, {
            tasks: new TaskMap(),
            jobs: new JobMap(),
            deployments: new DeploymentMap(),
            bus: new DefaultLoggingMessageBus(),
        });

        const res = await discoveryPipeline.run(discoveryContext);
        if (!res.error) {
            tasksCache = res.tasks.keys().toArray();
            jobsCache = res.jobs.keys().toArray();
            deploymentsCache = res.deployments.keys().toArray();
            allCache = [...new Set(tasksCache.concat(jobsCache).concat(deploymentsCache))];
        }
    }
}

export async function getTasks(): Promise<string[]> {
    await discoverTargets();
    return tasksCache ?? [];
}

export async function getJobs(): Promise<string[]> {
    await discoverTargets();
    return jobsCache ?? [];
}

export async function getDeployments(): Promise<string[]> {
    await discoverTargets();
    return deploymentsCache ?? [];
}

export async function getAll(): Promise<string[]> {
    await discoverTargets();
    return allCache ?? [];
}