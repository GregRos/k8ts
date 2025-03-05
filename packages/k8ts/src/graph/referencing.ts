import { MakeError } from "../error"
import type { Base } from "./base"

export const KEY = Symbol("KEY")
export type KEY = typeof KEY

export class RefSpecifier {
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
            throw new MakeError(`Invalid ref spec: ${ref}`)
        }
        return new RefSpecifier(kind, name)
    }
}

export type RefSpec<Kind extends string = string, Name extends string = string> = `${Kind}:${Name}`

export interface Refable<Key extends RefSpec = RefSpec> {
    [KEY]: Key
}

export type RefableOf<Thing extends Base, Name extends string> = Thing &
    Refable<RefSpec<Thing["kind"], Name>>
