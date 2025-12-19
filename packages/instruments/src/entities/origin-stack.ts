import { AsyncLocalStorage } from "async_hooks"
import { doddle, type Doddle } from "doddle"
import type { OriginEntity } from "../graph"

export class OriginStack {
    constructor(private readonly _origins: OriginEntity[]) {}

    push(origin: OriginEntity): OriginStack {
        return new OriginStack([...this._origins, origin])
    }

    pop(): OriginStack {
        return new OriginStack(this._origins.slice(0, -1))
    }

    get current(): OriginEntity | undefined {
        return this._origins.at(-1)
    }

    get isEmpty() {
        return this._origins.length === 0
    }
}

class _OriginStackRunner {
    private readonly _store: AsyncLocalStorage<OriginStack>
    constructor() {
        this._store = new AsyncLocalStorage<OriginStack>()
    }

    get current(): OriginEntity | undefined {
        return this.get().current
    }

    get(): OriginStack {
        return this._store.getStore() ?? new OriginStack([])
    }

    run<T>(origin: OriginEntity, callback: () => T): T {
        return this._store.run(this.get().push(origin), callback)
    }

    bindIter<F extends (...args: any[]) => Iterable<any>>(
        _origin: Doddle<OriginEntity> | OriginEntity,
        generatorFunction: F
    ) {
        const runner = this
        return function boundGeneratorFunction(this: any, ...args: any[]) {
            const self = this
            const gen = generatorFunction.apply(self, args)
            const iterator = gen[Symbol.iterator]()
            const boundIterator: Iterable<any> = {
                [Symbol.iterator]() {
                    return {
                        next() {
                            const origin = doddle.is(_origin) ? _origin.pull() : _origin
                            return runner.run(origin, () => iterator.next())
                        },
                        return(value?: any) {
                            if (iterator.return) {
                                return iterator.return(value)
                            }
                            return {
                                done: true,
                                value
                            }
                        },
                        throw(err?: any) {
                            if (iterator.throw) {
                                return iterator.throw(err)
                            }
                            throw err
                        }
                    }
                }
            }
            return boundIterator
        } as F
    }

    bind<F extends (...args: any[]) => any>(origin: Doddle<OriginEntity>, fn: F): F {
        const self = this
        return function boundRunFunction(this: any, ...args: any[]) {
            return self.run(origin.pull(), () => fn.apply(this, args))
        } as F
    }
}

export const OriginStackRunner = new _OriginStackRunner()
