import { seq, type Seq } from "doddle"
import { MakeError } from "../error"
import { Base } from "../node/base"
import { K8tsResources } from "../resources/kind-map"
import type { ParentScope } from "./parent-scope"
import { KEY, type RefSpec } from "./referencing"
export type _K8tsExportsRecord<Exports extends Base = Base> = {
    [Export in Exports as Export[KEY]]: Export
}

interface Exports_Ref<R extends _K8tsExportsRecord> {
    ref<Spec extends keyof R>(spec: Spec): R[Spec]
}

export interface Exports<Manifests extends Base>
    extends Exports_Ref<_K8tsExportsRecord<Manifests>> {
    [Symbol.iterator](): Iterator<Manifests>
    readonly origin: ParentScope
}

export namespace Exports {
    export function make<Manifests extends Base>(
        origin: ParentScope,
        iterable: Iterable<Manifests>
    ): Exports<Manifests> {
        return new Exports_Impl(origin, iterable) as any
    }
}

class Exports_Impl {
    private _exports: Seq<Base>
    constructor(
        readonly origin: ParentScope,
        _iterable: Iterable<Base>
    ) {
        this._exports = seq(_iterable).cache()
    }

    [Symbol.iterator]() {
        return this._exports[Symbol.iterator]()
    }

    ref(spec: RefSpec) {
        const parsed = RefSpecifier.parse(spec)
        return createReference({
            kind: parsed.kind,
            name: parsed.name,
            origin: this.origin,
            class: K8tsResources.get(parsed.kind),
            resolver: this._exports
                .find(e => e.isMatch(spec))
                .map(x => {
                    if (!x) {
                        throw new MakeError(`Could not find resource ${spec}`)
                    }
                    return x
                })
        })
    }
}
