export class Embedder<Target extends object, Value> {
    private _symbol!: symbol
    constructor(readonly name: string) {
        this._symbol = Symbol.for(`build.k8ts.org/${name}`)
    }

    [Symbol.toStringTag]() {
        return `Embedder(${this.name})`
    }

    toString() {
        return this[Symbol.toStringTag]()
    }

    overwrite(target: Target, data: Value) {
        Object.defineProperty(target, this._symbol, {
            enumerable: true,
            value: data,
            writable: true,
            configurable: true
        })
        return this
    }

    add(target: Target, data: Value) {
        if (Object.prototype.hasOwnProperty.call(target, this._symbol)) {
            throw new Error(`Decorator ${this.name} already set!`)
        }
        this.overwrite(target, data)
        return this
    }

    tryGet(target: Target): Value | undefined {
        return Reflect.get(target, this._symbol) as Value
    }

    get(target: Target): Value {
        const input = this.tryGet(target)
        if (!input) {
            throw new Error(
                `Target of type ${target} doesn't have any embedded data for ${this.name}!`
            )
        }
        return input
    }
}
