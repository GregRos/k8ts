import type { Kind } from "../api-kind"
import type { External } from "./base"
import type { External_Props } from "./props"

export type External_WithFeatures<
    Kind extends Kind.KindLike,
    F extends External_Props<Kind>
> = External<Kind> & {
    kind: Kind
} & (F extends {
        readonly keys: infer Ks extends string[]
    }
        ? {
              readonly keys: Ks
          }
        : {})
