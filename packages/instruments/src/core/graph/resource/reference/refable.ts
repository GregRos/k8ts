import type { AnyCtor } from "what-are-you"
import type { RefLike } from "../../entity"
import type { Kind } from "../api-kind"
import type { Resource_Node } from "../node"
export type Resource_Ctor_Of<K extends Kind.KindLike = Kind.KindLike> = AnyCtor<Rsc_Ref<K>> & {
    prototype: Rsc_Ref<K>
}
export type Rsc_Ref<
    Kind extends Kind.KindLike = Kind.KindLike,
    Name extends string = string
> = RefLike & {
    kind: Kind
    name: Name
    namespace?: string
    is<Kind extends Kind.KindLike>(kind: Kind): this is Rsc_Ref<Kind>
    equals(other: any): boolean
    node: Resource_Node
}

export type Resource_Ref_Keys_Of<X extends Rsc_Ref, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
