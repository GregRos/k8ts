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
    kind: _Kind
    name: Name
    namespace?: string
    is<_Kind extends GVK_Like>(kind: _Kind): this is ResourceRef<_Kind>
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
