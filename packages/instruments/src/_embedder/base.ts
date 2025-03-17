export class Embedder<Target extends object, Value> {
    private _symbol!: symbol
    constructor(readonly name: string) {
        this._symbol = Symbol.for(`build.k8ts.org/${name}`)
    }

    set(target: Target, data: Value) {
        if (Object.prototype.hasOwnProperty.call(target, this._symbol)) {
            throw new Error(`Decorator ${this.name} already set!`)
        }

        Object.defineProperty(target, this._symbol, {
            enumerable: false,
            value: data,
            writable: true,
            configurable: true
        })
        return this
    }

    get(target: Target): Value {
        const input = Reflect.get(target, this._symbol) as Value
        if (!input) {
            throw new Error(
                `Target of type ${target.constructor.name} doesn't have any embedded data for ${this.name}!`
            )
        }
        return input
    }
}
