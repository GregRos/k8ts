import type { AnyCtor } from "what-are-you"
import type { RefLike } from "../../entity"
import type { Ident_Like } from "../api-kind"
import type { ResourceNode } from "../node"
export type ResourceConstructor<K extends Ident_Like = Ident_Like> = AnyCtor<ResourceRef<K>> & {
    prototype: ResourceRef<K>
}
export type ResourceRef<
    _Kind extends Ident_Like = Ident_Like,
    Name extends string = string
> = RefLike & {
    ident: _Kind
    name: Name
    namespace?: string
    is<_Ident extends Ident_Like>(ident: _Ident): this is ResourceRef<_Ident>
    equals(other: any): boolean
    node: ResourceNode
}

export type KeysResourceRef<X extends ResourceRef, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
