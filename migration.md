# Keys
All k8ts-specific top-level keys start with `$`. Only these are accessible by default.

## $$manifest
Every resource also exposes `$$manifest` which allows to specify manifest properties not directly supported by k8ts. This applies to top-level resources and lower-level resources.

For example `hostNetwork: true` needs to be set via a pod's `$$manifest` key.
