import { seq, type Seq } from "doddle"
import { InstrumentsError } from "../error"
import type { Origin } from "../origin"
import type { LiveRefable } from "../reference"
import { Reference } from "../reference"
import { ReferenceKey } from "../reference/key"

type _K8tsExportsRecord<Exports extends LiveRefable = LiveRefable> = {
    [Export in Exports as Export["key"]["string"]]: Export
}

interface Exports_Ref<R extends _K8tsExportsRecord> {
    ref<Spec extends keyof R>(spec: Spec): R[Spec]
}

export interface Exports<Manifests extends LiveRefable>
    extends Exports_Ref<_K8tsExportsRecord<Manifests>> {
    [Symbol.iterator](): Iterator<Manifests>
    readonly origin: Origin
}

export namespace Exports {
    export function make<Manifests extends LiveRefable>(
        origin: Origin,
        iterable: Iterable<Manifests>
    ): Exports<Manifests> {
        return new Exports_Impl(origin, iterable) as any
    }
}

class Exports_Impl {
    private _exports: Seq<LiveRefable>
    constructor(
        readonly origin: Origin,
        _iterable: Iterable<LiveRefable>
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
