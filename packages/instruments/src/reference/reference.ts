import type { Doddle } from "doddle"
import { InstrumentsError } from "../error"
import { ReferenceKey } from "./key"

export type Reference<T extends object> = Reference.Reference<T>
export namespace Reference {
    export interface Props<Referenced extends object> {
        readonly key: ReferenceKey
        readonly namespace?: string
        readonly origin: object
        readonly resolver: Doddle<Referenced>
        readonly class: Function
    }

    export function create<T extends object>(input: Props<T>): Reference<T> {
        const ref = new ReferenceDef(input)
        return new Proxy(ref, new Handler(ref))
    }
    export class ReferenceDef<T extends object> {
        readonly __key: ReferenceKey
        readonly namespace?: string
        readonly __origin: object
        readonly __resolver: Doddle<T>
        readonly __class: Function
        constructor(input: Props<T>) {
            this.__key = input.key
            this.namespace = input.namespace
            this.__origin = input.origin
            this.__resolver = input.resolver
            this.__class = input.class
        }

        pull(): T {
            return this.__resolver.pull() as T
        }

        get __referant() {
            return this.__key.toString()
        }

        get isResolved() {
            return this.__resolver.info.isReady
        }
    }

    export type Reference<T extends object> = ReferenceDef<T> & T

    class Handler<T extends object> implements ProxyHandler<T> {
        constructor(private readonly reference: ReferenceDef<T>) {}
        _isValidReferenceKey(prop: PropertyKey): boolean {
            return ReferenceKey.tryParse(prop as any) !== undefined
        }
        get(target: T, prop: PropertyKey) {
            const { reference } = this
            if (Reflect.has(reference, prop)) {
                return Reflect.get(reference, prop)
            }
            const resource = reference.__resolver.pull() as any
            const result = Reflect.get(resource, prop)
            if (typeof result === "function") {
                return result.bind(resource)
            }
            return result
        }
        getPrototypeOf(target: T) {
            const { reference } = this
            return reference.__class.prototype
        }
        has(target: T, prop: PropertyKey) {
            const { reference } = this
            if (Reflect.has(reference, prop)) {
                return true
            }
            const resource = reference.__resolver.pull() as any
            return Reflect.has(resource, prop)
        }
        getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
            const { reference } = this
            const desc = Object.getOwnPropertyDescriptor(reference, p)
            if (desc) {
                desc.configurable = false
                return desc
            }
            const resource = reference.__resolver.pull() as any
            const resourceDesc = Object.getOwnPropertyDescriptor(resource, p)
            return resourceDesc
        }
        #createImmutableError(action: string) {
            return new InstrumentsError(
                `Tried to ${action} a forward reference to ${this.reference.__referant}, but it cannot be modified.`
            )
        }

        defineProperty(_: any, property: string | symbol, desc: PropertyDescriptor): boolean {
            throw this.#createImmutableError(`define property ${String(property)} on`)
        }
        deleteProperty(target: T, p: string | symbol): boolean {
            throw this.#createImmutableError(`delete property ${String(p)} from`)
        }
        preventExtensions(target: T): boolean {
            return true
        }
        isExtensible(target: T): boolean {
            return false
        }
        set(target: T, p: string | symbol, newValue: any, receiver: any): boolean {
            throw this.#createImmutableError(`set property ${String(p)} on`)
        }
        ownKeys(target: T): ArrayLike<string | symbol> {
            const pulled = this.reference.__resolver.pull() as any
            return [...Reflect.ownKeys(target), ...Reflect.ownKeys(pulled)]
        }
        setPrototypeOf(target: T, v: object | null): boolean {
            throw this.#createImmutableError(`set the prototype of`)
        }
    }
}
