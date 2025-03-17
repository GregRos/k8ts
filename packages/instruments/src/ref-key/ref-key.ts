import { hash } from "immutable"
import { Kind } from "../api-kind"
import { InstrumentsError } from "../error"
export type RefKey<Kind extends string = string, Name extends string = string> = RefKey.RefKey<
    Kind,
    Name
>
export namespace RefKey {
    export function make<K extends string, Name extends string>(
        kind: Kind.Identifier<K>,
        name: Name
    ): RefKey<K, Name> {
        return new RefKey(kind, name)
    }
    export type Input = RefKey | RefKey["string"]
    export type Format<Kind extends string, Name extends string> = `${Kind}/${Name}`
    const separator = "/"
    export interface Parsed {
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

    export function tryParse(ref: string): Parsed | undefined {
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
    export class RefKey<K extends string = string, Name extends string = string> {
        constructor(
            readonly kind: Kind.Identifier<K>,
            readonly name: Name
        ) {}

        get string(): RefKey.Format<K, Name> {
            return [this.kind.name, this.name].join(separator) as Format<K, Name>
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
        hashCode() {
            return hash(this.string)
        }
        toString() {
            return this.string
        }
    }
}
