import { seq, type Seq } from "doddle"
import { InstrumentsError } from "../error"
import { Reference } from "../reference"
import { ReferenceKey } from "../reference/key"
import type { Refable } from "../reference/refable"

import type { Origin } from "../origin"
type _K8tsExportsRecord<Exports extends Refable = Refable> = {
    [Export in Exports as Export["key"]["string"]]: Export
}

interface Exports_Ref<R extends _K8tsExportsRecord> {
    ref<Spec extends keyof R>(spec: Spec): R[Spec]
}

export interface Exports<Manifests extends Refable>
    extends Exports_Ref<_K8tsExportsRecord<Manifests>>,
        Origin {
    [Symbol.iterator](): Iterator<Manifests>
}

export namespace Exports {
    export function make<Manifests extends Refable>(
        origin: Origin,
        iterable: Iterable<Manifests>
    ): Exports<Manifests> {
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
