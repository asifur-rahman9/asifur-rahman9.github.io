// index.astro reads GITHUB_TOKEN from the build environment (Node). Declared here so the
// project type-checks without pulling in all of @types/node.
declare const process: { env: Record<string, string | undefined> };
