---
aliases:
---
[[Origin|Origins]] like [[File]] that contain [[Resource|Resources]] construct those resources in a generator called [[exports]]. The result of constructing such an [[Origin]] is a [[forward exports]] object.

Anything yielded from the [[exports]] generator can be referenced from outside the [[Origin]] that contains it through the [[forward exports]], taking the form of a [[forward reference]].

> [!ai] INSERT code sample showing exports file a File.
## Yielding child Origins
Yielding a child [[Origin]] will also yield that [[Origin]]’s exports, **after** all the [[Origin]]’s own exports. 

This makes child [[Origin|Origins]] like [[Section]] useful for deferring resource construction.
> [!ai] INSERT code sample showing yielding a Section from a File
## Constructing Resources
Every top-level [[Resource]] constructed inside the [[exports]] generator is attached to the [[Origin]], even if it’s not yielded. 

This means it will be [[manifest|manifested]] as part of it.
> [!ai] INSERT code sample showing a resource constructed but not yielded
> comment says the resource is still manifested as part of the file it’s in.

## Scoped factory object
[[exports]] receives a [[Scoped Factory]] object. This object lets you listen to [[origin events]] and perform [[Origin]]-specific operations. 

The `__entity__()` method lets you access the actual [[Origin]] object.