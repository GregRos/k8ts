The [[RefKey]] is an object that uniquely identifies a top-level resource, the kind that’s defined in a manifest file.

It combines:
- The resource’s [[Kind]]
- The resource’s name
- The resource’s namespaces, if any.

It has a string representation such as:

```
apps/v1/Deployment/kube-system/something
gateway.networking.k8s.io/v1/Gateway/example
```

In k8s, this would uniquely identify a resource in the system. In k8ts, it’s used by [[forward references]] to determine if they’re [[equal]] to something else.
## Note about child resources
In principle the [[RefKey]] can be extended to child resources, such as `Pod_Container` objects.

In that case, it would need to combine the names of all parent resources:

```
.../Deployment/d/PodTemplate/pt/Container/c
```

Right now this isn’t implemented since child resources can’t be forward referenced right now.

