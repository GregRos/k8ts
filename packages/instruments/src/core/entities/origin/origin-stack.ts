import { AsyncLocalStorage } from "async_hooks"
import { doddle, type Doddle, type MaybeDoddle } from "doddle"
import { isIterable } from "what-are-you"
import type { OriginEntity } from "./origin-entity"

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

export interface OriginStackBinder {
    run<T>(callback: () => T): T
    bind<F extends (...args: any[]) => any>(fn: F): F
}

export class OriginStackRunner {
    blah = this

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
        return this._store.run(this.get().push(origin), callback)
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
            const result = self._run(origin.pull(), () => fn.apply(this, args))
            if (isIterable(result)) {
                return self._bindIterable(origin, result)
            }
            return result
        } as F
    }
}
