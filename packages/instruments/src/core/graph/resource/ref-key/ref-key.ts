import { InstrumentsError } from "../../../../error"
import type { Kind } from "../api-kind"

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
export class RefKey<K extends Kind.IdentParent = Kind.IdentParent, Name extends string = string> {
    constructor(
        readonly kind: K,
        readonly name: Name
    ) {}

    get string(): RefKey_sFormat<K["name"], Name> {
        return [this.kind.name, this.name].join(separator) as RefKey_sFormat<K["name"], Name>
    }

    equals(other: RefKey): boolean {
        if (other == null) {
            return false
        }
        if (typeof other !== "object") {
            return false
        }
        return this.kind.equals(other.kind) && this.name === other.name
    }

    toString() {
        return this.string
    }
}
