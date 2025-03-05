import type { Refable } from "../reference/refable"
import type { TypedScope } from "../scope"

type _K8tsExportsRecord<Exports extends Refable = Refable> = {
    [Export in Exports as Export["key"]["string"]]: Export
}

interface Exports_Ref<R extends _K8tsExportsRecord> {
    ref<Spec extends keyof R>(spec: Spec): R[Spec]
}

export interface Exports<Manifests extends Refable>
    extends Exports_Ref<_K8tsExportsRecord<Manifests>> {
    [Symbol.iterator](): Iterator<Manifests>
    readonly origin: TypedScope<Manifests>
}
