import type { Base } from "../node/base"

export const KEY = Symbol("KEY")
export type KEY = typeof KEY

export type RefSpec<Kind extends string = string, Name extends string = string> = `${Kind}:${Name}`

export interface Refable<Key extends RefSpec = RefSpec> {
    [KEY]: Key
}

export type RefableOf<Thing extends Base, Name extends string> = Thing &
    Refable<RefSpec<Thing["kind"], Name>>
