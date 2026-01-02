import type { AnyCtor } from "what-are-you"
import type { RefLike } from "../../entity"
import type { IdentLike } from "../api-kind"
import type { ResourceNode } from "../node"
export type ResourceConstructor<K extends IdentLike = IdentLike> = AnyCtor<ResourceRef<K>> & {
    prototype: ResourceRef<K>
}
export type ResourceRef<
    _Kind extends IdentLike = IdentLike,
    Name extends string = string
> = RefLike & {
    ident: _Kind
    name: Name
    namespace?: string
    is<_Ident extends IdentLike>(ident: _Ident): this is ResourceRef<_Ident>
    equals(other: any): boolean
    node: ResourceNode
}

export type ResourceRef_HasKeys<X extends ResourceRef, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
