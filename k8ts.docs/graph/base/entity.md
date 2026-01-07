---
aliases:
  - Entities
---
# Entities
An entity is a subclass of the `Entity` base class. It includes both [[Resource|Resources]] and [[Origin|Origins]].

Entities are similar to the AWS SDK [Construct](https://github.com/aws/constructs), but they’re wider in scope, and include things like files and groups of resources.

Entities receive a `Props` object that fully describes their structure. Any properties or methods defined on entity are always based on this props object.
### Mutable
The props of an entity 

```ts
const svc = new Service(myDeployment, {
  type: "LoadBalancer",
})
svc.$ports.push({
  port: 8080,
  targetPort: 80,
})
```

> [!ai] INSERT code sample
> Create a Service and then modify some of its props
### Equatable
Entities support equality via `.equals`. While references are normally only equal if they’re the same object, [[ForwardRef|forward references]] and  [[ForwardExports]] objects can point to the same resource and yet be distinct by reference.

> [!ai] INSERT code sample
> Show using `.equals` with a ForwardRef and ForwardExports compared with actual resolved objects.
### Entity graphs
Entities form a graph with several possible relations:

1. Parent-child relations between entities of similar kinds
2. Dependency relation between entities of similar kinds
3. Containment relation between entities of different kinds

> [!ai] INSERt mermaid diagram
> Show real entities and connections between them. Show a File Origin with containment to a Deployment which has relation to PodTemplate to container
> And then a Service that has [[need|needs]] to the Deployment.
### Side-effects on construct
Constructing an Entity usually has side-effects, even if it’s done using a regular constructed.

For example, constructing a [[Resource]] will make k8ts find an appropriate [[Origin]] and attach it.

> [!ai] INSERT code
> Show a resource being created and its Origin property checked
### Nodes
All entities have an associated [[Node]], which makes it more convenient to navigate entity graphs.

## Shared API
> [!ai] INSERT description of core entity API
> Including `__needs__`, `__kids__`, `__parent__`, etc.
