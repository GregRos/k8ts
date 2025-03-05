import { InstrumentsError } from "../error"
import { Reference } from "./reference"
import type { InputReference } from "./types"

export type InputReferenceKey = ReferenceKey | ReferenceKey["string"]
export class ReferenceKey<Kind extends string = string, Name extends string = string> {
    constructor(
        readonly kind: Kind,
        readonly name: Name
    ) {}

    get string(): `${Kind}:${Name}` {
        return `${this.kind}:${this.name}`
    }

    equals(other: ReferenceKey | string): boolean {
        other = typeof other === "string" ? ReferenceKey.parse(other) : other
        return this.kind === other.kind && this.name === other.name
    }
    toString() {
        return `${this.kind}:${this.name}`
    }

    static parse(ref: string) {
        const [kind, name] = ref.split(":").map(s => s.trim())
        if (!kind || !name) {
            throw new InstrumentsError(`Invalid ref spec: ${ref}`)
        }
        return new ReferenceKey(kind, name)
    }

    create<T extends object>(input: Omit<InputReference<T>, "key">) {
        return Reference.create({
            ...input,
            key: this
        })
    }
}
