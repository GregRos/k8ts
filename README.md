k8ts (pronounced “Kate’s”) is an experimental TypeScript framework for generating k8s manifests. It currently only has a TypeScript API.

# Features

**🔗Reference tracking**
Tracks and validates references between resources, reducing the likelihood of deployment errors.

**📝 Source tracking**
Links manifests to versions, commits, and lines of code using annotations. A single glance at a resource is enough to tell where it came from.

**📂 File-based organization**
Lets you generate resources into separate files, ensuring the output is organized and **human-readable.**

Ideal for deployment using GitOps tools, such as FluxCD.

**🧰 Useful APIs**
Handy abstractions for working with paths, command-lines, environment variables, URLs, and paths. Stuff that commonly appears in k8s manifests.

**🗃️ Metadata management**
A rich, extensible metadata model that lets you easily embed metadata automatically.

**🛠️ Transparent pipeline**
Uses a highly transparent declaration-to-serialization pipeline that can be tapped at any point to do things like:

- Filter resources
- Modify their specs
- Add labels or annotations

🧩 **Highly extensible**
At its core, it’s a framework for _building k8s generators_.

- Uses decorators to capture common functionality.
- Rich dependency graph allows tracking of arbitrary resources.

## Non-features

**😴 Doesn’t deploy anything**
K8ts builds manifest but deployment is handled using other tools, such as FluxCD. This is to be deliberately avoided.

**🙈 Doesn’t look at the cluster**
Doesn’t run queries or check what resources are currently in the cluster.

Some sort of validation mechanism might be added in the future, but at its core, k8ts will always remain **a framework for generating text files.**

# Install

Currently three packages are needed:

```ts
yarn add -D k8ts @k8ts/instruments @k8ts/metadata
```

## Development

Run the full test suite after installing dependencies to make sure everything
builds correctly:

```bash
yarn install
yarn test
```

# Docs

The topmost k8ts abstraction is the World, which captures everything that’s going to be generated.

You create a World like this:

```ts
import { World } from "k8ts"
export const W = World.make({
    name: "everything"
})
```

The World isn’t represented in the output. It also doesn’t actually generate output It’s just an organizational tool.

## Files

Worlds contains Files. These are actually the files that will be generated. Files have a name (always `X.yaml`) and can be either cluster-scoped or namespace-scoped.

Currently, Files are just objects. A single source file can declare multiple Files. However, its’ recommended to declare a single File as a default export.

## Resources

Files contain resources emitted by a generator function.

```ts
import { W } from "./world"

export default W.Scope("cluster") // start with the scope
    .File("namespace.yaml") // then name
    .Resources(function* FILE(FILE) {
        //
        // contents
    })
```

The input to the generator function is a factory that can generate resources of the appropriate scope.

Since we chose to make a cluster-scoped file, we can only create cluster-scoped resources inside it. This creates separation between cluster- and namespace-scoped resources.

For example, we can create namespaces and PVs, but not Deployments or PVCs.

```ts
export default W.Scope("cluster")
    .File("namespace.yaml")
    .Resources(function* FILE(FILE) {
        yield FILE.Namespace("namespace")
        yield FILE.PersistentVolume("pv-cool", {
            capacity: "1Gi",
            accessModes: ["ReadWriteOnce"]
        })
    })
```

If you don’t need the typed helpers, raw manifests can be emitted directly:

```ts
yield FILE.Resource("cm", {
    apiVersion: "v1",
    kind: "ConfigMap",
    data: { key: "value" }
})
```

The nesting structure is pretty deep, but it becomes simpler when you notice that each block is closed by `})`.

Fields are validated by TypeScript, including most fields that contain liters. So we can’t write a string like “xyz” for `capacity` as it would error.
