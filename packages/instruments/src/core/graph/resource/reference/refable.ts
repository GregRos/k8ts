import type { AnyCtor } from "what-are-you"
import type { RefLike } from "../../entity"
import type { Kind } from "../api-kind"
import type { Resource_Node } from "../node"
export type Resource_Ctor_Of<K extends Kind.KindLike = Kind.KindLike> = AnyCtor<Ref2_Of<K>> & {
    prototype: Ref2_Of<K>
}
export type Ref2_Of<
    Kind extends Kind.KindLike = Kind.KindLike,
    Name extends string = string
> = RefLike & {
    kind: Kind
    name: Name
    namespace?: string
    is<Kind extends Kind.KindLike>(kind: Kind): this is Ref2_Of<Kind>
    equals(other: any): boolean
    node: Resource_Node
}

export type Resource_Ref_Keys_Of<X extends Ref2_Of, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
