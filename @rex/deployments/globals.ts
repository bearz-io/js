import { DeploymentMap, DeploymentRegistry } from "./primitives.ts";

const REX_DEPLOYMENTS_SYMBOL = Symbol("@@REX_DEPLOYMENTS");
const REX_DEPLOYMENT_REGISTRY_SYMBOL = Symbol("@@REX_DEPLOYMENTS_REGISTRY");

const g = globalThis as Record<symbol, unknown>;

if (!g[REX_DEPLOYMENTS_SYMBOL]) {
    g[REX_DEPLOYMENTS_SYMBOL] = new DeploymentMap();
}

export const REX_DEPLOYMENTS = g[REX_DEPLOYMENTS_SYMBOL] as DeploymentMap;

if (!g[REX_DEPLOYMENT_REGISTRY_SYMBOL]) {
    g[REX_DEPLOYMENT_REGISTRY_SYMBOL] = new DeploymentRegistry();
}

export const REX_DEPLOYMENT_REGISTRY = g[REX_DEPLOYMENT_REGISTRY_SYMBOL] as DeploymentRegistry;
