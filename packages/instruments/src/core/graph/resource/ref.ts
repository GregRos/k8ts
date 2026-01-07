import type { RefLike } from "../entity"
import type { IdentLike } from "./api-kind"
import type { ResourceVertex } from "./node"

export type ResourceRef_Constructor_For<R extends ResourceRef> = {
    prototype: R
} & (abstract new (...args: any[]) => R)
export type ResourceRef_Constructor<K extends IdentLike = IdentLike> = ResourceRef_Constructor_For<
    ResourceRef<K>
>
export type ResourceRef<
    _Kind extends IdentLike = IdentLike,
    Name extends string = string
> = RefLike & {
    ident: _Kind
    name: Name
    namespace?: string
    is<_Ident extends IdentLike>(ident: _Ident): this is ResourceRef<_Ident>
    equals(other: any): boolean
    vertex: ResourceVertex
}

export type ResourceRef_HasKeys<X extends ResourceRef, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
