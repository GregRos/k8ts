export interface DecoratorTypes {
    __SUBJECT__: object
    __INPUT__: unknown
    __OUTPUT__: unknown
}
export class BaseDecorator<Types extends DecoratorTypes> {
    __DECORATOR__!: Types
    private _symbol!: symbol
    constructor(
        readonly name: string,
        protected readonly _mapper: (
            this: Types["__SUBJECT__"],
            self: Types["__SUBJECT__"],
            input: Types["__INPUT__"]
        ) => Types["__OUTPUT__"]
    ) {
        this._symbol = Symbol.for(`build.k8ts.org/decorators/${name}`)
    }

    set(target: Types["__SUBJECT__"], inputDecoritized: Types["__INPUT__"]) {
        if (Object.prototype.hasOwnProperty.call(target, this._symbol)) {
            throw new Error(`Decorator ${this.name} already set!`)
        }

        Object.defineProperty(target, this._symbol, {
            enumerable: false,
            value: inputDecoritized,
            writable: true,
            configurable: true
        })
    }

    resolveInput(target: Types["__SUBJECT__"], input: Types["__INPUT__"]) {
        return this._mapper(target, input)
    }

    getOn(target: Types["__SUBJECT__"]): Types["__OUTPUT__"] {
        const input = Reflect.get(target, this._symbol) as Types["__INPUT__"] | undefined
        if (!input) {
            throw new Error(
                `Target ${target.constructor.name} doesn't have the ${this.name} decorator!`
            )
        }
        const outputDecoritized = this.resolveInput(target, input)
        return outputDecoritized
    }

    map<T2 extends DecoratorTypes>(
        mapping: (self: Types["__SUBJECT__"], input: Types["__INPUT__"]) => T2["__INPUT__"]
    ) {
        return new BaseDecorator<T2>(this.name, (self, input) => {
            return mapping(self, this._mapper(self, input))
        })
    }
}

export class SimpleDecorator<Subject extends object, Value> extends BaseDecorator<{
    __SUBJECT__: Subject
    __INPUT__: Value
    __OUTPUT__: Value
}> {
    constructor(name: string) {
        super(name, (_, input) => input)
    }
}
