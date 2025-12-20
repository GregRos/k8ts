import type { Doddle } from "doddle"
import type { AnyCtor } from "what-are-you"
import { ProxyOperationError } from "../../error"
import { ManifestResource } from "../entities"
import { RefKey } from "../ref-key/ref-key"

export type FwReference<T extends object> = FwReference_Proxied<T> & T
export function FwReference<Referenced extends object>(
    props: FwReference_Props<Referenced>
): FwReference<Referenced> {
    const core = new FwReference_Proxied(props)
    return new Proxy(core, new FwRef_Handler(core)) as FwReference<Referenced>
}
export namespace FwReference {
    export function is(obj: any): obj is FwReference<object> {
        return FwReference_Proxied.is(obj)
    }
}
export interface FwReference_Props<Referenced extends object> {
    readonly class?: AnyCtor<Referenced>
    readonly key: RefKey
    readonly namespace?: string
    readonly origin: object
    readonly resolver: Doddle<Referenced>
}

class FwReference_Proxied<To extends object> {
    constructor(private readonly _props: FwReference_Props<To>) {}

    static is(obj: any): obj is FwReference<object> {
        return obj && typeof obj === "object" && "__reference_props__" in obj
    }
    equals(other: any): boolean {
        const resolved = this._props.resolver.pull() as any
        if (FwReference_Proxied.is(other)) {
            return other.equals(resolved)
        }
        if ("equals" in resolved) {
            return resolved.equals(other)
        }
        return false
    }
    protected __reference_props__() {
        return this._props
    }
}

class FwRef_Handler<T extends object> implements ProxyHandler<T> {
    get _props() {
        return this._core["__reference_props__"]()
    }
    constructor(private readonly _core: FwReference_Proxied<T>) {}

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
        return this._props.class?.prototype ?? ManifestResource.prototype
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
        return this._core["__reference_props__"]().key.string
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
