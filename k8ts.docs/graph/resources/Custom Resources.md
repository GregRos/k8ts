> [!ai] INSERT content
> About how it’s easy to create classes for custom resources because of the framework’s rich structure and high degree of customizability

> [!ai] INSERT content
> Showing creating a custom resource class. Pick one of the manifest types in K8S that aren’t implemented.
> Extend ResourceTop
> Show constructing an [[Ident]] for the class
> Show how the props type is specified via generics
> Show how we avoid duplicating the constructor

> [!ai] INSERT content
> Note the abstract methods and how they should be implemented.
>
> 1. Make note that `ident` must be a getter or an error is thrown.
> 2. Show implementing `body` to generate the manifest body

> [!ai] INSERT explanation about overriding `__manifest__` etc
> Show how `__manifest__` and `__metadata__` can be overriden to customize manifestation.

> [!ai] INSERT integrating class into World
> Show creating a World with extra resource classes
