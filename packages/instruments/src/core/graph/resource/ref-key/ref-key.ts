import type { Ref2_Of } from ".."
import { InstrumentsError } from "../../../../error"
import type { Kind } from "../api-kind"
import { External_Base, type External_Props, type External_WithFeatures } from "../external"

export type RefKey_Input = RefKey | RefKey["string"]
export type RefKey_sFormat<Kind extends string, Name extends string> = `${Kind}/${Name}`
const separator = "/"
export interface RefKey_Parsed {
    kind: string
    name: string
}

export function parse(ref: string) {
    const result = tryParse(ref)
    if (!result) {
        throw new InstrumentsError(`Could not parse reference key: ${ref}`)
    }
    return result
}

export function tryParse(ref: string): RefKey_Parsed | undefined {
    if (typeof ref !== "string") {
        return undefined
    }
    if (ref == null) {
        return undefined
    }
    if (typeof ref === "object") {
        return undefined
    }
    const [kind, name] = ref.split(separator).map(s => s.trim())
    if (!kind || !name) {
        return undefined
    }
    return {
        kind,
        name
    }
}

type nsKind = Kind<"", "v1", "Namespace">

export interface RefKey_Options<Name extends string = string> {
    name: Name
    namespace?: RefKey<nsKind> | string | Ref2_Of<nsKind>
}

export class RefKey<K extends Kind.IdentParent = Kind.IdentParent, Name extends string = string> {
    readonly name: string
    readonly namespace: string | undefined
    constructor(
        readonly kind: K,
        options: RefKey_Options<Name>
    ) {
        this.name = options.name
        this.namespace =
            typeof options.namespace === "string" ? options.namespace : options.namespace?.name
    }

    get string(): RefKey_sFormat<K["name"], Name> {
        return [this.kind.name, this.namespace, this.name]
            .filter(x => !!x)
            .join(separator) as RefKey_sFormat<K["name"], Name>
    }

    equals(other: RefKey): boolean {
        if (other == null) {
            return false
        }
        if (typeof other !== "object") {
            return false
        }
        return (
            this.kind.equals(other.kind) &&
            this.name === other.name &&
            this.namespace === other.namespace
        )
    }

    toString() {
        return this.string
    }

    External<const P extends External_Props<K> = External_Props<K>>(
        options?: P
    ): External_WithFeatures<K, P> {
        return new External_Base(this, options ?? {}) as any
    }
}
