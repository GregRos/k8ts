import type { AnyCtor } from "what-are-you"
import type { Kind } from "../api-kind"
import type { Resource_Entity } from "../entity"
import type { Resource_Node } from "../node"

export type Resource_Ref_Min<K extends Kind.IdentParent = Kind.IdentParent> = { kind: K }
export type Resource_Ctor_Of<K extends Kind.IdentParent = Kind.IdentParent> = AnyCtor<
    Ref2_Of<K>
> & {
    prototype: Ref2_Of<K>
}
export type Ref2_Of<
    Kind extends Kind.IdentParent = Kind.IdentParent,
    Name extends string = string
> = Resource_Ref_Min<Kind> & {
    name: Name
    equals(other: any): boolean
    node: Resource_Node
}
export type Resource_Ref_Full<
    _Kind extends Kind.IdentParent = Kind.IdentParent,
    _Name extends string = string
> = Ref2_Of<_Kind, _Name> & Resource_Entity<_Name>

export type Resource_Ref_Keys_Of<X extends Resource_Ref_Min, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
