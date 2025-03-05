import type { Doddle } from "doddle"
import type { ReferenceKey } from "./specifier"

export interface InputReference<Referenced extends object> {
    readonly key: ReferenceKey
    readonly namespace?: string
    readonly origin: object
    readonly resolver: Doddle<Referenced>
    readonly class: Function
}
