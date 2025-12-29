import type { AnyCtor } from "what-are-you"
import type { RefLike } from "../../entity"
import type { Ident_Like } from "../api-kind"
import type { Rsc_Node } from "../node"
export type Rsc_Ctor_Of<K extends Ident_Like = Ident_Like> = AnyCtor<Rsc_Ref<K>> & {
    prototype: Rsc_Ref<K>
}
export type Rsc_Ref<
    _Kind extends Ident_Like = Ident_Like,
    Name extends string = string
> = RefLike & {
    kind: _Kind
    name: Name
    namespace?: string
    is<_Kind2 extends Ident_Like>(kind: _Kind2): this is Rsc_Ref<_Kind2>
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
