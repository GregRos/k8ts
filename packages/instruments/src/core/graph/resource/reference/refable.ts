import type { AnyCtor } from "what-are-you"
import type { Kind } from "../api-kind"
import type { Resource_Entity } from "../entity"
import type { Resource_Node } from "../node"

export type Resource_Ctor_Of<K extends Kind.KindLike = Kind.KindLike> = AnyCtor<Ref2_Of<K>> & {
    prototype: Ref2_Of<K>
}
export type Ref2_Of<Kind extends Kind.KindLike = Kind.KindLike, Name extends string = string> = {
    kind: Kind
    name: Name
    equals(other: any): boolean
    node: Resource_Node
}
export type Resource_Ref_Full<
    _Kind extends Kind.KindLike = Kind.KindLike,
    _Name extends string = string
> = Ref2_Of<_Kind, _Name> & Resource_Entity<_Name>

export type Resource_Ref_Keys_Of<X extends Ref2_Of, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
