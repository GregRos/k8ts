import { Map, type Set } from "immutable"
import { InstrumentsError } from "../error"

export class KindMap {
    constructor(
        private _kindOrClassMap: Map<string, Function> & Map<Function, string> = Map([]) as any
    ) {}

    register = (kind: string) => {
        return <T extends Function>(target: T) => {
            this._kindOrClassMap = this._kindOrClassMap.set(kind, target).set(target, kind)
            return target as T & { kind: string }
        }
    }

    get kinds(): Set<string> {
        return this._kindOrClassMap
            .keySeq()
            .filter(k => typeof k === "string")
            .toSet()
    }

    merge(other: KindMap) {
        return new KindMap(this._kindOrClassMap.merge(other._kindOrClassMap) as any)
    }

    private _missingClassError(kind: string) {
        return new InstrumentsError(`No class registered for kind ${kind}`)
    }
    private _missingKindError(klass: Function) {
        return new InstrumentsError(`No kind registered for class ${klass.name}`)
    }

    get(kind: string): Function
    get(klass: Function): string
    get<T extends Function | string>(kindOrClass: T): T extends Function ? string : Function
    get(kindOrClass: string | Function): Function | string {
        if (!this.has(kindOrClass)) {
            if (typeof kindOrClass === "string") {
                throw this._missingClassError(kindOrClass)
            } else if (typeof kindOrClass === "function") {
                throw this._missingKindError(kindOrClass)
            } else {
                throw new InstrumentsError(`Invalid argument ${kindOrClass}`)
            }
        }
        return this._kindOrClassMap.get(kindOrClass as any)!
    }

    has(kindOrClass: string | Function): boolean {
        return this._kindOrClassMap.has(kindOrClass as any)
    }
}
