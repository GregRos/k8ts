import type { Base } from "./base"

export type K8tsResource = Base & {
    readonly kind: string
}
