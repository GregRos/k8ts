import { type Doddle, type Seq } from "doddle"
import { InstrumentsError } from "../error"
import type { Traced } from "../tracing"

export namespace LazyProxy {
    export interface Property {
        key: string
        value: any
        enumerable: boolean
    }
    export interface Impl {
        descriptors: Seq<Property>
        class?: Doddle<Function>
    }
    export interface Props<T extends Traced = Traced> {
        actual: T
        referant: string
        impl: Impl
    }

    export type DescriptorProperty = "writable" | "enumerable" | "configurable"
    export function make<T extends object>(props: Props<T>): T {
        return new LazyProxyHandler(props).makeProxy(props.actual)
    }
    export class LazyProxyHandler<T extends object> implements ProxyHandler<T> {
        constructor(private readonly _props: Props<T>) {
            this._props.referant = `${this._props.referant} (a dynamic Proxy object)`
        }
        makeProxy(target: T): T {
            return new Proxy(target, this)
        }

        private _proxyOperationError(operation: string) {
            return new ProxyOperationError(
                `Tried to ${operation} ${this._props.referant}, which is illegal.`
            )
        }

        private _illegalOperationThrower(operation: string) {
            return (...args: any[]) => {
                throw this._proxyOperationError(operation)
            }
        }
        apply = () => {
            throw this._proxyOperationError("invoke")
        }
        construct = () => {
            throw this._proxyOperationError("construct")
        }
        deleteProperty = (target: T, key: PropertyKey) => {
            throw this._proxyOperationError(`delete property ${String(key)}`)
        }
        defineProperty = (target: T, key: PropertyKey) => {
            throw this._proxyOperationError(`define property ${String(key)}`)
        }
        getPrototypeOf = (target: T): object | null => {
            return this._props.impl.class?.pull().prototype ?? this._props.actual
        }
        has = (target: T, p: string | symbol): boolean => {
            const actualHas = Reflect.has(this._props.actual, p)
            if (actualHas) {
                return true
            }
            return this._props.impl.descriptors.find(x => x.value === p) !== undefined
        }
        ownKeys = (target: T): ArrayLike<string | symbol> => {
            const actualKeys = Reflect.ownKeys(this._props.actual)
            const descriptorKeys = this._props.impl.descriptors.map(x => x.key)
            return [...actualKeys, ...descriptorKeys]
        }

        _emitDescriptor(value: any, ...keywords: DescriptorProperty[]): PropertyDescriptor {
            return {
                value,
                writable: keywords.includes("writable"),
                enumerable: keywords.includes("enumerable"),
                configurable: keywords.includes("configurable")
            }
        }

        _getDownstreamDescriptor = (p: string | symbol): PropertyDescriptor | undefined => {
            if ("__proto__" === p && "__proto__" in this._props.actual) {
                return this._props.impl.class?.pull().prototype ?? this._props.actual.__proto__
            }
            const actualDescriptor = Reflect.getOwnPropertyDescriptor(this._props.actual, p)
            if (actualDescriptor) {
                return actualDescriptor
            }
            const pulled = this._props.impl.descriptors.find(x => x.key === p).pull()
            if (pulled) {
                return pulled
            }
            return undefined
        }

        getOwnPropertyDescriptor = (
            target: T,
            p: string | symbol
        ): PropertyDescriptor | undefined => {
            const x = this._getDownstreamDescriptor(p)
            if (x) {
                return {
                    ...x,
                    configurable: false,
                    writable: false
                }
            }
            return undefined
        }
        preventExtensions = () => true

        set = (target: T, p: string | symbol, value: any, receiver: any) => {
            throw this._proxyOperationError(`set property ${String(p)}`)
        }
        setPrototypeOf = () => {
            throw this._proxyOperationError("set the prototype of")
        }
        isExtensible = () => false
        get = (target: T, p: string | symbol, receiver: any) => {
            if (p === "constructor") {
                return this._props.impl.class?.pull() ?? this._props.actual
            }
            if (p === "__proto__" && "__proto__" in this._props.actual) {
                return this._props.impl.class?.pull()?.prototype ?? this._props.actual.__proto__
            }
            if (p in target) {
                return Reflect.get(target, p, receiver)
            }
            const descriptor = this._props.impl.descriptors.find(x => x.key === p).pull()
            if (descriptor) {
                return descriptor.value
            }
            return undefined
        }
    }

    export class ProxyOperationError extends InstrumentsError {
        constructor(message: string) {
            super(message)
        }
    }

    export class BadPropertyProxyError extends InstrumentsError {
        constructor(message: string, extras: Record<string, any>) {
            super(message, extras)
        }
    }
}
