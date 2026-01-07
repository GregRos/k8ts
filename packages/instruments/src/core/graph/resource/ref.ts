import type { RefLike } from "../entity"
import type { GVK_Like } from "./api-kind"
import type { ResourceVertex } from "./node"

export type ResourceRef_Constructor_For<R extends ResourceRef> = {
    prototype: R
} & (abstract new (...args: any[]) => R)
export type ResourceRef_Constructor<K extends GVK_Like = GVK_Like> = ResourceRef_Constructor_For<
    ResourceRef<K>
>
export type ResourceRef<
    _Kind extends GVK_Like = GVK_Like,
    Name extends string = string
> = RefLike & {
    ident: _Kind
    name: Name
    namespace?: string
    is<_Ident extends GVK_Like>(ident: _Ident): this is ResourceRef<_Ident>
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
