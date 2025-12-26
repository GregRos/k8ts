import type { AnyCtor } from "what-are-you"
import type { RefLike } from "../../entity"
import type { Kind } from "../api-kind"
import type { Rsc_Node } from "../node"
export type Rsc_Ctor_Of<K extends Kind.Ident_Like = Kind.Ident_Like> = AnyCtor<Rsc_Ref<K>> & {
    prototype: Rsc_Ref<K>
}
export type Rsc_Ref<
    Kind extends Kind.Ident_Like = Kind.Ident_Like,
    Name extends string = string
> = RefLike & {
    kind: Kind
    name: Name
    namespace?: string
    is<Kind extends Kind.Ident_Like>(kind: Kind): this is Rsc_Ref<Kind>
    equals(other: any): boolean
    node: Rsc_Node
}

export type Rsc_Ref_Keys_Of<X extends Rsc_Ref, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
