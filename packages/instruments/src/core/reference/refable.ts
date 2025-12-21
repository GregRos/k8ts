import type { AnyCtor } from "what-are-you"
import type { Kind } from "../api-kind"
import type { BaseNode } from "../entities"

export type Kinded<K extends Kind.IdentParent = Kind.IdentParent> = { kind: K }
export type KindedCtor<K extends Kind.IdentParent = Kind.IdentParent> = AnyCtor<Refable<K>> & {
    prototype: Refable<K>
}
export type Refable<
    Kind extends Kind.IdentParent = Kind.IdentParent,
    Name extends string = string
> = Kinded<Kind> & {
    name: Name
    equals(other: any): boolean
    node: BaseNode
}
export type LiveRefable = Refable
