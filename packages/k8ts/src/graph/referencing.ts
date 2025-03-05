export const KEY = Symbol("KEY")
export type KEY = typeof KEY

export interface Refable<Key extends RefSpec = RefSpec> {
    [KEY]: Key
}
