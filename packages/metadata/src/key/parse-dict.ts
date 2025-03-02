import { Map } from "immutable"
import { parseInnerKey, parseOuterKey } from "./parse-key"
import { SectionKey, ValueKey } from "./repr"
import type { Dictx } from "./types"

export function parsePlainObject(input: Dictx.Full) {
    let map = Map<ValueKey, string>()
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
                map = map.set(outer.toFullKey(inner), vv as string)
            }
        } else {
            if (typeof value !== "string") {
                throw new Error(`Expected string value for key ${key}`)
            }
            map = map.set(outer, value as string)
        }
    }
    return map
}
