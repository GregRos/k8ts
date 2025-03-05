import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"

export abstract class Base<Props extends object = object> {
    abstract readonly kind: string
    constructor(
        readonly meta: Meta,
        readonly props: Props
    ) {}

    get name() {
        return this.meta.get("name")
    }

    setMeta(f: (m: Meta) => Meta): this {
        const myClone = clone(this) as any
        myClone["meta"] = f(this.meta)
        return myClone
    }

    abstract manifest(): object
}

export const KEY = Symbol("KEY")
export type KEY = typeof KEY
export type RefSpec<Kind extends string = string, Name extends string = string> = `${Kind}:${Name}`

export interface Refable<Key extends RefSpec = RefSpec> {
    [KEY]: Key
}

export type RefableOf<Thing extends Base, Name extends string> = Thing &
    RefSpec<Thing["kind"], Name>
