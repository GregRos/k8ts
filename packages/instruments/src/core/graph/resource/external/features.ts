import type { Kind } from "../api-kind"
import type { External_Base } from "./base"
import type { External_Props } from "./props"

export type External_WithFeatures<
    Kind extends Kind.IdentParent,
    F extends External_Props<Kind>
> = External_Base<Kind> & {
    kind: Kind
} & (F extends {
        readonly keys: infer Ks extends string[]
    }
        ? {
              readonly keys: Ks
          }
        : {})
