import type { Base, KEY, Refable } from "./base"
import type { Pullable } from "./delayed"

export type Export = Base & Refable
export type _K8tsExportsRecord<Exports extends Export = Export> = {
    [Export in Exports as Export[KEY]]: Export
}

export interface K8tsExports<R extends _K8tsExportsRecord> {
    ref<Spec extends keyof R>(spec: Spec): Pullable<R[Spec]>
}
