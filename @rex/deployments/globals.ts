import { DeploymentHandlerRegistry, DeploymentMap } from "./types.ts";

const REX_DEPLOYMENTS_SYMBOL = Symbol("@@REX_DEPLOYMENTS");
const REX_DEPLOYMENT_REGISTRY_SYMBOL = Symbol("@@REX_DEPLOYMENTS_REGISTRY");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_DEPLOYMENTS_SYMBOL]) {
    g[REX_DEPLOYMENTS_SYMBOL] = new DeploymentMap();
}

if (!g[REX_DEPLOYMENT_REGISTRY_SYMBOL]) {
    g[REX_DEPLOYMENT_REGISTRY_SYMBOL] = new DeploymentHandlerRegistry();
}

/**
 * Gets the global deployment map for rex.
 * @returns The global deployment map.
 */
export function rexDeployments(): DeploymentMap {
    return g[REX_DEPLOYMENTS_SYMBOL] as DeploymentMap;
}

/**
 * Gets the global deployment handler registry for rex.
 * @returns The global deployment registry.
 */
export function rexDeploymentHandlerRegistry(): DeploymentHandlerRegistry {
    return g[REX_DEPLOYMENT_REGISTRY_SYMBOL] as DeploymentHandlerRegistry;
}
