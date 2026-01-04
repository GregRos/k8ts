---
aliases:
  - Worlds
---
> [!ai] INSERT mermaid diagram - Origin hierarchy with World highlighted

The [[World]] is the root [[Origin]] of a k8ts project. It keeps track of the manifest root and is used to organize child [[Origin|Origins]], such as [[File|Files]]. 

The [[World]] also keeps track of known top-level [[Resource]] [[Ident|Idents]] and their respective classes. This information is used to support the [[ForwardRef]] mechanism.

[[World|Worlds]] can’t contain [[Resource|Resources]] directly.


> [!ai] INSERT code sample: Create World
> Show World being created.
> Example of metadata
> Show a file can be created but leave it empty


> [!ai] INSERT Explain file structure
> Explain the file structure where the World is created in a separate file and is imported by other files for different purposes


> [!ai] INSERT show how World changes the dest dir for k8s resources

