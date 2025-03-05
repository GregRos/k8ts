import { seq, type Seq } from "doddle"
import { InstrumentsError } from "../error"
import { Reference } from "../reference"
import { ReferenceKey } from "../reference/key"
import type { Refable } from "../reference/refable"

import type { Origin } from "../origin"
import { Exports as Exp } from "./types"

export type Exports<T extends Refable> = Exp<T>
export namespace Exports {
    export function make<Manifests extends Refable>(
        origin: Origin,
        iterable: Iterable<Manifests>
    ): Exp<Manifests> {
        return new Exports_Impl(origin, iterable) as any
    }
}

class Exports_Impl {
    private _exports: Seq<Refable>
    constructor(
        readonly origin: Origin,
        _iterable: Iterable<Refable>
    ) {
        this._exports = seq(_iterable).cache()
    }

    [Symbol.iterator]() {
        return this._exports[Symbol.iterator]()
    }

    ref(spec: ReferenceKey["string"]) {
        const parsed = ReferenceKey.parse(spec)
        return Reference.create({
            key: parsed,
            class: this.origin.registered.get(parsed.kind),
            origin: this.origin,
            resolver: this._exports
                .find(e => e.key.equals(spec))
                .map(x => {
                    if (!x) {
                        throw new InstrumentsError(`Could not find resource ${spec}`)
                    }
                    return x
                })
        })
    }
}
