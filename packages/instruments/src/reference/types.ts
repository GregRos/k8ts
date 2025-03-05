import type { Doddle } from "doddle"
import type { ReferenceInfo } from "./info-object"

export interface InputReference<Referenced extends object> {
    readonly kind: string
    readonly name: string
    readonly namespace?: string
    readonly origin: object
    readonly resolver: Doddle<Referenced>
    readonly class: Function
}

export type Referenced<T extends object> = T & ReferenceInfo<T>
