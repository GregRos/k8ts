import type { EntityRef } from "../entity"
import type { GVK_Like } from "./gvk"
import type { ResourceVertex } from "./vertex"

export type ResourceRef_Constructor_For<R extends ResourceRef = ResourceRef> = {
    prototype: R
} & (abstract new (...args: any[]) => R)
export type ResourceRef_Constructor<K extends GVK_Like = GVK_Like> = ResourceRef_Constructor_For<
    ResourceRef<K>
>
export type ResourceRef<
    _Kind extends GVK_Like = GVK_Like,
    Name extends string = string
> = EntityRef & {
    noEmit: boolean
    kind: _Kind
    ident: {
        name: Name
        namespace?: string
    }
    is<Type>(cls: abstract new (...args: any[]) => Type): this is Type
    is<_Kind extends GVK_Like>(kind: _Kind): this is ResourceRef<_Kind>
    equals(other: any): boolean
    __vertex__: ResourceVertex
}

export type ResourceRef_HasKeys<X extends ResourceRef, Else = never> = [X] extends [
    {
        keys: (infer K extends string)[]
    }
]
    ? K
    : Else
