---
aliases:
  - Origins
---
Every [[Rsc]] object is attached to an [[Origin]].

The simplest [[Origin]] is the file. That just means that k8s manifests belong in YAML files, nothing new there.

K8s takes this a step further, though. [[Origin|Origins]] let you do some pretty cool things with [[Rsc]] objects.

## Attaching
[[Rsc]] objects, like Service or Deployment, can only be created within the lexical scope of an [[Origin]], specifically a File.

They’re usually created with a constructor call, such as `new Deployment`, but you don’t pass the origin yourself.

Instead, k8ts does some runtime magic to figure it out for you. This attaching happens before the constructor has finished executing, and before you get control back.




When a top-level [[Rsc]] object is created, like a Service or a Deployment, it’s a

Every [[Rsc]] object must have an [[Origin]]. The clearest [[Origin]] is the File, which is where the k8s manifests are ultimately written to, but there are other [[Origin|Origins]]. 

##

Origins serve several functions:

1. They can be reflected in the resulting manifests, such as in the file structure.
2. Origins can defer the evaluation of resources, allowing for more flexible reference structures.
3. Rsc objects inherit metadata from Origins. This lets you apply metadata to lots of related resources. 
4. [[Hooks]] allow you to customize all Rsc objects attached to an Origin at different stages of the pipeline.

Right now, the file Origin is the only one that’s directly reflected in the manifests.
For example, a folder can also be an [[Origin]], though it can’t directly contain [[Rsc]] objects. 

[[Origin|Origins]] are a way to organize k8s manifests


When you create a top-most [[Rsc]] object using its constructor,