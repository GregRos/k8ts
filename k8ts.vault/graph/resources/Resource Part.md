---
aliases:
  - Rsc parts
  - Resource Parts
---
One of the goals of k8ts is to model every k8s manifest, including ones that don’t exist yet. This means that every resource should be represented with an [[Resource]] class.

However, k8s manifests can be quite complex, and k8ts isn’t shy of introducing a bit of new structure to describe that complexity. One way it does this is via [[Origin|Origins]]. [[Resource Part|Rsc parts]] are another way.

These objects represent 

[[Resource Part|Rsc parts]] are child [[entity|Entities]] of [[Resource]] objects. In other words, they’re components of a k8s resource. [[Resource Part|Rsc parts]] share a lot in common with resources:

1. They’re uniquely identifiable
2. They can also have child [[entity|Entities]] which are also [[Resource Part|Rsc parts]]
3. They’re mutable

## Use-cases
[[Resource Part|Rsc parts]] are used in several contexts.

### Deferring evaluation and dependencies
The [[Resource Part]] objects that belong to an [[Resource]] object may be deferred using a generator or other lazy mechanism. 

When an [[Resource]] [[need|needs]] other [[Resource]] objects, such as a Pod that [[need|needs]] a Pvc, or a Service that forewords a Container’s ports, these relationships can be anchored in deferred [[Resource Part|Rsc parts]] rather than the resources themselves.

This allows for flexibility while evaluating a resource, ensuring only needed [[Resource]] objects are evaluated. It also allows for circular references between [[Origin|Origins]] or even [[Resource]] objects through deferred execution.

When the `__needs__` relation of the topmost [[Resource]] is evaluated, it will yield the 
### A way to navigate complex resources
Resources such as Deployments are very complex. By breaking them up into a top [[Resource]] and a tree of [[Resource Part|Rsc parts]], the result becomes easier to understand and navigate during manifestation.

This structure is exposed via an [[Resource]] object’s [[entity]] relationship members, such as `__kids__`.





Sometimes, [[Resource Part|Rsc parts]] [[need]] other [[Resource]] objects to function. For example, a


1. They’re [[Node|Nodes]] in a parent-child graph, with the root being the [[Resource]] itself

An [[Resource Part]] is not a k8s resource. Instead, it’s a component or part of a resource. But it does share some qualities with k8s resources.

1. It has a name unique to its containing resource.
2. It can also have [[Resource Part|Rsc parts]] 

However, it can introduce new structure. One of the ways it does this is via [[Resource Part|Rsc parts]], which represent nested objects or components of a resource that still have a unique identity.

One example of this is a Container. In k8s, it’s not a resource, but it does have a unique identity composed of its container name and the pod it belongs to.

You can’t have two Containers with the same name in the same pod. Within a Container, the same applies to Volume Mounts. You can’t have two volumes mounted at the same path.

In a Pod, you can’t have two Volumes with the same name either, so those are [[Resource Part|Rsc parts]] too.

Normal instances of the [[Resource]] class are top-level resources, while
An [[Resource Part]] is a component resource of a 

but it does introduce some new **subresources**. K8s definers some operational subresources, but that’s not what k8ts subresources are for.

Instead, k8ts declares some entities, such as Containers, to be subresources. K8s doesn’t really care about this, since containers can’t be queried, but for construction it makes sense.

This is meant to split complex resource definitions into more manageable groups of smaller subresources. 

Sometimes, subresources themselves have subresources. For example:

- `Container_Volume_Mount` is a subresource of:
- `Pod_Container` which is a subresource of:
- `Pod `

This… doesn’t quite make sense. a Pod_Container is actually a subresource of PodTemplate

a `Container_Volume_Mount` is a subresource of 