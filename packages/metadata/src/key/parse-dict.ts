import type { Dictx } from "./types"
import { ValueKey, SectionKey, SomeKey } from "./repr"
import { parseOuterKey, parseInnerKey } from "./parse-key"
import { Map } from "immutable"

export function parsePlainObject(input: Dictx.Full) {
    const map = Map<ValueKey, string>()
    for (const [key, value] of Object.entries(input)) {
        const outer = parseOuterKey(key)
        if (outer instanceof SectionKey) {
            if (typeof value !== "object") {
                throw new Error(`Expected object for section key ${key}`)
            }
            for (const [kk, vv] of Object.entries(value)) {
                const inner = parseInnerKey(kk)
                if (typeof vv !== "string") {
                    throw new Error(`Expected string value for inner key ${kk}`)
                }
                map.set(outer.toFullKey(inner), vv as string)
            }
        } else {
            if (typeof value !== "string") {
                throw new Error(`Expected string value for key ${key}`)
            }
            map.set(outer, value as string)
        }
    }
    return map
}
