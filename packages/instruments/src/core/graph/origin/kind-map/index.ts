import { doddlify, seq, type Seq } from "doddle"

import { K8tsGraphError } from "../../error"
import { Ident, IdentKind } from "../../resource/api-kind"
import { ResourceKey } from "../../resource/key"
import { ResourceRef_Constructor } from "../../resource/ref"
const separator = "/"
interface NodeEntry {
    kindName: string
    class: ResourceRef_Constructor
    ident: IdentKind
}
export type KindMap_Input<Ks extends ResourceRef_Constructor> = Ks[]
type LookupKey = string | ResourceKey | ResourceRef_Constructor | IdentKind
export class KindMap<Kinds extends ResourceRef_Constructor = ResourceRef_Constructor> {
    __KINDS__!: Kinds["prototype"]["ident"]
    constructor(private _ownKinds: KindMap_Input<Kinds>) {}

    [Symbol.iterator]() {
        return this._ownKinds[Symbol.iterator]()
    }
    child<Ks extends ResourceRef_Constructor = ResourceRef_Constructor>(
        kinds: KindMap_Input<Ks> | KindMap<Ks>
    ): KindMap<Kinds | Ks> {
        const ownKinds = kinds instanceof KindMap ? kinds._ownKinds : kinds
        return new KindMap<Kinds | Ks>([...this._ownKinds, ...ownKinds])
    }

    @doddlify
    private get _entriesSeq(): Seq<NodeEntry> {
        return seq(this._ownKinds).map(klass => {
            const kind = klass.prototype.ident
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

    parse(ref: string | ResourceKey<this["__KINDS__"]>): ResourceKey<this["__KINDS__"]> {
        const result = this.tryParse(ref)
        if (!result) {
            throw new K8tsGraphError(`Could not parse reference key: ${ref}`)
        }
        return result as any
    }

    tryParse(ref: unknown): ResourceKey<this["__KINDS__"]> | undefined {
        if (typeof ref !== "string" && typeof ref !== "object") {
            return undefined
        }
        if (ref == null) {
            return undefined
        }
        if (ref instanceof ResourceKey) {
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

        return (ident as IdentKind).refKey({
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
        return new K8tsGraphError(`The shorthand name ${kind} is not registered`)
    }
    private _unknownIdentError(ident: Ident) {
        return new K8tsGraphError(`The kind identifier ${ident} is not registered`)
    }
    private _unknownClassError(klass: Function) {
        return new K8tsGraphError(`The class ${klass.name} is not registered`)
    }
    private _convert(something: LookupKey | ResourceKey | Function | IdentKind) {
        if (typeof something === "string") {
            if (something.includes("/")) {
                const r = this.parse(something)
                return r.kind.text
            }
            return something
        } else if (typeof something === "function") {
            return something as ResourceRef_Constructor
        } else if (something instanceof Ident) {
            return something.text
        } else if (something instanceof ResourceKey) {
            return something.kind.text
        }
        throw new K8tsGraphError(`Invalid argument ${something}`)
    }
    private _getEntry(key: LookupKey) {
        const entry = this._tryGetEntry(key)
        if (!entry) {
            if (typeof key === "string") {
                throw this._unknownNameError(key)
            } else if (key instanceof Ident) {
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

    tryGetClass(kindOrIdent: LookupKey): ResourceRef_Constructor | undefined {
        return this._tryGetEntry(kindOrIdent)?.class
    }

    getClass(refKey: ResourceKey): ResourceRef_Constructor
    getClass<F extends ResourceRef_Constructor>(klass: F): F
    getClass(kind: string): ResourceRef_Constructor
    getClass(ident: IdentKind): ResourceRef_Constructor
    getClass<T extends ResourceRef_Constructor | string>(
        kindOrClass: T
    ): T extends ResourceRef_Constructor ? string : ResourceRef_Constructor
    getClass(kindOrClass: LookupKey): ResourceRef_Constructor | string {
        return this._getEntry(kindOrClass).class
    }

    has(kindOrClass: LookupKey): boolean {
        return this._entriesMap.has(kindOrClass as any)
    }
}
