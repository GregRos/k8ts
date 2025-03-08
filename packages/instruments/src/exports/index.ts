import { seq } from "doddle"
import { ProxyOperationError } from "../error"
import type { Origin } from "../origin"
import type { LiveRefable } from "../reference"
import { Reference, ReferenceKey } from "../reference"

export type DynamicExports<Exps extends LiveRefable> = DynamicExports.DynamicExports<Exps>
export namespace DynamicExports {
    export type DynamicExports<Exps extends LiveRefable> = _ExportsByKey<Exps> & Iterable<Exps>
    export type _ExportsByKey<Exports extends LiveRefable = LiveRefable> = {
        [E in Exports as `${E["api"]["kind"]}/${E["key"]["name"]}`]: Reference<E>
    }
    export interface Props<
        Actual extends object = object,
        Exports extends LiveRefable = LiveRefable
    > {
        readonly origin: Origin
        readonly actual: Actual
        readonly exports: Iterable<Exports>
    }

    export function make<T extends LiveRefable, Actual extends Origin>(
        props: Props<Actual, T>
    ): T & DynamicExports<LiveRefable> {
        const handler = new Handler(props)
        return new Proxy(props.actual, handler) as any
    }
    export class Handler implements ProxyHandler<object> {
        constructor(private readonly _props: Props) {}

        #createImmutableError(action: string) {
            return new ProxyOperationError(
                `Tried to ${action} an the exports constructs of ${this._props.origin}, but it is immutable.`
            )
        }

        defineProperty(_: object, property: string | symbol, __: PropertyDescriptor): boolean {
            throw this.#createImmutableError(`define property ${String(property)} on`)
        }

        deleteProperty(_: object, property: string | symbol): boolean {
            throw this.#createImmutableError(`delete property ${String(property)} from`)
        }

        getPrototypeOf(_: Iterable<LiveRefable>): object | null {
            return Reflect.getPrototypeOf(this._target)
        }

        get seq() {
            return seq(this._props.exports)
        }

        #isValidReferant(prop: PropertyKey) {
            return ReferenceKey.tryParse(prop as any)
        }

        get _target() {
            return this._props.actual
        }

        get(target: any, property: string | symbol): any {
            const key = property as string
            if (Reflect.has(this._target, key)) {
                return Reflect.get(target, property)
            }
            const refKey = ReferenceKey.tryParse(property)
            if (!refKey) {
                return undefined
            }
            const cls = this._props.origin.registered.get(refKey.kind)
            return Reference.make({
                class: cls,
                key: refKey,
                origin: this._props.origin,
                namespace: this._props.origin.meta.tryGet("namespace"),
                resolver: this.seq
                    .find(exp => exp.key.equals(refKey))
                    .map(x => {
                        if (x == null) {
                            throw new ProxyOperationError(
                                `Failed to resolve forward reference to ${refKey} in ${this._props.origin}.`
                            )
                        }
                        return x
                    })
            })
        }

        has(_: Iterable<LiveRefable>, p: string | symbol): boolean {
            if (Reflect.has(this._target, p)) {
                return true
            }
            if (!this.#isValidReferant(p)) {
                return false
            }
            return true
        }

        isExtensible(target: Iterable<LiveRefable>): boolean {
            return false
        }

        preventExtensions(target: Iterable<LiveRefable>): boolean {
            return true
        }

        ownKeys(target: Iterable<LiveRefable>): ArrayLike<string | symbol> {
            throw new ProxyOperationError("Cannot list all keys of a dynamic exports object.")
        }

        set(
            target: Iterable<LiveRefable>,
            p: string | symbol,
            newValue: any,
            receiver: any
        ): boolean {
            throw this.#createImmutableError(`set property ${String(p)} on`)
        }

        setPrototypeOf(target: Iterable<LiveRefable>, v: any): boolean {
            throw this.#createImmutableError(`set prototype of`)
        }

        _tryTargetDescriptor(p: PropertyKey) {
            return Object.getOwnPropertyDescriptor(this._target, p)
        }

        getOwnPropertyDescriptor(
            target: Iterable<LiveRefable>,
            p: string | symbol
        ): PropertyDescriptor | undefined {
            const desc = this._tryTargetDescriptor(p)
            if (desc) {
                return desc
            }
            const value = this.get(target, p)
            if (value == null) {
                return undefined
            }
            return {
                configurable: false,
                enumerable: true,
                value,
                writable: false
            }
        }
    }
}
