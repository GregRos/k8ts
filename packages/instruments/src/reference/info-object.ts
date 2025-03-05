import type { Doddle } from "doddle"
import type { InputReference } from "./types"

export class ReferenceInfo<T extends object> {
    readonly kind: string
    readonly name: string
    readonly namespace?: string
    readonly __origin: object
    readonly __resolver: Doddle<T>
    readonly __class: Function
    constructor(input: InputReference<T>) {
        this.kind = input.kind
        this.name = input.name
        this.namespace = input.namespace
        this.__origin = input.origin
        this.__resolver = input.resolver
        this.__class = input.class
    }

    pull(): T {
        return this.__resolver.pull() as T
    }

    get __description() {
        return `${this.name} (${this.kind})`
    }

    get isResolved() {
        return this.__resolver.info.isReady
    }
}
