import { AsyncLocalStorage } from "async_hooks"
import { doddle, pull, type Doddle, type MaybeDoddle } from "doddle"
import { isIterable } from "what-are-you"
import type { Origin_Entity } from "./entity"

export interface OriginStackBinder {
    run<T>(callback: () => T): T
    bind<F extends (...args: any[]) => any>(fn: F): F
}

export class _OriginContextTracker {
    private readonly _store: AsyncLocalStorage<Origin_Entity | undefined>
    constructor() {
        this._store = new AsyncLocalStorage<Origin_Entity | undefined>()
    }

    get current(): Origin_Entity | undefined {
        return this._store.getStore()
    }

    disposableOriginModifier(origin: Origin_Entity): Disposable {
        const curOrigin = this._store.getStore()
        this._store.enterWith(origin)
        return {
            [Symbol.dispose]: () => {
                this._store.enterWith(curOrigin)
            }
        }
    }

    binder(origin: MaybeDoddle<Origin_Entity>): OriginStackBinder {
        const runner = this
        return {
            run<T>(callback: () => T): T {
                const orig = doddle.is(origin) ? origin.pull() : origin
                return runner._run(orig, callback)
            },
            bind<F extends (...args: any[]) => any>(fn: F): F {
                const boundOrigin = origin
                return runner._bind(boundOrigin as Doddle<Origin_Entity>, fn)
            }
        }
    }

    private _run<T>(origin: Origin_Entity, callback: () => T): T {
        return this._store.run(origin, callback)
    }

    private _bindIterator(
        boundOrigin: Doddle<Origin_Entity> | Origin_Entity,
        iterator: Iterator<any>
    ): Iterator<any> {
        const runner = this
        return {
            next() {
                const origin = doddle.is(boundOrigin) ? boundOrigin.pull() : boundOrigin
                return runner._run(origin, () => iterator.next())
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

    private _bindIterable<It extends Iterable<any>>(
        boundOrigin: Doddle<Origin_Entity> | Origin_Entity,
        iterable: It
    ) {
        const iterator = iterable[Symbol.iterator]()
        const runner = this
        const boundIterator: Iterable<any> = {
            [Symbol.iterator]() {
                return runner._bindIterator(boundOrigin, iterator)
            }
        }
        return boundIterator
    }

    private _bind<F extends (...args: any[]) => any>(origin: Doddle<Origin_Entity>, fn: F): F {
        const self = this
        return function boundRunFunction(this: any, ...args: any[]) {
            const result = self._run(pull(origin), () => fn.apply(this, args))
            if (isIterable(result)) {
                return self._bindIterable(origin, result)
            }
            return result
        } as F
    }
}

export const OriginContextTracker = new _OriginContextTracker()
