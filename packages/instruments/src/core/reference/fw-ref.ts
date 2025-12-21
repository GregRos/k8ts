import type { Doddle } from "doddle"
import type { AnyCtor } from "what-are-you"
import { ProxyOperationError } from "../../error"
import { ManifestResource } from "../entities"
import { RefKey } from "../ref-key/ref-key"
import type { Refable } from "./refable"

export type FwReference<T extends Refable = Refable> = FwReference_Proxied<T> & T
export function FwReference<Referenced extends Refable>(
    props: FwReference_Props<Referenced>
): FwReference<Referenced> {
    const core = new FwReference_Proxied(props)
    return new Proxy(core, new FwRef_Handler(core)) as FwReference<Referenced>
}
export namespace FwReference {
    export function is(obj: any): obj is FwReference {
        return FwReference_Proxied.is(obj)
    }
}
export interface FwReference_Props<Referenced extends Refable> {
    readonly class?: AnyCtor<Referenced>
    readonly key: RefKey
    readonly namespace?: string
    readonly origin: object
    readonly resolver: Doddle<Referenced>
}

class FwReference_Proxied<To extends Refable> {
    readonly #props: FwReference_Props<To>
    constructor(props: FwReference_Props<To>) {
        this.#props = props
    }

    static is(obj: any): obj is FwReference {
        return obj && typeof obj === "object" && "__reference_props__" in obj
    }

    protected __pull__() {
        return this.#props.resolver.pull()
    }

    protected __reference_props__() {
        return this.#props
    }
}

class FwRef_Handler<T extends Refable> implements ProxyHandler<T> {
    get _props() {
        return this._subject["__reference_props__"]()
    }
    constructor(private readonly _subject: FwReference_Proxied<T>) {}

    get(target: T, prop: PropertyKey) {
        const { _props, _subject } = this
        if (prop === "constructor") {
            return this._props.class
        }
        if (Reflect.has(_subject, prop)) {
            return Reflect.get(_subject, prop)
        }
        const resource = _subject["__pull__"]() as any
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
        const { _props, _subject } = this
        if (Reflect.has(_subject, prop)) {
            return true
        }
        const resource = _props.resolver.pull() as any
        return Reflect.has(resource, prop)
    }
    getOwnPropertyDescriptor(_: T, p: string | symbol): PropertyDescriptor | undefined {
        const { _subject, _props } = this
        const desc = Object.getOwnPropertyDescriptor(_subject, p)
        if (desc) {
            desc.configurable = false
            return desc
        }
        const resource = _props.resolver.pull() as any
        const resourceDesc = Object.getOwnPropertyDescriptor(resource, p)
        return resourceDesc
    }
    get referant() {
        return this._subject["__reference_props__"]().key.string
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
        return [...Reflect.ownKeys(this._subject), ...Reflect.ownKeys(pulled)]
    }
    setPrototypeOf(): boolean {
        throw this.#createImmutableError(`set the prototype of`)
    }
}
