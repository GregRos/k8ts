---
aliases:
  - forward references
cssclasses:
---
Sometimes, an [[Origin]] needs access to resources from other [[Origin|Origins]]. For example, one file might define a PersistentVolume, and another file might define a PersistentVolumeClaim bound to that PV. 

Other scenarios include:
1. Referencing a namespace resource actually declared in another file.
2. Referencing gateways by HTTP routes.
3. Using reference grants.

Most [[Origin|Origins]] are evaluated lazily when needed, and some situations require circular references between [[Origin|Origins]] or resources, which might be cross-file.

All these things mean resolving inter-resource reference eagerly can lead to circular reference errors. Forward references let calling code delay resolving references as much as possible, but ensure doing so is totally transparent.
## What are they?
Forward references are **JavaScript Proxy objects**, which means they don’t act like normal JS objects and instead basic object access operations are resolving dynamically, by invoking functions.

At their core, they’re an object that has an [[Origin]] and a [[RefKey]]. The [[RefKey]] contains basic information about the resource, such as a name, a kind, and so on. That’s often enough to satisfy references. 

However, they’re typed like the real [[Resource]] object, and when code tries to access an unknown property, it causes the underlying [[Resource]] object to be resolved.

This is done by searching for it in the [[Origin]]’s [[exports]] for a [[Resource]] matching the [[RefKey]]. 

After this happens, the forward reference will just act like the [[Resource]] object.
## Runtime behavior
Because forward references don’t behave like normal JS objects, this section explains how they behave when used in different JS operations.

> [!ai] INSERT summary
> Insert a summary of the behavior specified below.
### 🔍 getPrototypeOf
This will retrieve the resource’s expected class using the [[RefKey]] and return the prototype. It won’t cause the resource to be resolved.

This means code like this will work fine:
```ts
if (fwRef instanceof Deployment) {
    // ...
}
```
### Property or method access
This includes `has`, `get`, and `getPropertyDescriptor`.

The operation will always work, but how it resolves depends on the property.

Generally speaking, it will avoid resolving the [[Resource]] if the property or method uses information that’s part of the forward reference itself. This only includes:

1. The resource name.
2. The resource kind property, wh
3. That includes the `name`, `kind`, `key`, and the class of the referenced resource.

> [!ai] INSERT code sample
> Showing which operations typically resolve the ForwardRef and which dont

> [!todo] ForwardRef.toString etc
> Right now, calling `toString`, getting `Symbol.toStringTag`, etc, will end up resolving the resource.
> But these can be handled in `ForwardRefInner` using info from the RefKey.
#### ❓ built-in Object key
> [!task]
> Currently, accessing an inherited Object key on a [[forward reference]] will have undefined behavior. This should be fixed by handling the Object call.

Behavior depends on the key accessed or method invoked.
#### 🔍 equals(…)
Determines equality based on the [[RefKey]].
#### 🔍 is(ident) | is(cls)
Works like normal. With `cls`, uses the expected class of the resource.
#### 🔍 assert(cls)
Makes sure that the expected class of the referenced resource is an instanceof `cls`.

Returns `this`.
#### 🔍 “name”, “kind”, or “key” properties
In this case, the information will be retrieved from the [[RefKey]]. It won’t resolve the reference.
#### 🔍 `is` and `assert` methods
These don’t resolve the resource.
#### ⚡other properties
This will cause the reference to be resolved by iterating the [[Origin]]'s exports until it produces the desired [[Resource]].
### ⚡List keys
This **resolves the reference** and lists its keys, plus some own keys of the forward reference itself, skipping duplicates.
### ⚡Mutation
Includes `delete`, `set`, `definePropertytDescriptor`, and `setPrototypeOf`. These **resolve the resource** and apply the operation on it.
## Gotchas
Forward references are tricky for a few reasons.
#### Comparing with ===
A forward reference acts like a [[Resource]] object but is distinct from it. That will make `===` checks fail. The [[equals]] method should be used instead.
#### Delayed errors
Forward references are validated by the compiler as part of computing the type of each [[Origin]], but they can’t be validated during runtime by definition, as this would require resolving the source [[Origin]].

This means that a non-existent reference might only be caught when the resource that needs it is [[manifest|manifested]].
#### Unexpected side-effects
Accessing arbitrary properties on a forward reference will cause the underlying [[Origin]] to be evaluated, which can lead to side-effects.
#### Circular references
While forward references allow circular references to work in some cases, in others they will still result in an error. Let’s take a closer look at how this works.

For the following examples, let’s say we have two origins and resources:

```yaml
a.yaml:
    - &Abc Abc:
          needs: 
              - *Xyz
    - &Def Def
b.yaml:
    - &Xyz Xyz:
          needs:
              - *Abc
              - *Def
# Here, `needs` means “needs during construction.”                
```

> [!ai] REPLACE the above description with code
> The code should construct two File Origins with fictional resource types. Mark the different circular reference types

Whether this configuration will work depends on how the forward references are used by each resource.
##### Typing issues
Referencing resources between two origins can cause type inference to fail if the type of a [[Resource]] from `a.yaml` depends on the type of a [[Resource]] from `b.yaml` and vice versa.

This can happen unexpectedly. Such issues can be resolved using explicit type annotations. You can use very abstract types like `Resource_Ref` or `Resource_Entity` or more concrete types.
##### Pure references
When a [[Resource]] just needs the name and [[Ident]] of another resource. It’s quite common in k8s manifests.

This information is stored in the [[RefKey]] itself, so the referenced resource won’t need to be resolved at all.
##### Direct circular references
Let’s say that `Abc` uses `Xyz.foo` and `Xyz` uses `Abc.bar`.

This can still work, provided one of the properties is used at a different init stage than the other. For example, if `Abc.bar` is only accessed in `Xyz/Part1`, a [[Resource Part]]. 

When `Xyz/Part1` is constructed `Xyz` will already exist, so `Abc` won’t have an issue resolving `Xyz.foo`.

However, if this separation doesn’t apply, it will still result in an error in spite of forward references being used.
##### Adjacent circular references
This happens when `Abc` needs `Xyz` but `Xyz` needs `Def`, which is constructed after `Abc` in `a.yaml`’s [[exports]].

This will work if `Def` is only accessed by name/[[Ident]] or multiple init stages are involved. It won’t work if `Abc`, `Xyz`, and `Def` access each other during construction. 

In this case, it might be best to do one of the following:

1. Use a [[Section]] or similar [[Origin]] around `Abc`. This will make sure it gets resolved after `Def`.
2. Construct `Def` before `Abc`.
3. 