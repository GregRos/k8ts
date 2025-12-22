# Special syntax
The k8ts packages use some specific JS/TS features in non-standard/unique ways.

## Construction

- Core k8ts objects are often part of long inheritance hierarchies.
- Many objects cause side-effects when they are constructed
- Constructor signatures can be a bit complicated.

To avoid duplicating constructor signatures, we'll often use a trick to embed side-effects into the class initializer. Here is a dummy example of how this might work:

```ts
class B {
    constructor(a: number, b: string, c: object) {}
}
class A extends B {
    #_ = (() => {
        if (this.b === "") {
            throw new Error("Cannot be empty string")
        }
        this.b = this.b.toUpperCase()
        
    })()
}
```

The initializer runs *after* parent class constructors but *before* the constructor of the current class, if any. If the class has a constructor we don't use this trick.

For static initializers, the `static { ... }` block can be used, but instance initializers lack this feature.

## Associating types using overrides

- We may want to associate a type with a class.
- We want to avoid defining it as a type parameter to avoid complicating the class signature.

We do this by defining a child class that declares the same member with a different type:

```ts
class Parent {
    readonly example: ParentThing
}

class Child {
    declare readonly example: ChildThing
}
```

We can then access the appropriate type using `this["example"]`.

## Using getters to avoid init issues

- We want to enforce members on classes via `implements` or `abstract`
- Classes cause side-effects during construction.
- These side-effects might be activated before a class is fully initialized.
- They might need to access the abstract member.

In this case, we can't declare the member as a field, since its initializer might not have run yet.

Instead, we can declare the member using a `getter` which gets defined on the prototype and so always works.

In Python this would just be achieved using `static` members but those work differently in JS.

```ts
class Base {
    abstract get kind(): Kind_Base
}

class Deployment extends Base {
    get kind() {
        return apps.v1.Deployment._
    }
}
```

## Tracking stuff using async_hooks

- When a Resource is created, it attaches itself to an Origin as a side-effect.
- The Origin it attaches to depends on the syntactic scope the `new` call is in and other stuff.

We keep track of the current Origin using node's `async_hooks`. These don't actually persist in iterables, which is why we create a patched `Iterator` to make sure the Origin is persisted there too.

## Exporting using generators uses Proxy objects
A parent thing (resource or origin) defines child thing using a generator. It uses `yield` to "export" stuff out and that stuff can be referenced by name.

This is type checked during compile time. However, during runtime, invalid references might only be caught at late stages of the manifest generator pipeline.

 Here is how it looks like:

```ts
const file = W.File({
    *FILE(FILE) {
        yield new Deployment("hi-there", {
            // ...
        })
    }
})
const deploymentRef = file["Deployment/hi-there"] // acts like a Deploymnet instance
console.log(deploymentref.props.$strategy) // Access a property
```

The `W.File` call actually returns a Proxy that doesn't execute the generator right away. It's only executed when:

1. Something tries to go over the file's resources
2. The user tries to access the Proxy object, such as by getting its fields.

When (2) happens, the generator is invoked and iterated until the desired resource is reached. The Proxy object then acts like the found object.

This involves two Proxies:

1. The FwRefernce_Exports proxy for the `file` object itself.
2. The `FwReference` proxy for the `Deployment` stand-in.
