import { AsyncLocalStorage } from "async_hooks"
import type { OriginEntity } from "../graph"

export class _OriginStack {
    constructor(private readonly _origins: OriginEntity[]) {}

    push(origin: OriginEntity): _OriginStack {
        return new _OriginStack([...this._origins, origin])
    }

    pop(): _OriginStack {
        return new _OriginStack(this._origins.slice(0, -1))
    }

    get current(): OriginEntity | undefined {
        return this._origins.at(-1)
    }

    get isEmpty() {
        return this._origins.length === 0
    }
}

class _OriginStackRunner {
    private readonly _store: AsyncLocalStorage<_OriginStack>
    constructor() {
        this._store = new AsyncLocalStorage<_OriginStack>()
    }

    get(): _OriginStack {
        return this._store.getStore() ?? new _OriginStack([])
    }

    run<T>(origin: OriginEntity, callback: () => T): T {
        return this._store.run(this.get().push(origin), callback)
    }
}

export const OriginStackRunner = new _OriginStackRunner()
