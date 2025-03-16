export type InputDecoritized<Target, T> = {
    [K in keyof T]: (this: Target, self: Target) => T[K]
}

export type ObjectMixinMapper<
    InputTypes extends Record<keyof InputTypes, any>,
    OutputTypes extends Record<keyof InputTypes, any>
> = {
    [K in keyof InputTypes]: (from: InputTypes[K] | undefined) => OutputTypes[K]
}

export type OutputDecoritized<T> = {
    [K in keyof T]: () => T[K]
}
export type Mapping<InputType, OutputType> = <Target>(
    this: Target,
    self: Target,
    input: InputType
) => OutputType

export class BaseDecorator<InputType, OutputType = InputType> {
    __INPUT__!: InputType
    __OUTPUT__!: OutputType
    private _symbol!: symbol
    constructor(
        private readonly _name: string,
        private readonly _mapper: <Target>(self: Target, input: InputType) => OutputType
    ) {
        this._symbol = Symbol.for(`build.k8ts.org/decorators/${_name}`)
    }

    set<Target>(target: Target, inputDecoritized: InputType) {
        if (Object.prototype.hasOwnProperty.call(target, this._symbol)) {
            throw new Error(`Decorator ${this._name} already set!`)
        }

        Object.defineProperty(target, this._symbol, {
            enumerable: false,
            value: inputDecoritized,
            writable: true,
            configurable: true
        })
    }

    resolveInput<Target>(target: Target, inputDecoritized: InputType) {
        return this._mapper(target, inputDecoritized)
    }

    getOnPrototype<Target extends object>(target: { new (...args: any[]): Target }): OutputType {
        return this.getOn(target.prototype)
    }
    getOn<Target extends object>(target: Target): OutputType {
        const input = Reflect.get(target, this._symbol) as InputType | undefined
        if (!input) {
            throw new Error(
                `Target ${target.constructor.name} doesn't have the ${this._name} decorator!`
            )
        }
        const outputDecoritized = this.resolveInput(target, input)
        return outputDecoritized
    }
}

export class ObjectMixinDecorator<
    BaseTarget extends object,
    InputTypes extends Record<keyof InputTypes, any>,
    OutputTypes extends Record<keyof InputTypes, any>
> extends BaseDecorator<InputDecoritized<BaseTarget, InputTypes>, OutputDecoritized<OutputTypes>> {
    constructor(
        name: string,
        private mapper: ObjectMixinMapper<InputTypes, OutputTypes>
    ) {
        super(name, (self, input) => this._map(self as any, input))
    }

    private _map<Target extends BaseTarget>(
        self: Target,
        input: InputDecoritized<Target, InputTypes>
    ): OutputDecoritized<OutputTypes> {
        const output = {} as OutputDecoritized<OutputTypes>
        for (const key in input) {
            const mapping = this.mapper[key]
            const implementation = input[key]
            output[key] = () => {
                const mapped = mapping.call(self, implementation?.call(self, self))
                return mapped
            }
        }
        return output
    }
}
