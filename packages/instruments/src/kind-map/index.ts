import { doddlify, seq, type Seq } from "doddle"
import { Kind } from "../api-kind"
import { InstrumentsError } from "../error"
import { RefKey } from "../ref-key"
import type { Kinded } from "../reference"
import type { CtorOfKinded } from "../reference/refable"
const separator = "/"
interface NodeEntry {
    kindName: string
    class: Function
    ident: Kind.IdentParent
}
export type KindMapInput<Ks extends Kind.IdentParent = Kind.IdentParent> = readonly CtorOfKinded<
    Kinded<Ks>
>[]
type LookupKey = string | RefKey.RefKey | Function | Kind.IdentParent
export class KindMap<Kinds extends Kind.IdentParent = Kind.IdentParent> {
    constructor(
        private _ownKinds: KindMapInput<Kinds>,
        private _parent: KindMap | undefined = undefined
    ) {}

    child<Ks extends Kind.IdentParent = Kind.IdentParent>(
        kinds: KindMapInput<Ks> | KindMap<Ks>
    ): KindMap<Kinds | Ks> {
        const ownKinds = kinds instanceof KindMap ? kinds._ownKinds : kinds
        return new KindMap<Kinds | Ks>(ownKinds, this)
    }

    private get _entriesSeq(): Seq<NodeEntry> {
        return seq(this._ownKinds).map(klass => {
            const kind = klass.prototype.kind
            const entry: NodeEntry = {
                kindName: kind.name,
                class: klass,
                ident: kind
            }
            return entry
        })
    }
    @doddlify
    private get _entriesMap(): Map<LookupKey, NodeEntry> {
        return seq(this._entriesSeq)
            .flatMap(entry => {
                return [
                    [entry.kindName, entry],
                    [entry.class, entry],
                    [entry.ident.text, entry]
                ] as const
            })
            .toMap(x => x)
            .pull()
    }

    refKey<Kind extends Kinds, Name extends string>(kind: Kind, name: Name): RefKey<Kind, Name> {
        const trueKind = this.getKind(kind)
        return new RefKey.RefKey(trueKind, name) as any
    }

    parse(ref: string | RefKey<Kinds>): RefKey<Kinds> {
        const result = this.tryParse(ref)
        if (!result) {
            throw new InstrumentsError(`Could not parse reference key: ${ref}`)
        }
        return result
    }

    tryParse(ref: unknown): RefKey.RefKey<Kinds> | undefined {
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
        const ident = this.tryGetKind(kind)
        if (!ident) {
            return undefined
        }
        return this.refKey(ident, name)
    }

    get kinds(): Set<string> {
        return this._entriesSeq
            .map(x => x.kindName)
            .toSet()
            .pull()
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
    private _convert(something: LookupKey | RefKey.RefKey | Function | Kind.IdentParent) {
        if (typeof something === "string") {
            if (something.includes("/")) {
                return this.parse(something).kind
            }
            return something
        } else if (typeof something === "function") {
            return something
        } else if (something instanceof Kind.Identifier) {
            return something.text
        } else if (something instanceof RefKey.RefKey) {
            return something.kind.text
        }
        throw new InstrumentsError(`Invalid argument ${something}`)
    }
    private _getEntry(key: LookupKey) {
        const entry = this._tryGetEntry(key)
        if (!entry) {
            if (typeof key === "string") {
                throw this._unknownNameError(key)
            } else if (key instanceof Kind.Identifier) {
                throw this._unknownIdentError(key)
            } else if (typeof key === "function") {
                throw this._unknownClassError(key)
            }
        }
        return entry!
    }
    private _tryGetEntry(key: LookupKey): NodeEntry | undefined {
        const converted = this._convert(key)
        return this._entriesMap.get(converted) ?? this._parent?._tryGetEntry(key) ?? undefined
    }

    tryGetKind<P extends Kind.IdentParent>(
        refKey: RefKey.RefKey<P>
    ): Kind.Identifier<P["name"]> | undefined
    tryGetKind<F extends Kind.IdentParent>(klass: F): F
    tryGetKind(kind: Function): Kinds | undefined
    tryGetKind<Name extends string>(kind: Name): (Kinds & { name: Name }) | undefined
    tryGetKind(key: LookupKey): Kinds | undefined
    tryGetKind(kindOrIdent: LookupKey): any {
        return this._tryGetEntry(kindOrIdent)?.ident as Kinds | undefined
    }

    getKind<K extends Kind.IdentParent>(kind: K): K
    getKind<Name extends string>(kind: Name): Kinds & { name: Name }
    getKind(key: Function): Kinds
    getKind(kindOrClass: LookupKey): Kinds
    getKind(kindOrClass: LookupKey): Kinds {
        return this._getEntry(kindOrClass).ident as Kinds
    }

    tryGetClass(refKey: RefKey.RefKey): Function | undefined
    tryGetClass<F extends Function>(klass: F): F
    tryGetClass(kind: string): Function | undefined
    tryGetClass(ident: Kind.IdentParent): Function | undefined
    tryGetClass(kindOrIdent: LookupKey): Function | undefined {
        return this._tryGetEntry(kindOrIdent)?.class
    }

    getClass(refKey: RefKey.RefKey): Function
    getClass<F extends Function>(klass: F): F
    getClass(kind: string): Function
    getClass(ident: Kind.IdentParent): Function
    getClass<T extends Function | string>(kindOrClass: T): T extends Function ? string : Function
    getClass(kindOrClass: LookupKey): Function | string {
        return this._getEntry(kindOrClass).class
    }

    has(kindOrClass: LookupKey): boolean {
        return this._entriesMap.has(kindOrClass as any)
    }
}
