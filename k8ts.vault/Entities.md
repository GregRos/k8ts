# Entities
An Entity is a subclass of the `Entity` base class. Both Resources and Origins are Entities. An Entity represents a core part of the k8ts domain.

Entities are similar to the AWS SDK [Construct](https://github.com/aws/constructs), but they’re wider in scope, and include things like files, folders, or groups of system entities. 

## Shared qualities
Entities share a number of key qualities.
### Mutable
Entities are deliberately mutable and can be modified in various ways after construction.
### Equatable
Entities support equality via `.equals`. This generally uses reference equality via `Object.is`, except for the special case of [[forward references]] which are compared by their [[RefKey]]



