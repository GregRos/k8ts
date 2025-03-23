import chalk from "chalk"
import { Embedder } from "../_embedder"

export type KnownFormats = "local" | "global" | undefined
export namespace Displayers {
    export interface Out {
        default: (format?: string) => string
        simple: (format?: KnownFormats | string) => string
        pretty: (format?: KnownFormats | string) => string
        prefix?: () => string
    }
    export type In<Target extends object = object> = {
        simple?: (this: Out, self: Target, format?: string) => string | object
        pretty?: (this: Out, self: Target, format?: string) => string | object
        prefix?: (this: Out, self: Target) => string
    }
    export type Modes = keyof In
}
const chalkNoColor = new chalk.Instance({
    level: 0
})
class DisplayerDecorator {
    private _system = new Embedder<object, Displayers.In>("displayers")
    private _lastMode: Displayers.Modes = "simple"
    private _withLastMode(mode: Displayers.Modes, fn: (...args: any[]) => string) {
        return (...args: any[]) => {
            const oldMode = this._lastMode
            this._lastMode = mode
            const result = fn(...args)
            this._lastMode = oldMode
            return result
        }
    }
    implement(ctor: typeof PrivateCtorExemplar, input: Displayers.In) {
        this._system.set(ctor.prototype, input)
        const decorator = this
        Object.defineProperties(ctor.prototype, {
            [Symbol.toStringTag]: {
                get() {
                    const a = decorator.get(this)
                    return a.default()
                }
            },
            toString: {
                value() {
                    return this[Symbol.toStringTag]
                }
            }
        })
    }

    wrapRecursiveFallback(out: Displayers.Out) {
        const oAny = out as any
        const self = this
        for (const k in out) {
            const orig = oAny[k]
            if (typeof orig === "function") {
                oAny[k] = function (...args: any[]) {
                    const oldMode = self._lastMode
                    if (k === "simple" || k === "pretty") {
                        self._lastMode = k
                    }
                    try {
                        let result = orig.call(oAny, ...args)
                        if (!Array.isArray(result)) {
                            result = [result]
                        }
                        const terms = result.map((x: any) => {
                            const sndDisplayers = Displayers.tryGet(x) as any
                            if (sndDisplayers) {
                                return sndDisplayers[k].call(sndDisplayers, x, ...args)
                            }
                            return x
                        })
                        return terms.join(" ")
                    } finally {
                        this._lastMode = oldMode
                    }
                }
            }
        }
        return out
    }

    tryGet(target: any): Displayers.Out | undefined {
        if (typeof target !== "object") {
            return undefined
        }
        const input = this._system.get(target)
        if (!input) {
            return undefined
        }
        const o: Displayers.Out = {
            default: (format?: string) => {
                const lastMode = this._lastMode
                const result = o[lastMode]?.call(o, format) ?? o.simple(format)
                return result
            },
            simple: format => {
                const result = input.simple?.call(o, target, format)
                if (!result) {
                    const pretty = input.pretty?.call(o, target, format)
                    if (typeof pretty === "string") {
                        return chalkNoColor(pretty)
                    }
                    return "?!!?"
                }
                return result as any
            },
            prefix: input.prefix && (() => input.prefix!.call(o, target)),
            pretty: format => {
                return (input.pretty?.call(o, target, format) ??
                    input.simple?.call(o, target, format) ??
                    "?!?") as any
            }
        }
        return this.wrapRecursiveFallback(o)
    }

    get(target: object): Displayers.Out {
        this._system.get(target) // error if not there
        return this.tryGet(target)!
    }

    get decorator() {
        return <Target extends AnyCtor<any>, Impl extends Displayers.In<InstanceTypeOf<Target>>>(
            input: Impl
        ) => {
            return (ctor: Target) => {
                this.implement(ctor, input as any)
            }
        }
    }
}

export type PrivateCtor<T extends object> = typeof PrivateCtorExemplar & {
    prototype: T
}

export type PublicCtor<T extends object> = abstract new (...args: any[]) => T

export type AnyCtor<T extends object> = PrivateCtor<T> | PublicCtor<T>

export type InstanceTypeOf<T extends AnyCtor<any>> =
    T extends PrivateCtor<infer U> ? U : T extends PublicCtor<infer U> ? U : never
abstract class PrivateCtorExemplar {
    protected constructor(...args: any[]) {}
}

export const Displayers = new DisplayerDecorator()
export const displayers = Displayers.decorator
