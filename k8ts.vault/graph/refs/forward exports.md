When you construct an [[Origin]] that contains [[Resource|Resources]], you always get a [[forward exports]] object rather than the origin object itself.

The [[forward exports]] object is a **JavaScript Proxy Object** that doesn’t act like normal objects. 
## Exported resources
The [[forward exports]] object lets you reference all resources exported using `yield` from the [[Origin]]’s [[exports]]. 

You do that by looking up properties of the form `${Kind}/${Name}`, such as:
- `Deployment/abcxyz`
- `Service/networking`
- `Namespace/test`

> [!ai] INSERT code sample
> Replace the above list with examples if referencing these resources from an imported File

During compilation, you can see all the possible resource names that can be referenced, and you’ll get an error if you try to access one that doesn’t exist.

**But there is no runtime validation for that. It will only error when something tries to resolve the reference.** 

This is because to make [[forward reference|forward references]] work and defer resolution as much as possible, the [[forward exports]] can’t know which objects are going to be exported ahead of time.

You’ll get a seemingly valid [[forward reference]] as long as you access the key `Kind/Name` for a valid `Kind` and a legal `Name`. 

> [!ai] INSERT code sample showing different key access
> Create a File origin with one exported resource.
> 1. Show referencing the resource
> 2. Use `@ts-expect-error` for code accessing non-existing export
> 3. Console.log non-existent export, should still 

## Runtime behavior
This section describes how the [[forward exports]] object acts during runtime. Since it’s a **JavaScript Proxy Object**, it’s behavior differs from that of normal objects.

> [!ai] INSERT Behavior summary
> Insert a summary of the behavior specified below.
### ✅ getPrototypeOf
Returns `Rsc_FwRef_Exports_Proxied.prototype`, a minimal class that wraps the [[Origin]] and exposes it via `__entity__`.
### ✅ Accessing keys
This includes `get`, `has`, `getPropertyDescriptor`. The behavior depends on the key.

> [!todo] ForwardExports.toString etc
> Right now, calling `toString`, getting `Symbol.toStringTag`, etc, won’t work properly.
> Implement these on `ForwardExports` by delegating to the underlying origin.
#### `__entity__()`
Exposes the underlying [[Origin]].
#### Inherited object key
> [!todo] Accessing Object keys
> Accessing inherited object keys currently leads to unspecified behavior. This should be fixed by delegating to the Object call.

Returns the normal `Object` property descriptor.
#### A reference key: `Kind/Name`
Applies when `Kind` is a known [[Ident]] kind name, like `Deployment`, and `Name` is a legal name.

1. It will always exist.
2. Its value will always be a [[forward reference]]
3. It will always be:
    1. a value key
    2. enumerable
    3. non-writable
    4. non-configurable
#### Anything else
The key won’t exist.
### ⛔ Mutation
This includes `delete`, `set`, `defineProperty`, and `setPrototypeOf`. They will throw errors.

This object behaves very different from a normal JS object, and modifying it doesn’t make sense.

> [!ai] INSERT code sample showing mutation
> Create a File and show code trying to mutate it, resulting in an error.
### ⛔ List keys
This will throw an error, as will any attempt to iterate over the object.

This object has an infinite number of keys, so this operation doesn’t make sense.

> [!ai] INSERT code sample showing iteration
> Create a File and show code iterating over it, resulting in an error.


> [!todo]
> Sometimes, the current system will resolve references for resources that haven’t been exported using `yield`. But only if the origin has been fully resolved.
> 
> This should be fixed. Either never allow referencing them or always allow doing so.

> [!todo]
> The current *export name*, the name under which a resource is accessible, can easily lead to several conflicts.
> 
> The *export name* is currently `Kind/Name`, such as:
> 
> - `Deployment/xyz`
> - `Thingy/abc`
> 
> That means the following situations will lead to conflicts, which right now result in undefined behavior. They should be caught early and throw an error.
> 
>1. **Same resource, different namespace**
Since the namespace isn’t included in the export name, exporting resources of the same kind and with the same name, but different namespaces, will cause a conflict.
> 
> 2. **Different Ident** 
>    Because the *export name* doesn’t include the full [[Ident]] of the resource, resources such as:
> - `Thing/v1/abc`
> - `OtherThing/v1/abc`
> - `Thing/v1beta2/abc`
> 
> Will cause conflicts.