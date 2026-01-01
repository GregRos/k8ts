---
aliases:
  - Nodes
---
Nodes are wrappers around [[entity|Entities]] that allow navigating entity graphs. This allows parents, children, dependencies, and contained entities to be found more easily.

Nodes have an `equals` method that returns true if they’re wrapping the same [[entity]]. An [[entity]] must be fully resolved to produce a [[Node]], so you can’t get a [[Node]] for a [[forward reference]].

> [!ai] INSERT examples of Node API
> with code samples showing traversal


