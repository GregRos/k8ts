import chalk from "chalk"
import { Embedder } from "../_embedder"

export namespace Displayers {
    export interface Out {
        default: () => string | object
        pretty: () => string | object
    }
    export type In<Target extends object = object> = {
        default?: (this: Out, self: Target) => string | object
        pretty?: (this: Out, self: Target) => string | object
    }
}
const chalkNoColor = new chalk.Instance({
    level: 0
})
class DisplayerDecorator {
    private _system = new Embedder<object, Displayers.In>("displayers")

    implement(ctor: abstract new (...args: any[]) => object, input: Displayers.In) {
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
        for (const k in out) {
            const orig = oAny[k]
            if (typeof orig === "function") {
                oAny[k] = function (...args: any[]) {
                    const result = orig.call(oAny, ...args)
                    if (typeof result === "object") {
                        const sndDisplayers = Displayers.tryGet(result)
                        if (sndDisplayers) {
                            return (sndDisplayers as any)[k].call(sndDisplayers, result, ...args)
                        }
                        debugger
                    }
                    return result
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
            default: () => {
                const result = input.default?.call(o, target)
                if (!result) {
                    const pretty = input.pretty?.call(o, target)
                    if (typeof pretty === "string") {
                        return chalkNoColor(pretty)
                    }
                    return "?!!?"
                }
                return result
            },
            pretty: () => input.pretty?.call(o, target) ?? input.default?.call(o, target) ?? "?!?"
        }
        return this.wrapRecursiveFallback(o)
    }

    get(target: object): Displayers.Out {
        this._system.get(target) // error if not there
        return this.tryGet(target)!
    }

    get decorator() {
        return <
            Target extends abstract new (...args: any[]) => object,
            Impl extends Displayers.In<InstanceType<Target>>
        >(
            input: Impl
        ) => {
            return (ctor: Target) => {
                this.implement(ctor, input as any)
                return ctor
            }
        }
    }
}
export const Displayers = new DisplayerDecorator()
export const displayers = Displayers.decorator
