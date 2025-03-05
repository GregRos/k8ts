import { Exports } from "../exports/impl"
import type { Refable } from "../reference/refable"
import { UntypedBaseScope } from "./base-scope"

export abstract class TypedScope<Scoped extends Refable = Refable> extends UntypedBaseScope {
    scope<T extends Scoped>(generator: (scope: this) => Iterable<T>) {
        return Exports.make(this, generator(this))
    }
}
