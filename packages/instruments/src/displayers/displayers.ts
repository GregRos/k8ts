import { Embedder } from "../_embedder"

export namespace Displayers {
    export interface Out {
        default: () => string | object
        pretty: () => string | object
    }
    export type In<Target extends object = object> = {
        default: (self: Target) => string | object
        pretty: (self: Target) => string | object
    } & {
        [key: string]: (self: Target, ...args: any[]) => any
    }
}

export class DisplayerDecorator {
    private _system = new Embedder<object, Displayers.In>("displayers")

    implement(ctor: abstract new (...args: any[]) => object, input: Displayers.In) {
        this._system.set(ctor.prototype, input)
    }

    get(target: object): Displayers.Out {
        const input = this._system.get(target)
        const o: Displayers.Out = {
            default: () => input.default.call(o, target),
            pretty: () => input.pretty.call(o, target)
        }
        return o
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
