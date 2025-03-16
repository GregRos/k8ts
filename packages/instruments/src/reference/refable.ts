import type { Kind } from "../api-kind"
import type { RefKey } from "../ref-key"

export type Kinded = { kind: Kind.Kind }
export type Refable<Kind extends string, Name extends string> = {
    node: {
        key: RefKey<Kind, Name>
    }
}
export type LiveRefable<Object extends Kinded = Kinded, Name extends string = string> = Object &
    Refable<Object["kind"]["name"], Name>
