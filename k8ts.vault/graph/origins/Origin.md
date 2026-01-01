---
aliases:
  - Origins
---
> [!ai] INSERT readable paragraphs taken from [[Origins and Rsc]] about *originate* etc



Every [[Resource]] object is attached to an [[Origin]]. 

Origins let you organize [[Resource]] objects. Some do this on a purely logical level, being erased after manifestation. Others affect how a resource is manifested.

Origins have children and form a tree (with [[need|needs]] they form a graph). They can also [[need]] other [[Origin|Origins]]. All [[Origin|Origins]] in a project form a graph that’s separate from, but linked to, the resource graph.

Here are examples of [[Origin|Origins]]:

1. The [[World]] is the root [[Origin]] of a k8ts project. This [[Origin]] knows where manifests should be written to. A [[World]] can’t contain [[Resource|Resources]]. 

2. The [[File]] is a child of the [[World]] [[Origin]]. It’s represents the YAML file that will contain resource manifests. [[File|Files]] contain [[Resource|Resources]]. 

3. The [[Section]] is a section of a [[File]]. It’s used for logically organizing [[Resource|Resources]] and isn’t represented in the manifests.

> [!ai] INSERT mermaid diagram
> Showing the relationship between the origins. Include a few attached resources to show where they can be attached.

> [!todo] Folder origin
> We should add a Folder origin that makes the [[assembler]] put files in a folder.
> 
> One idea is to have the origin set a [[Metadata#comment]] of where the file should go. The file [[Origin]] should set the final comment.
## Constructing Origins
You can construct an [[Origin]] using a [[Scoped Factory]] that belongs to the parent [[Origin]]. Unlike with [[Resource|Resources]], k8ts expects [[Origin]] objects to know their parent when constructed.

> [!ai]
> Example code for constructing different origins: World, File, and Section.

[[Origin|Origins]] that can contain resources always accept [[exports]] and produce a [[forward exports]] object when constructed.
## Attachment
[[Resource]] objects, like Service or Deployment, must be attached to an [[Origin]]. In the API, this is usually expressed as calling the [[Resource]] constructor inside a origin’s lexical scope.

> [!ai] INSERT code sample
> Insert example of code constructing a resource, with comments specifying that an Origin is getting attached.

You never pass the [[Origin]] to a [[Resource]] constructor.

Instead, k8ts uses runtime magic based on the lexical scope to figure out where the [[Resource]] should go. This happens before the [[Resource]] constructor has finished executing, and before you get control back.

K8ts will throw an error if it can’t find an [[Origin]] for a [[Resource]]. This will happen if you randomly construct a resource outside of a designated scope.

> [!ai] INSERT | code sample | Constructs resource in wrong place
> Code that constructs a resource at a module root, outside of any scope, with an comment saying the code errors.
## Functionality
Besides organizing [[Resource|Resources]] and affecting manifestation, [[Origin|Origins]] have a few other features.
### Deferring evaluation
Origins defer the evaluation of [[Resource|Resources]], allowing for more flexible reference structures. This is used as part of the [[forward reference]] mechanism.
### Metadata
[[Origin|Origins]] contain [[Metadata]], but don’t use it themselves. Instead, they apply all their own and inherited [[Metadata]] to any [[Resource]] that’s attached to them. 

This lets you use them as a convenient way to apply metadata to lots of resources.

> [!ai]
> Code example of attaching metadata to a World and a File. In the File, construct a resource and show it has the inherited metadata from both.
### Events
[[Origin|Origins]] support [[origin events]] that let you modify [[Resource|Resources]] and manifests at different stages of the manifestation pipeline.

> [!ai]
> Code showing listening to [[World]], [[File]], and [[Section]] events.