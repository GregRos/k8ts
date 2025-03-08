import type { Doddle } from "doddle"
import { ProxyOperationError } from "../error"
import { ReferenceKey } from "./key"

export type Reference<T extends object> = Reference.Core<T> & T
export namespace Reference {
    export function make<T extends object>(props: Props<T>): Reference<T> {
        const core = new Core(props)
        return new Proxy(core, new Handler(core)) as Reference<T>
    }
    export interface Props<Referenced extends object> {
        readonly key: ReferenceKey
        readonly namespace?: string
        readonly origin: object
        readonly resolver: Doddle<Referenced>
        readonly class: Function
    }

    export class Core<T extends object> {
        #props: Props<T>
        constructor(props: Props<T>) {
            this.#props = props
        }

        get __reference_props__() {
            return this.#props
        }
    }

    class Handler<T extends object> implements ProxyHandler<T> {
        get _props() {
            return this._core.__reference_props__
        }
        constructor(private readonly _core: Core<T>) {}

        get(target: T, prop: PropertyKey) {
            const { _props, _core } = this
            if (Reflect.has(_core, prop)) {
                return Reflect.get(_core, prop)
            }
            const resource = _props.resolver.pull() as any
            const result = Reflect.get(resource, prop)
            if (typeof result === "function") {
                return result.bind(resource)
            }
            return result
        }
        getPrototypeOf(target: T) {
            const { _props } = this
            return _props.class.prototype
        }
        has(target: T, prop: PropertyKey) {
            const { _props, _core } = this
            if (Reflect.has(_core, prop)) {
                return true
            }
            const resource = _props.resolver.pull() as any
            return Reflect.has(resource, prop)
        }
        getOwnPropertyDescriptor(_: T, p: string | symbol): PropertyDescriptor | undefined {
            const { _core, _props } = this
            const desc = Object.getOwnPropertyDescriptor(_core, p)
            if (desc) {
                desc.configurable = false
                return desc
            }
            const resource = _props.resolver.pull() as any
            const resourceDesc = Object.getOwnPropertyDescriptor(resource, p)
            return resourceDesc
        }
        get referant() {
            return this._core.__reference_props__.key.string
        }
        #createImmutableError(action: string) {
            return new ProxyOperationError(
                `Tried to ${action} a forward reference to ${this.referant}, but it cannot be modified.`
            )
        }

        defineProperty(_: any, property: string | symbol, desc: PropertyDescriptor): boolean {
            throw this.#createImmutableError(`define property ${String(property)} on`)
        }
        deleteProperty(_: T, p: string | symbol): boolean {
            throw this.#createImmutableError(`delete property ${String(p)} from`)
        }
        preventExtensions(): boolean {
            return true
        }
        isExtensible(): boolean {
            return false
        }
        set(_: T, p: string | symbol): boolean {
            throw this.#createImmutableError(`set property ${String(p)} on`)
        }
        ownKeys(): ArrayLike<string | symbol> {
            const pulled = this._props.resolver.pull() as any
            return [...Reflect.ownKeys(this._core), ...Reflect.ownKeys(pulled)]
        }
        setPrototypeOf(): boolean {
            throw this.#createImmutableError(`set the prototype of`)
        }
    }
}
