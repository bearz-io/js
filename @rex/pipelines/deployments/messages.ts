import { BaseMessage } from "../bus.ts";
import type {
    Deployment,
    DeploymentMap,
    DeploymentResult,
    DeploymentState,
} from "@rex/deployments";

/**
 * Deployment started message
 */
export class DeploymentStarted extends BaseMessage {
    /**
     * Creates a new DeploymentStarted message.
     * @param state The deployment state.
     * @param directive The directive.
     */
    constructor(
        public readonly state: DeploymentState,
        public readonly directive: "deploy" | "rollback" | "destroy",
    ) {
        super("deployment:started");
    }
}

/**
 * Deployment completed message
 */
export class DeploymentCompleted extends BaseMessage {
    /**
     * Creates a new DeploymentCompleted message.
     * @param state The deployment state.
     * @param result The deployment result.
     * @param directive The directive.
     */
    constructor(
        public readonly state: DeploymentState,
        public readonly result: DeploymentResult,
        public readonly directive: "deploy" | "rollback" | "destroy",
    ) {
        super("deployment:completed");
    }
}

/**
 * Deployment skipped message
 */
export class DeploymentSkipped extends BaseMessage {
    /**
     * Creates a new DeploymentSkipped message.
     * @param state The deployment state.
     * @param directive The directive.
     */
    constructor(
        public readonly state: DeploymentState,
        public readonly directive: "deploy" | "rollback" | "destroy",
    ) {
        super("deployment:skipped");
    }
}

/**
 * Deployment failed message
 */
export class DeploymentFailed extends BaseMessage {
    /**
     * Creates a new DeploymentFailed message.
     * @param state The deployment state.
     * @param error The error that caused the failure.
     * @param directive The directive.
     */
    constructor(
        public readonly state: DeploymentState,
        public readonly error: Error,
        public readonly directive: "deploy" | "rollback" | "destroy",
    ) {
        super("deployment:failed");
    }
}

/**
 * Deployment cancelled message
 */
export class DeploymentCancelled extends BaseMessage {
    /**
     * Creates a new DeploymentCancelled message.
     * @param state The deployment state.
     * @param directive The directive.
     * @param reason The reason for the cancellation.
     */
    constructor(
        public readonly state: DeploymentState,
        public readonly directive: "deploy" | "rollback" | "destroy",
        public readonly reason = "cancelled",
    ) {
        super("deployment:cancelled");
    }
}

/**
 * Deployment dependencies missing message
 */
export class MissingDeploymentDependencies extends BaseMessage {
    /**
     * Creates a new MissingDeploymentDependencies message.
     * @param deployments The deployments with missing dependencies.
     */
    constructor(public readonly deployments: Array<{ deployment: Deployment; missing: string[] }>) {
        super("deployment:missing-dependencies");
    }
}

/**
 * Cyclical deployment references message
 */
export class CyclicalDeploymentReferences extends BaseMessage {
    /**
     * Creates a new CyclicalDeploymentReferences message.
     * @param deployments The deployments with cyclical references.
     */
    constructor(public readonly deployments: Deployment[]) {
        super("deployment:cyclical-references");
    }
}

/**
 * Deployment not found message
 */
export class DeploymentNotFound extends BaseMessage {
    /**
     * Creates a new DeploymentNotFound message.
     * @param deploymentName The name of the deployment that was not found.
     */
    constructor(public readonly deploymentName: string) {
        super("deployment:not-found");
    }
}

/**
 * List deployments message
 */
export class ListDeployments extends BaseMessage {
    /**
     * Creates a new ListDeployments message.
     * @param deployments The deployments to list.
     */
    constructor(public readonly deployments: DeploymentMap) {
        super("deployment:list");
    }
}
