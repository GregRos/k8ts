# K8ts
k8ts (pronounced “Kate’s”) is an experimental TypeScript framework for generating k8s manifests.

# Features

**🔗Reference tracking**
Tracks and validates references between resources; reduces deployment issues.

<!-- **📝 Source tracking**
Uses metadata to link deployed manifests to source lines, commits, and package versions. -->

**📂 File-based organization**
Declaratively organize manifests into separate files. Ideal for deployment using GitOps tools, such as FluxCD.

<!-- **🧰 Useful APIs**
Handy abstractions for working with paths, command-lines, environment variables, etc. -->

**🗃️ Metadata management**
A rich, extensible metadata model that lets you easily embed metadata automatically.

**🛠️ Hackable pipeline**
Uses a generation pipeline that can be tapped at any point to filter resources, modify them, or add metadata.
<!-- 
🧩 **Highly extensible**
Designed to accomodate all possible k8s resources, with flexible dependency and origin tracking systems. -->

## Non-features

**😴 Doesn’t deploy anything**
It just generates (and validates) YAML. That's it.

**🙈 Doesn’t look at the cluster**
Doesn't query your cluster. It only knows about resources you tell it about.

# Install
Install the following packages:

```ts
yarn add -D k8ts @k8ts/instruments @k8ts/metadata
```

# Usage
First, create a World. This is the parent of all resources you define.

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
            $capacity: "1Gi",
            $accessModes: ["ReadWriteOnce"]
        })
    })
```

The nesting structure is pretty deep, but it becomes simpler when you notice that each block is closed by `})`.

Fields are validated by TypeScript, including most fields that contain liters. So we can’t write a string like “xyz” for `$capacity` as it would error.
