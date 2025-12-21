import type { AnyCtor } from "what-are-you"
import type { Kind } from "../api-kind"
import type { Resource_Entity, Resource_Node } from "../graph"

export type Resource_Min_Ref<K extends Kind.IdentParent = Kind.IdentParent> = { kind: K }
export type Resource_Ctor_Of<K extends Kind.IdentParent = Kind.IdentParent> = AnyCtor<
    Resource_Core_Ref<K>
> & {
    prototype: Resource_Core_Ref<K>
}
export type Resource_Core_Ref<
    Kind extends Kind.IdentParent = Kind.IdentParent,
    Name extends string = string
> = Resource_Min_Ref<Kind> & {
    name: Name
    equals(other: any): boolean
    node: Resource_Node
}

export type Resource_Full_Ref<
    _Kind extends Kind.IdentParent = Kind.IdentParent,
    _Name extends string = string
> = Resource_Core_Ref<_Kind, _Name> & Resource_Entity<_Name>
