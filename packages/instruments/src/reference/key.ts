import { hash } from "immutable"
import { InstrumentsError } from "../error"
export type ReferenceKey<
    Kind extends string = string,
    Name extends string = string
> = ReferenceKey.ReferenceKey<Kind, Name>
export namespace ReferenceKey {
    export type Input = ReferenceKey | ReferenceKey["string"]
    export type Format<Kind extends string, Name extends string> = `${Kind}/${Name}`
    const separator = "/"
    export class ReferenceKey<Kind extends string = string, Name extends string = string> {
        constructor(
            readonly kind: Kind,
            readonly name: Name
        ) {}

        get string(): Format<Kind, Name> {
            return `${this.kind}${separator}${this.name}`
        }

        equals(other_: ReferenceKey | string): boolean {
            const other = tryParse(other_)
            if (other == null) {
                return false
            }
            if (typeof other !== "object") {
                return false
            }
            return this.kind === other.kind && this.name === other.name
        }
        hashCode() {
            return hash(this.string)
        }
        toString() {
            return this.string
        }
    }
    export function make<Kind extends string, Name extends string>(
        kind: Kind,
        name: Name
    ): ReferenceKey<Kind, Name> {
        return new ReferenceKey(kind, name)
    }
    export function parse(ref: string | ReferenceKey): ReferenceKey {
        const result = tryParse(ref)
        if (!result) {
            throw new InstrumentsError(`Could not parse reference key: ${ref}`)
        }
        return result
    }

    export function tryParse(ref: unknown): ReferenceKey | undefined {
        if (typeof ref !== "string" && typeof ref !== "object") {
            return undefined
        }
        if (ref == null) {
            return undefined
        }
        if (ref instanceof ReferenceKey) {
            return ref
        }
        if (typeof ref === "object") {
            return undefined
        }
        const [kind, name] = ref.split(separator).map(s => s.trim())
        if (!kind || !name) {
            return undefined
        }
        return new ReferenceKey(kind, name)
    }
}
