import { doddlify, seq, type Seq } from "doddle"

import { K8tsGraphError } from "../../error"
import { Gvk, Gvk_Base } from "../../resource/gvk"
import { ResourceIdent } from "../../resource/ident"
import { ResourceRef_Constructor } from "../../resource/ref"
const separator = "/"
interface GvkClassDictEntry {
    kindName: string
    class: ResourceRef_Constructor
    kind: Gvk
}
export type GvkClassDict_Input<Ks extends ResourceRef_Constructor> = Ks[]
type LookupKey = string | ResourceIdent | ResourceRef_Constructor | Gvk
export class GvkClassDict<Kinds extends ResourceRef_Constructor = ResourceRef_Constructor> {
    __KINDS__!: Kinds["prototype"]["kind"]
    constructor(private _ownKinds: GvkClassDict_Input<Kinds>) {}

    [Symbol.iterator]() {
        return this._ownKinds[Symbol.iterator]()
    }
    child<Ks extends ResourceRef_Constructor = ResourceRef_Constructor>(
        kinds: GvkClassDict_Input<Ks> | GvkClassDict<Ks>
    ): GvkClassDict<Kinds | Ks> {
        const ownKinds = kinds instanceof GvkClassDict ? kinds._ownKinds : kinds
        return new GvkClassDict<Kinds | Ks>([...this._ownKinds, ...ownKinds])
    }

    @doddlify
    private get _entriesSeq(): Seq<GvkClassDictEntry> {
        return seq(this._ownKinds).map(klass => {
            const kind = klass.prototype.kind
            const entry: GvkClassDictEntry = {
                kindName: kind.value,
                class: klass,
                kind: kind
            }
            return entry
        })
    }
    @doddlify
    private get _entriesMap(): Map<LookupKey, GvkClassDictEntry> {
        return seq(this._entriesSeq)
            .flatMap(entry => {
                return [
                    [entry.kindName, entry],
                    [entry.class, entry],
                    [entry.kind.url, entry]
                ] as const
            })
            .toMap(x => x)
            .pull()
    }

    parse(ref: string | ResourceIdent<this["__KINDS__"]>): ResourceIdent<this["__KINDS__"]> {
        const result = this.tryParse(ref)
        if (!result) {
            throw new K8tsGraphError(`Could not parse reference key: ${ref}`)
        }
        return result as any
    }

    tryParse(ref: unknown): ResourceIdent<this["__KINDS__"]> | undefined {
        if (typeof ref !== "string" && typeof ref !== "object") {
            return undefined
        }
        if (ref == null) {
            return undefined
        }
        if (ref instanceof ResourceIdent) {
            return ref
        }
        if (typeof ref === "object") {
            return undefined
        }
        const [sKind, name] = ref.split(separator).map(s => s.trim())
        if (!sKind || !name) {
            return undefined
        }
        const kind = this.tryGetKind(sKind)
        if (!kind) {
            return undefined
        }

        return (kind as Gvk).refKey({
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
    private _unknownIdentError(kind: Gvk_Base) {
        return new K8tsGraphError(`The kind identifier ${kind} is not registered`)
    }
    private _unknownClassError(klass: Function) {
        return new K8tsGraphError(`The class ${klass.name} is not registered`)
    }
    private _convert(something: LookupKey | ResourceIdent | Function | Gvk) {
        if (typeof something === "string") {
            if (something.includes("/")) {
                const r = this.parse(something)
                return r.kind.url
            }
            return something
        } else if (typeof something === "function") {
            return something as ResourceRef_Constructor
        } else if (something instanceof Gvk_Base) {
            return something.url
        } else if (something instanceof ResourceIdent) {
            return something.kind.url
        }
        throw new K8tsGraphError(`Invalid argument ${something}`)
    }
    private _getEntry(key: LookupKey) {
        const entry = this._tryGetEntry(key)
        if (!entry) {
            if (typeof key === "string") {
                throw this._unknownNameError(key)
            } else if (key instanceof Gvk_Base) {
                throw this._unknownIdentError(key)
            } else if (typeof key === "function") {
                throw this._unknownClassError(key)
            }
        }
        return entry!
    }
    private _tryGetEntry(key: LookupKey): GvkClassDictEntry | undefined {
        const converted = this._convert(key)
        return this._entriesMap.get(converted)
    }

    tryGetKind(kindOrIdent: LookupKey): this["__KINDS__"] | undefined {
        return this._tryGetEntry(kindOrIdent)?.kind as this["__KINDS__"] | undefined
    }

    getKind(kindOrClass: LookupKey): this["__KINDS__"] {
        return this._getEntry(kindOrClass).kind
    }

    tryGetClass(kind: LookupKey): ResourceRef_Constructor | undefined {
        return this._tryGetEntry(kind)?.class
    }

    getClass(refKey: ResourceIdent): ResourceRef_Constructor
    getClass<F extends ResourceRef_Constructor>(klass: F): F
    getClass(kind: string): ResourceRef_Constructor
    getClass(kind: Gvk): ResourceRef_Constructor
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
