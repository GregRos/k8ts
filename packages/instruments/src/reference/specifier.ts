import { InstrumentsError } from "../error"
import { Reference } from "./reference"
import type { InputReference } from "./types"

export class ReferenceKey {
    constructor(
        readonly kind: string,
        readonly name: string
    ) {}
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

    create<T extends object>(input: Omit<InputReference<T>, "kind" | "name">) {
        return Reference.create({
            ...input,
            kind: this.kind,
            name: this.name
        })
    }
}
