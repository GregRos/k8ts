import { doddlify, seq, type Seq } from "doddle"
import type { AnyCtor } from "what-are-you"
import { InstrumentsError } from "../../../../error"

import type { Resource_Ctor_Of } from "../../resource"
import { Kind } from "../../resource/api-kind"
import { RefKey } from "../../resource/ref-key"
const separator = "/"
interface NodeEntry {
    kindName: string
    class: AnyCtor<any>
    ident: Kind.KindLike
}
export type KindMapInput<Ks extends Resource_Ctor_Of> = Ks[]
type LookupKey = string | RefKey | AnyCtor<any> | Kind.KindLike
export class KindMap<Kinds extends Resource_Ctor_Of = Resource_Ctor_Of> {
    __KINDS__!: Kinds["prototype"]["kind"]
    constructor(private _ownKinds: KindMapInput<Kinds>) {}

    [Symbol.iterator]() {
        return this._ownKinds[Symbol.iterator]()
    }
    child<Ks extends Resource_Ctor_Of = Resource_Ctor_Of>(
        kinds: KindMapInput<Ks> | KindMap<Ks>
    ): KindMap<Kinds | Ks> {
        const ownKinds = kinds instanceof KindMap ? kinds._ownKinds : kinds
        return new KindMap<Kinds | Ks>([...this._ownKinds, ...ownKinds])
    }

    @doddlify
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

    parse(ref: string | RefKey<this["__KINDS__"]>): RefKey<this["__KINDS__"]> {
        const result = this.tryParse(ref)
        if (!result) {
            throw new InstrumentsError(`Could not parse reference key: ${ref}`)
        }
        return result as any
    }

    tryParse(ref: unknown): RefKey<this["__KINDS__"]> | undefined {
        if (typeof ref !== "string" && typeof ref !== "object") {
            return undefined
        }
        if (ref == null) {
            return undefined
        }
        if (ref instanceof RefKey) {
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

        return (ident as Kind.Kind).refKey({
            name
        })
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
    private _convert(something: LookupKey | RefKey | Function | Kind.KindLike) {
        if (typeof something === "string") {
            if (something.includes("/")) {
                return this.parse(something).kind
            }
            return something
        } else if (typeof something === "function") {
            return something as AnyCtor<any>
        } else if (something instanceof Kind.Identifier) {
            return something.text
        } else if (something instanceof RefKey) {
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
        return this._entriesMap.get(converted)
    }

    tryGetKind(kindOrIdent: LookupKey): this["__KINDS__"] | undefined {
        return this._tryGetEntry(kindOrIdent)?.ident as this["__KINDS__"] | undefined
    }

    getKind(kindOrClass: LookupKey): this["__KINDS__"] {
        return this._getEntry(kindOrClass).ident
    }

    tryGetClass(kindOrIdent: LookupKey): AnyCtor<any> | undefined {
        return this._tryGetEntry(kindOrIdent)?.class
    }

    getClass(refKey: RefKey): AnyCtor<any>
    getClass<F extends AnyCtor<any>>(klass: F): F
    getClass(kind: string): AnyCtor<any>
    getClass(ident: Kind.KindLike): AnyCtor<any>
    getClass<T extends AnyCtor<any> | string>(
        kindOrClass: T
    ): T extends AnyCtor<any> ? string : AnyCtor<any>
    getClass(kindOrClass: LookupKey): AnyCtor<any> | string {
        return this._getEntry(kindOrClass).class
    }

    has(kindOrClass: LookupKey): boolean {
        return this._entriesMap.has(kindOrClass as any)
    }
}
