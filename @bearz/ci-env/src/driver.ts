import { env } from "@bearz/env";

/**
 * The CI provider.
 */
export type CiDriver =
    | "local"
    | "github"
    | "gitlab"
    | "bitbucket"
    | "azdo"
    | "jenkins"
    | "travisci"
    | "appveyor"
    | "circleci"
    | "codeship"
    | "drone"
    | "gitea";

let provider: CiDriver = "local";

if (env.get("GITEA_WORK_DIR") !== undefined) {
    provider = "gitea";
} else if (env.get("GITHUB_ACTIONS") === "true" || env.get("GITHUB_WORKFLOW") !== undefined) {
    provider = "github";
} else if (env.get("GITLAB_CI") === "true") {
    provider = "gitlab";
} else if (
    env.get("TF_BUILD") === "True" || env.get("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI") !== undefined
) {
    provider = "azdo";
} else if (env.get("BITBUCKET_BUILD_NUMBER") !== undefined) {
    provider = "bitbucket";
} else if (env.get("JENKINS_URL") !== undefined) {
    provider = "jenkins";
} else if (env.get("TRAVIS") === "true") {
    provider = "travisci";
} else if (env.get("APPVEYOR") === "True") {
    provider = "appveyor";
} else if (env.get("CIRCLECI") === "true") {
    provider = "circleci";
} else if (env.get("CI_NAME") === "codeship") {
    provider = "codeship";
} else if (env.get("DRONE") === "true") {
    provider = "drone";
}

/**
 * The CI provider.
 */
export const CI_DRIVER: CiDriver = provider;
/**
 * Determines if the current environment is a CI environment.
 */
export const CI: boolean = CI_DRIVER !== "local" || env.get("CI") === "true";
