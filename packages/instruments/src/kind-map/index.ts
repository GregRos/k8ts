import { Map, type Set } from "immutable"
import { Kind } from "../api-kind"
import { InstrumentsError } from "../error"
import { RefKey } from "../ref-key"
const separator = "/"
type LookupKey = NodeEntry[keyof NodeEntry]
interface NodeEntry {
    kind: string
    class: Function
    ident: Kind.Identifier
}
export class KindMap {
    constructor(private _entryMap: Map<LookupKey, NodeEntry> = Map([]) as any) {}

    refKey<Kind extends string, Name extends string>(
        kind: Kind | Kind.Identifier<Kind>,
        name: Name
    ): RefKey<Kind, Name> {
        const trueKind = this.getKind(kind)
        return new RefKey.RefKey(trueKind, name) as any
    }

    private _bindEntry(entry: NodeEntry) {
        for (const key of [entry.kind, entry.class, entry.ident]) {
            this._entryMap = this._entryMap.set(key, entry)
        }
    }

    add(kind: Kind.Identifier, klass: Function) {
        this._bindEntry({
            kind: kind.name,
            class: klass,
            ident: kind
        })
    }

    register = (kind: Kind.Identifier) => {
        return <T extends Function>(target: T) => {
            this._bindEntry({
                kind: kind.name,
                class: target,
                ident: kind
            })

            return target as T & { kind: string }
        }
    }
    parse(ref: string | RefKey) {
        const result = this.tryParse(ref)
        if (!result) {
            throw new InstrumentsError(`Could not parse reference key: ${ref}`)
        }
        return result
    }

    tryParse(ref: unknown): RefKey.RefKey | undefined {
        if (typeof ref !== "string" && typeof ref !== "object") {
            return undefined
        }
        if (ref == null) {
            return undefined
        }
        if (ref instanceof RefKey.RefKey) {
            return ref
        }
        if (typeof ref === "object") {
            return undefined
        }
        const [kind, name] = ref.split(separator).map(s => s.trim())
        if (!kind || !name) {
            return undefined
        }
        return this.refKey(kind, name)
    }
    get kinds(): Set<string> {
        return this._entryMap
            .keySeq()
            .filter(k => typeof k === "string")
            .toSet()
    }

    merge(other?: KindMap) {
        if (!other) {
            return this
        }
        return new KindMap(this._entryMap.merge(other._entryMap) as any)
    }

    private _unknownNameError(kind: string) {
        return new InstrumentsError(`The shorthand name ${kind} is not registered`)
    }
    private _unknownIdentError(ident: Kind.Identifier) {
        return new InstrumentsError(`The kind identifier ${ident} is not registered`)
    }
    private _unknownClassError(klass: Function) {
        return new InstrumentsError(`The class ${klass.name} is not registered`)
    }
    private _convert(something: LookupKey | RefKey.RefKey) {
        if (typeof something === "string") {
            if (something.includes("/")) {
                return this.parse(something).kind
            }
            return something
        } else if (typeof something === "function" || something instanceof Kind.Identifier) {
            return something
        } else if (something instanceof RefKey.RefKey) {
            return something.kind
        }
        throw new InstrumentsError(`Invalid argument ${something}`)
    }
    _check(key: LookupKey | RefKey.RefKey, val?: any) {}
    private _getEntry(key: LookupKey | RefKey.RefKey) {
        const converted = this._convert(key)
        const entry = this._tryGetEntry(key)
        if (!entry) {
            if (typeof converted === "string") {
                throw this._unknownNameError(converted)
            } else if (converted instanceof Kind.Identifier) {
                throw this._unknownIdentError(converted)
            } else if (typeof converted === "function") {
                throw this._unknownClassError(converted)
            }
        }
        return entry!
    }
    private _tryGetEntry(key: LookupKey | RefKey.RefKey) {
        const converted = this._convert(key)
        return this._entryMap.get(converted)
    }

    tryGetKind<Name extends string>(refKey: RefKey.RefKey<Name>): Kind.Identifier<Name> | undefined
    tryGetKind<F extends Kind.Identifier>(klass: F): F
    tryGetKind<Name extends string>(kind: Name): Kind.Identifier<Name> | undefined
    tryGetKind(key: LookupKey): Kind.Identifier | undefined
    tryGetKind(kindOrIdent: LookupKey | RefKey.RefKey): Kind.Identifier | undefined {
        return this._tryGetEntry(kindOrIdent)?.ident
    }

    getKind<K extends Kind.Identifier>(kind: K): K
    getKind<Name extends string>(kind: Name): Kind.Identifier<Name>
    getKind(kindOrClass: LookupKey): Kind.Identifier
    getKind(kindOrClass: string | Function): Kind.Identifier {
        return this._getEntry(kindOrClass).ident
    }

    tryGetClass<F extends Function>(klass: F): F
    tryGetClass(kind: string): Function | undefined
    tryGetClass(ident: Kind.Identifier): Function | undefined
    tryGetClass(kindOrIdent: string | Kind.Identifier): Function | undefined {
        return this._tryGetEntry(kindOrIdent)?.class
    }

    getClass(refKey: RefKey.RefKey): Function
    getClass<F extends Function>(klass: F): F
    getClass(kind: string): Function
    getClass<T extends Function | string>(kindOrClass: T): T extends Function ? string : Function
    getClass(kindOrClass: string | Function | RefKey.RefKey): Function | string {
        return this._getEntry(kindOrClass).class
    }

    has(kindOrClass: LookupKey): boolean {
        return this._entryMap.has(kindOrClass as any)
    }
}
