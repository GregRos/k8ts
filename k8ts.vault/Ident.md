An `Ident` is a hierarchical identifier as an object, and represents types or groups of types of objects in k8s.

It’s an abstract class and there are several subclasses, each specialized for a level of the hierarchy. Each subclass except for the first one has a `parent` which is always another `Ident`.

## Ident_Group
This is an apiGroup. Examples string representations:

Object represnetations:

- `Ident_Group<"">`
- `Ident_Group<"apps">`
- `Ident_Group<"gateway.networking.k8s.io">`

String representations:
- `""` for the default apiGroup.
- `apps`
- `gateway.networking.k8s.io`

## Ident_Version
This is an apiVersion, a [[#Ident_Group]] plus a valid version string. Its parent is [[#Ident_Group]]. 

Object representations:

- `Ident_Version<"", "v1">`
- `Ident_Version<"apps", "v1"`
- `Ident_Version<"gateway.networking.k8s.io", "v1">`
- `Ident_Version<"metrics.k8s.io", "v1beta1">`

String representations:

- `v1`
- `apps/v1`
- `gateway.networking.k8s.io/v1`
- `metrics.k8s.io/v1beta1`
## Ident_Kind
This is a [[#Ident_Group]], [[#Ident_Version]], and a kind string. It identifies the kind of a top-level k8s resource like a Deployment or Service. Its parent is [[#Ident_Version]]. 

Object representations:

- `Ident_Kind<"", "v1", "Namespace">`
- `Ident_Kind<"apps", "v1", "Deployment">`
- `Ident_Kind<"gateway.networking.k8s.io", "v1", "Gateway">`

String representations:

1. `v1/Namespace`
2. `apps/v1/Deployment`
3. `gateway.networking.k8s.io/v1/Gateway`
## Ident_SubKind
This is the kind of a subresource. K8s definers some operational subresources, but that’s not what k8ts subresources are for.

Instead, k8ts declares some entities, such as Containers, to be subresources. K8s doesn’t really care about this, since containers can’t be queried, but for construction it makes sense.

This is meant to split complex resource definitions into more manageable groups of smaller subresources. 

K8ts subresources can be arbitrarily deep. For example, a subresource can itself have subresources. Here are some examples:

- `v1/Pod/Container`
- `v1/Pod/Volume`
- `v1/Pod/Container/VolumeMount`

Unlike other classes, SubKinds are defined recursively, so the parent of a `SubKind` can also be one:

```ts
class Ident_SubKind<Name, Parent extends Ident_Like> {
    // ...
}
```

The object representation of the `VolumeMount` kind is as follows:
```
Ident_SubKind<
    "VolumeMount",
    Ident_SubKind<"Container",
        Ident_Kind<"", "v1", "Pod">
    >
>
```

The parent of a subkin
1. This class is defined recursively.
2. The parent of a SubKind can also be a SubKind.
3. 

Not all subkinds are recognized as k8s. In some cases, they’re just invented by k8ts to better model complex resources.

- `v1/Pod/Container`
- `v1/Pod/Container/VolumeMount`


