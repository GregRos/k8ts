import type { AnyCtor } from "what-are-you"
import type { Kind } from "../api-kind"

export type Kinded<K extends Kind.IdentParent = Kind.IdentParent> = { kind: K }
export type CtorOfKinded<_Thing extends Kinded> = AnyCtor<_Thing> & {
    prototype: {
        kind: Kind.IdentParent
    }
}
export type Refable<
    Kind extends Kind.IdentParent = Kind.IdentParent,
    Name extends string = string
> = Kinded<Kind> & {
    name: Name
}
export type LiveRefable<Object extends Kinded = Kinded, Name extends string = string> = Object &
    Refable<Object["kind"], Name>
