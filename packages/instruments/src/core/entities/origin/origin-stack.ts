import { AsyncLocalStorage } from "async_hooks"
import { doddle, pull, type Doddle, type MaybeDoddle } from "doddle"
import { isIterable } from "what-are-you"
import type { OriginEntity } from "./origin-entity"

export interface OriginStackBinder {
    run<T>(callback: () => T): T
    bind<F extends (...args: any[]) => any>(fn: F): F
}

export class OriginStackRunner {
    private readonly _store: AsyncLocalStorage<OriginEntity | undefined>
    constructor() {
        this._store = new AsyncLocalStorage<OriginEntity | undefined>()
    }

    get current(): OriginEntity | undefined {
        return this._store.getStore()
    }

    disposableOriginModifier(origin: OriginEntity): Disposable {
        const curOrigin = this._store.getStore()
        this._store.enterWith(origin)
        return {
            [Symbol.dispose]: () => {
                this._store.enterWith(curOrigin)
            }
        }
    }

    binder(origin: MaybeDoddle<OriginEntity>): OriginStackBinder {
        const runner = this
        return {
            run<T>(callback: () => T): T {
                const orig = doddle.is(origin) ? origin.pull() : origin
                return runner._run(orig, callback)
            },
            bind<F extends (...args: any[]) => any>(fn: F): F {
                const boundOrigin = origin
                return runner._bind(boundOrigin as Doddle<OriginEntity>, fn)
            }
        }
    }

    private _run<T>(origin: OriginEntity, callback: () => T): T {
        return this._store.run(origin, callback)
    }

    private _bindIterator(
        boundOrigin: Doddle<OriginEntity> | OriginEntity,
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
        boundOrigin: Doddle<OriginEntity> | OriginEntity,
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

    private _bind<F extends (...args: any[]) => any>(origin: Doddle<OriginEntity>, fn: F): F {
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
